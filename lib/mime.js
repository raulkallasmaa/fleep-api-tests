
import { debugLog } from './debug';

debugLog("mime.js 1");

import MimeParser from 'emailjs-mime-parser';

function parseMime(data) {
    let res = {
        headers: {}
    };
    let p = new MimeParser();

    function convAddrs(hdrs, name) {
        if (hdrs[name] == null) {
            return;
        }
        let alist = [];
        for (let i = 0; i < hdrs[name].length; i++) {
            let val = hdrs[name][i].value;
            if (Array.isArray(val)) {
                for (let j = 0; j < val.length; j++) {
                    let addr = val[j].address;
                    alist.push(addr);
                }
            } else {
                throw new Error("unknown value in convAddrs: " + name + " - " + JSON.stringify(hdrs[name]));
            }
        }
        res.headers[name] = alist;
    }

    function convText(hdrs, name) {
        if (hdrs[name] == null) {
            return;
        }
        let vlist = [];
        for (let i = 0; i < hdrs[name].length; i++) {
            let val = hdrs[name][i].value;
            if (typeof val === 'string') {
                vlist.push(val);
            } else {
                throw new Error("unknown value in convText: " + name + " - " + JSON.stringify(hdrs[name]));
            }
        }
        res.headers[name] = vlist.join('\n');
    }

    p.onheader = (node) => {
        convAddrs(node.headers, 'to');
        convAddrs(node.headers, 'cc');
        convAddrs(node.headers, 'from');
        convText(node.headers, 'subject');
        convText(node.headers, 'date');
        //res['headers'] = node.headers;
        // node.headers.from.value:  [ { address: 'support@dev7.fleep.ee', name: 'Fleep' } ]
        //console.log("node: ", node);
        //console.log("node.headers.from: ", node.headers.from[0]);
        //console.log("node.headers.from.value: ", node.headers.from[0].value);
    };
    p.onbodystructure = (node) => {
        //console.log("bodystructure node: ", node);
        //res['bodystructure'] = node;
    };
    p.onbody = (node) => {
        //console.log("body node: ", node);
        //res['body'] = node;
        let buf = Buffer.from(node.content);
        res.body = buf.toString('utf8').trim();
    };
    p.write(data);
    p.end();
    return res;
}

export { parseMime };

