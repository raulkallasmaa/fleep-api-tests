
import { thenSequence } from '../lib/utils';

// nodejs uses c-ares, fails to resolve NS records, crashes on fast server change
import dns from 'dns';

// purejs resolver, does not parse NS records
import dns_socket from 'dns-socket';
import dns_packet from 'dns-packet';

let lookupAsync = Promise.promisify(dns.lookup);

// current io nameservers, may change in time
//let IONS = ["a0.nic.io", "b0.nic.io", "c0.nic.io", "ns-a1.io", "ns-a2.io", "ns-a3.io", "ns-a4.io"];
let IONS = ["a0.nic.io", "a2.nic.io", "b0.nic.io", "c0.nic.io", "ns-a1.io", "ns-a3.io"];

// current fleep.io nameservers, set by us
let FLEEPNS = [
    'ns-1144.awsdns-15.org',
    'ns-1916.awsdns-47.co.uk',
    'ns-451.awsdns-56.com',
    'ns-754.awsdns-30.net',
];

// current fleep.io server ips
let FLEEPIP = ['54.72.29.147'];

let resolver = dns_socket();
resolver.queryAsync = Promise.promisify(resolver.query);

// recover original response buffer to be able to parse NS records
let rqueue = [];
resolver._onmessage_orig = resolver._onmessage;
resolver._onmessage = function (buffer, rinfo) {
    try {
        let message = dns_packet.decode(buffer);
        rqueue.push({msg: message, buf: buffer, rinfo: rinfo});
    } catch (err) {}
    return this._onmessage_orig(buffer, rinfo);
};

function recoverBuffer(res) {
    for (let i = rqueue.length - 1; i >= 0; i--) {
        if (rqueue[i].msg.id === res.id) {
            return rqueue[i].buf;
        }
    }
    throw new Error("recoverBuffer - buf not found");
}

// cache for server ips
let cache = {};

function cachelist(adrs) {
    return thenSequence(adrs.map((adr) =>
        () => lookupAsync(adr, 4)
            .then((ip) => {
                expect(ip != null).toEqual(true);
                cache[adr] = ip;
            })));
}

// parse domain name in DNS packet
function parsedname(buf, pos, msgBuf, rec) {
    /*eslint no-bitwise:0 */
    let res = [];
    if (rec > 5) {
        throw new Error('parse error - recursion');
    }
    while (true) {
        if (pos >= buf.length) {
            throw new Error('parse error - no eof');
        }
        let tag = buf.readUInt8(pos++);
        if (!tag) {
            break;
        } else if (tag < 64) {
            if (tag + pos > buf.length) {
                throw new Error('parse error - long str');
            }
            res.push(buf.toString('utf8', pos, pos + tag));
            pos += tag;
        } else if ((tag & 0xC0) === 0xC0) {
            let ofs = ((tag & 0x3F) << 8) | buf.readUInt8(pos++);
            res.push(parsedname(msgBuf, ofs, msgBuf, rec + 1));
            break;
        } else {
            throw new Error('parse error - bad tag');
        }
    }
    return res.join('.');
}

// parse NS response
function parseNS(result) {
    let buf = recoverBuffer(result);
    let ans = result.authorities;
    if (!ans || !ans.length) {
        ans = result.answers;
    }
    expect(result.type).toEqual('response');
    expect(ans.length > 0).toEqual(true);
    return ans.map((rec) => parsedname(rec.data, 0, buf, 0));
}

// query NS records for domain
function loadNS(ns, dom, exp, authOnly) {
    let question = { type: 'NS', name: dom };
    let query = {questions: [question]};
    if (authOnly) {
        query.flags = 0; // disable recursion
    }
    let p = Promise.resolve();
    if (cache[ns] == null) {
        p = p.then(() => cachelist([ns]));
    }
    return p.then(() => {
        expect(cache[ns] != null).toEqual(true);
        //console.warn('queryAsync/NS', dom, '@', ns);
        return resolver.queryAsync(query, 53, cache[ns])
            .then((lst) => {
                //console.warn('result', lst);
                let nslist = parseNS(lst);
                nslist.sort();
                if (exp) {
                    expect(nslist).toEqual(exp);
                }
                return nslist;
            });
    });
}

// query A records for domain
function loadA(ns, dom, exp, authOnly) {
    let question = { type: 'A', name: dom };
    let query = {questions: [question]};
    if (authOnly) {
        query.flags = 0; // disable recursion
    }
    expect(cache[ns] != null).toEqual(true);
    //console.warn('queryAsync/A', dom, '@', ns);
    return resolver.queryAsync(query, 53, cache[ns])
        .then((res) => {
            //console.warn('result', res);
            expect(res.type).toEqual('response');
            let alist = res.answers.map((rec) => rec.data);
            alist.sort();
            if (exp) {
                expect(alist).toEqual(exp);
            }
            return alist;
        });
}

test("fleep.io dns", function () {
    return thenSequence([
        () => cachelist(['google-public-dns-a.google.com']),
        () => cachelist(IONS),
        () => cachelist(FLEEPNS),
        () => loadNS('google-public-dns-a.google.com', 'io', null),
        (ions) => {
            let exp = JSON.stringify(IONS);
            let got = JSON.stringify(ions);
            if (exp !== got) {
                console.warn("IONS:\n  exp=%s\n  got=%s", exp, got);
            }

            let seq = [];
            ions.forEach((ns) => {
                seq.push(() => loadNS(ns, 'fleep.io', FLEEPNS, true));
            });
            FLEEPNS.forEach((ns) => {
                seq.push(() => loadA(ns, 'fleep.io', FLEEPIP, true));
            });
            return thenSequence(seq);
        }
    ])
    .finally(() => { resolver.destroy(); resolver = null; });
});

