
//
// run before jest init, setup promise impl
//

module.exports.NativePromise = global.Promise;

let Promise = require('bluebird');
Promise.config({
    warnings: true,
    longStackTraces: true,
    cancellation: true,
    monitoring: true,
});

module.exports.Promise = Promise;

global.Promise = Promise;

