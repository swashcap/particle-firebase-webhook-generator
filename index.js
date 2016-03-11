'use strict';

const FirebaseTokenGenerator = require('firebase-token-generator');

/**
 * Template.
 * @module
 *
 * {@link https://docs.particle.io/guide/tools-and-features/webhooks/}
 * {@link https://www.firebase.com/docs/rest/guide/user-auth.html}
 *
 * @param {Object} options
 * @param {string} options.deviceId Particle device’s ID
 * @param {string} options.eventName Particle device’s event name
 * @param {string} options.firebaseSecret Firebase app’s secret. Find it in your
 * app’s dashboard.
 * @param {string} options.firebaseUrl Firebase URL which the webhook should
 * hit. Make sure to put your full data path in here.
 * @param {string} options.firebaseUser
 * @param {string} [options.expiresIn=10 years] Microseconds from current time
 * in which the Firebase token will be valid.
 * @param {string} [options.method=POST] Webhook’s HTTP method.
 * @param {boolean} [options.myDevices=true] Whether to only hook in to events
 * from your devices.
 * {@link https://docs.particle.io/guide/tools-and-features/webhooks/#mydevices}
 * @returns {string} Formatted JSON webhook.
 */
function template(options) {
    if (typeof options === 'undefined') {
        options = {};
    }

    const deviceId = options.deviceId;
    const eventName = options.eventName;
    const expiresIn = options.expiresIn || 10 * 365.25 * 24 * 60 * 60 * 1000;
    const firebaseSecret = options.firebaseSecret;
    const firebaseUrl = options.firebaseUrl;
    const firebaseUser = options.firebaseUser;
    const method = options.method || 'POST';
    const myDevices = typeof options.myDevices === 'undefined' ?
        true :
        options.myDevices;

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
        { expires: Date.now() + expiresIn }
    );

    const output = {
        event: eventName,
        url: firebaseUrl + '?auth=' + token,
        requestType: method,
        json: {
            "coreid": "{{SPARK_CORE_ID}}",
            "data": "{{SPARK_EVENT_VALUE}}",
            "event": "{{SPARK_EVENT_NAME}}",
            "published_at": "{{SPARK_PUBLISHED_AT}}"
        },
    };

    output.mydevices = myDevices ? true : false;

    return output;
}

module.exports = template;
