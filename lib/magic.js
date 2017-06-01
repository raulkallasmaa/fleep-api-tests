// magic string replacement

// create replacer funciton
function replaceField(desc, ref1, ref2) {
    let refs = [].slice.call(arguments, 1);
    return function (magic, rec, val) {
        let i, ref;
        for (i = 0; i < refs.length; i++) {
            ref = rec[refs[i]];
            if (ref && typeof ref === 'string') {
                magic.register(desc, val, ref);
                return magic.clean(val);
            }
        }
        return val;
    };
}

// create json decoder for system messages
function decodeMessage() {
    return function (magic, rec, val) {
        if (val[0] === '{') {
            return magic.clean(JSON.parse(val));
        }
        return val;
    };
}

//
// mk_rec_type -> cleanup params
//
// key -> null : replace with "..."
// key -> [desc, refkey1, ...]   use value from rec[refkey1] to clean value
//
let REC_CLEAN = {
    "contact": {
        activated_time: null,
        trial_end_time: null,
        dialog_id: replaceField('dlg', 'display_name'),
        fleep_address: replaceField('fladdr', 'display_name'),
        email: replaceField('email', 'display_name'),
        account_id: replaceField('account', 'display_name', 'email'),
        sort_rank: null,
        activity_time: null,
    },
    "label": {
        index: null,
        label_id: replaceField('label', 'label'),
    },
    "conv": {
        cmail: replaceField('cmail', 'topic', 'default_topic'),
        conversation_id: replaceField('conv', 'topic', 'default_topic'),
        autojoin_url: replaceField('autojoin', 'topic', 'default_topic'),
        inbox_time: null,
        last_message_time: null,
    },
    "org_conv": {
        cmail: replaceField('cmail', 'topic', 'default_topic'),
        conversation_id: replaceField('conv', 'topic', 'default_topic'),
        autojoin_url: replaceField('autojoin', 'topic', 'default_topic'),
        managed_time: null,
    },
    "message": {
        posted_time: null,
        pin_weight: null,
        edited_time: null,
        message: decodeMessage(),
    },
    "hook": {
        hook_url: replaceField('url', 'hook_name'),
        hook_id: replaceField('id', 'hook_name'),
        hook_key: replaceField('key', 'hook_name'),
        avatar_urls: replaceField('avatar', 'hook_name')
    },
    "team": {
        team_id: replaceField('team', 'team_name'),
        autojoin_url: replaceField('autojoin', 'team_name'),
        managed_time: null,
    },
    "org_header": {
        organisation_id: replaceField('org', 'organisation_name'),
        trial_time: null,
    },
    "org_changelog": {
        organisation_id: replaceField('org', 'organisation_name'),
        event_time: null,
    },
    "reminder": {
        reminder_id: replaceField('reminder', 'mk_reminder_type'),
        expire_time: null,
        remind_time: null,
    },
    "lastseen": {
        activity_time: null,
    },
    "poke": {
        message_nr: null,
    }
};

function paddy(n, p, c) {
    let pad_char = typeof c !== 'undefined' ? c : '0';
    let pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
}

function get_sort_key(rec) {
    switch (rec.mk_rec_type) {
    case 'org_header':      return '01 ' + rec['organisation_id'];
    case 'contact':         return '02 ' + rec['account_id'];
    case 'team':            return '03 ' + rec['team_id'];
    case 'label':           return '04 ' + rec['label_id'];
    case 'conv':            return '05 ' + rec['conversation_id'];
    case 'hook':            return '06 ' + rec['conversation_id'] + ' ' + rec['hook_key'];
    case 'message':         return '07 ' + rec['conversation_id'] + ' ' + paddy(rec['message_nr'], 9);
    case 'activity':        return '08 ' + rec['conversation_id'] + ' ' + rec['account_id'];
    case 'file':            return '09 ' + rec['conversation_id'] + ' ' + rec['attachment_id'];
    case 'lock':            return '10 ' + rec['conversation_id'] + ' ' + paddy(rec['message_nr'], 9);
    case 'request':         return '11 ' + rec['client_req_id'];
    case 'reminder':        return '13 ' + rec['reminder_id'];
    case 'org_member':      return '14 ' + rec['organisation_id'] + ' ' + rec['account_id'];
    case 'org_conv':        return '15 ' + rec['organisation_id'] + ' ' + rec['conversation_id'];
    case 'org_changelog':   return '16 ' + rec['organisation_id'] + ' ' + (10000 - rec['version_nr']);
    default:                return '17 ';
    }
}

function cmp_object(a, b) {
    let xa = get_sort_key(a) + ':' + JSON.stringify(a);
    let xb = get_sort_key(b) + ':' + JSON.stringify(b);
    if (xa < xb) {
        return -1;
    } else if (xa > xb) {
        return 1;
    }
    return 0;
}

class MagicStrings {
    constructor() {
        this._magic = {};
        this._reverse = {};
    }

    // remember magic strings
    register(kind, value, ref) {
        if (!value) {
            return;
        }

        // email accounts have email in display_name
        // if ref is already registered, extract ref from old value
        if (ref in this._magic) {
            ref = this._magic[ref].replace(/<.*:(.*)>/, '$1');
        }

        let alt = `<${kind}:${ref}>`;
        this._magic[value] = alt;
        this._reverse[alt] = value;
    }

    // return raw value for alt string
    getMagic(alt) {
        return this._reverse[alt];
    }

    // clean response object
    clean(obj, magic_fields) {
        if (obj == null) {
            return obj;
        } else if (typeof obj === "string") {
            if (obj in this._magic) {
                return this._magic[obj];
            }
            return obj;
        } else if (typeof obj !== "object") {
            return obj;
        } else if (Array.isArray(obj)) {
            let ret = [];
            for (let i = 0; i < obj.length; i++) {
                ret.push(this.clean(obj[i], magic_fields));
            }
            if (ret.length > 1) {
                if (typeof ret[0] === 'string') {
                    ret.sort();
                } else if (typeof ret[0] === 'object') {
                    if (1) { ret.sort(cmp_object); }
                }
            }
            return ret;
        } else {
            let ret = {};
            let cur_magic = magic_fields;
            if (obj.mk_rec_type && REC_CLEAN[obj.mk_rec_type]) {
                cur_magic = REC_CLEAN[obj.mk_rec_type];
            }
            let xkeys = Object.keys(obj);
            xkeys.sort();
            for (let j = 0; j < xkeys.length; j++) {
                let k = xkeys[j];
                if (!obj.hasOwnProperty(k)) {
                    continue;
                }
                let val = obj[k];
                if (typeof val !== "object") {
                    if (val in this._magic) {
                        ret[k] = this._magic[val];
                        continue;
                    } else if (cur_magic != null && k in cur_magic) {
                        let info = cur_magic[k];
                        if (info == null) {
                            ret[k] = "...";
                        } else {
                            if (typeof info !== 'function') {
                                info = replaceField.apply(null, info);
                            }
                            ret[k] = info(this, obj, val);
                        }
                        continue;
                    }
                }
                ret[k] = this.clean(val, magic_fields);
            }
            return ret;
        }
    }
}

export { MagicStrings };

