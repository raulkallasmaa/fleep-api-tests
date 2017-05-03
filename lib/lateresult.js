
// object that allows to send result to promises
class LateResult {
    constructor() {
        this.waitList = [];
        this.result = null;
    }

    // internal use
    finalize(res) {
        if (this.waitList == null) {
            throw new Error("result already set");
        }
        let tmpList = this.waitList;
        this.waitList = null;
        this.result = res;
        for (let i = 0; i < tmpList.length; i++) {
            tmpList[i].resolve(this.result);
        }
    }

    // return promise that will be fulfilled with result later
    waitResult() {
        if (this.waitList == null) {
            return this.result;
        }
        return new Promise((resolve, reject) => {
            this.waitList.push({resolve: resolve, reject: reject});
        });
    }

    // send result to waiters
    sendResult(res) {
        this.finalize(Promise.resolve(res));
    }

    // send rejection to waiters
    sendReject(res) {
        this.finalize(Promise.reject(res));
    }

    reset() {
        this.waitList = [];
        this.result = null;
    }
}

export { LateResult };

