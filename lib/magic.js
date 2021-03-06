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
        return magic.clean(val);
    };
}

// create json decoder for system messages
function decodeJSON(desc, ref1, ref2) {
    return function (magic, rec, val) {
        if (val[0] === '{') {
            val = JSON.parse(val);
            if (desc) {
                let refval = rec[ref1] || rec[ref2];
                if (refval && val && typeof val === 'object' && !Array.isArray(val)) {
                    let cleaned = {};
                    for (let k in val) {
                        if (typeof val[k] === 'string') {
                            magic.register(desc + '_' + k, val[k], refval);
                        }
                        cleaned[k] = magic.clean(val[k]);
                    }
                    return cleaned;
                }
            }
        }
        return magic.clean(val);
    };
}

// create json decoder for system messages
function decodeXMLJSON() {
    let jsonhelper = decodeJSON();
    return function (magic, rec, val) {
        if (val[0] === '{') {
            return jsonhelper(magic, rec, val);
        } else if (typeof val === 'string') {
            return val.replace(/[=]"([^"]+)"/g, function (m, arg) {
                if (arg in magic._magic) {
                    return '="' + magic._magic[arg] + '"';
                }
                return m;
            });
        }
        return magic.clean(val);
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
        activity_time: null,
        avatar_urls: decodeJSON('avatar', 'display_name', 'email'),
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
        message: decodeXMLJSON(),
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
        grace_time: null,
        active_member_count: null,
        avatar_urls: decodeJSON('avatar', 'organisation_name'),
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
    },
    "section": {
        section_id: replaceField('section', 'name'),
    },
    "request": {
        client_req_id: null,
    },
    "billing": {
        organisation_id: replaceField('org', 'organisation_name'),
    },
    "mail": {
        mail_id: replaceField('mlink', 'mail_address'),
        imap_username: replaceField('imapuser', 'mail_address'),
        smtp_username: replaceField('smtpuser', 'mail_address'),
        imap_host: replaceField('imaphost', 'mail_address'),
        smtp_host: replaceField('smtphost', 'mail_address'),
    },
    "activity": {
        activity_time: null,
    },
    "file": {
        attachment_id: replaceField('att_id', 'file_name'),
        file_url: replaceField('file_url', 'file_name'),
        posted_time: null,
        thumb_url_100: replaceField('thumb100', 'file_name'),
        thumb_url_50: replaceField('thumb50', 'file_name'),
        thumb_url_575: replaceField('thumb575', 'file_name'),
    },
    "upload": {
        request_id: replaceField('req_id', 'name'),
        upload_url: replaceField('upload_url', 'name'),
    },
};

function paddy(num, padlen, padchar) {
    let s = num + '';
    let len = Math.max(padlen, s.length);
    let padded = (padchar || '0').repeat(len) + s;
    return padded.substr(padded.length - len);
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
    case 'section':         return '17 ' + rec['conversation_id'] + ' ' + rec['section_id'];
    case 'billing':         return '18 ' + rec['organisation_id'];
    default:                return '99 ' + rec.mk_rec_type;
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
                    let NO_UPDATES = true;
                    if (NO_UPDATES && val in this._magic) {
                        ret[k] = this._magic[val];
                        continue;
                    } else if (cur_magic != null && k in cur_magic) {
                        let info = cur_magic[k];
                        if (info == null) {
                            ret[k] = "...";
                            continue;
                        } else {
                            if (typeof info !== 'function') {
                                info = replaceField.apply(null, info);
                            }
                            ret[k] = info(this, obj, val);
                        }
                        continue;
                    }

                    if (val in this._magic) {
                        ret[k] = this._magic[val];
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

