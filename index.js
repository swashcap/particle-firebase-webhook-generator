/* eslint object-shorthand:0, strict:0 */
'use strict';

const FirebaseTokenGenerator = require('firebase-token-generator');

/**
 * Template.
 * @module
 *
 * {@link https://docs.particle.io/guide/tools-and-features/webhooks/}
 * {@link https://www.firebase.com/docs/rest/guide/user-auth.html}
 *
 * @example
 * template({
 *   eventName: 'event_',
 *   firebaseSecret: 'xxx',
 *   firebaseUrl: 'https://my-hot-base.firebaseio.com/'
 *   firebaseUser: 'my-unique-id'
 * });
 *
 * // Returns:
 * {
 *   event: 'event_',
 *   url: 'https://my-hot-base.firebaseio.com/?auth=1234567890abcdef',
 *   requestType: 'POST',
 *   json: {
 *     "coreid": "{{SPARK_CORE_ID}}",
 *     "data": "{{SPARK_EVENT_VALUE}}",
 *     "event": "{{SPARK_EVENT_NAME}}",
 *     "published_at": "{{SPARK_PUBLISHED_AT}}"
 *   },
 *   mydevices: true,
 * }
 *
 * @param {Object} options
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
    throw new Error('Expected options to be an object.');
  }

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
    url: firebaseUrl + '?auth=' + token, // eslint-disable-line prefer-template
    requestType: method,
    json: {
      coreid: '{{SPARK_CORE_ID}}',
      data: '{{SPARK_EVENT_VALUE}}',
      event: '{{SPARK_EVENT_NAME}}',
      published_at: '{{SPARK_PUBLISHED_AT}}',
    },
  };

  output.mydevices = !!myDevices;

  return output;
}

module.exports = template;
