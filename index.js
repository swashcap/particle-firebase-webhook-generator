'use strict';

const FirebaseTokenGenerator = require('firebase-token-generator');

/**
 * @param {Object} options
 * @returns {string}
 */
function template(options) {
    if (typeof options === 'undefined') {
        options = {};
    }

    const deviceId = options.deviceId;
    const eventName = options.eventName;
    const firebaseSecret = options.firebaseSecret;
    const firebaseUrl = options.firebaseUrl;
    const firebaseUser = options.firebaseUser;
    const method = options.method || 'POST';
    const myDevices = options.myDevices || false;

    if (!eventName) {
        throw new TypeError('Requires event name');
    }
    if (!firebaseSecret) {
        throw new TypeError('Requires Firebase secret');
    }
    if (!firebaseUrl) {
        throw new TypeError('Requires Firebase URL');
    }
    if (!firebaseUser) {
        throw new TypeError('Requires Firebase user ID');
    }

    const tokenGenerator = new FirebaseTokenGenerator(firebaseSecret);
    const token = tokenGenerator.createToken(
        { uid: firebaseUser },
        { expires: Date.now() + 365 * 24 * 60 * 60 * 1000 }
    );

    const output = {
        event: eventName,
        url: firebaseUrl + '?auth=' + token,
        requestType: method,
        json: {
            coreId: '{{SPARK_CORE_ID}}',
            data: '{{SPARK_EVENT_VALUE}}',
            event: eventName,
            publishedAt: '{{SPARK_PUBLISHED_AT}}',
        },
    };

    output.mydevices = myDevices ? true : false;

    return output;
}

module.exports = template;
