// magic string replacement

class MagicStrings {
    constructor() {
        this._magic = {};
        this._reverse = {};
        this._rec_clean = {
            "contact": {
                activated_time: null,
                trial_end_time: null,
                dialog_id: ['dlg', 'display_name'],
                fleep_address: ['fladdr', 'display_name'],
                email: ['email', 'display_name'],
                account_id: ['account', 'display_name'],
                sort_rank: null,
                activity_time: null,
            },
            "label": {
                index: null,
                label_id: ['label', 'label'],
            },
            "conv": {
                cmail: ['cmail', 'topic', 'default_topic'],
                conversation_id: ['conv', 'topic', 'default_topic'],
                autojoin_url: ['autojoin', 'topic', 'default_topic'],
                inbox_time: null,
                last_message_time: null,
            },
            "org_conv": {
                cmail: ['cmail', 'topic', 'default_topic'],
                conversation_id: ['conv', 'topic', 'default_topic'],
                autojoin_url: ['autojoin', 'topic', 'default_topic'],
                managed_time: null,
            },
            "message": {
                posted_time: null,
            },
            "hook": {
                hook_url: ['url', 'hook_name'],
                hook_id: ['id', 'hook_name'],
                hook_key: ['key', 'hook_name'],
                avatar_urls: ['avatar', 'hook_name']
            },
            "team": {
                team_id: ['team', 'team_name'],
                autojoin_url: ['autojoin', 'team_name'],
            },
            "org_header": {
                organisation_id: ['org', 'organisation_name'],
                trial_time: null,
            },
            "org_changelog": {
                organisation_id: ['org', 'organisation_name'],
                event_time: null,
            },
            "reminder": {
                reminder_id: ['reminder', 'mk_reminder_type'],
                expire_time: null,
                remind_time: null,
            },
        };
    }

    // remember magic strings
    register(kind, value, ref) {
        if (!value) {
            return;
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
            if (ret.length > 0 && typeof ret[0] === 'string') {
                ret.sort();
            }
            return ret;
        } else {
            let ret = {};
            let cur_magic = magic_fields;
            if (obj.mk_rec_type && this._rec_clean[obj.mk_rec_type]) {
                cur_magic = this._rec_clean[obj.mk_rec_type];
            }
            for (let k in obj) {
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
                            for (let i = 1; i < info.length; i++) {
                                let ref = info[i];
                                if (obj[ref]) {
                                    this.register(info[0], val, obj[ref]);
                                    ret[k] = this._magic[val];
                                    break;
                                }
                            }
                            if (!ret[k]) {
                                // no match?
                                ret[k] = val;
                            }
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

