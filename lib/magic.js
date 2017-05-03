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
                last_message_nr: null,
                read_message_nr: null,
                send_message_nr: null,
                show_message_nr: null,
                result_message_nr: null,
            },
            "message": {
                inbox_nr: null,
                prev_message_nr: null,
                message_nr: null,
                posted_time: null,

            }
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
//
    // return raw value for alt string
    get(alt) {
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

