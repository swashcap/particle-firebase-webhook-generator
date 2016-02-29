'use strict';

const assign = require('lodash.assign');
const mockery = require('mockery');
const tape = require('tape');
const template = require('./index.js');

function FirebaseTokenGeneratorMock(secret) {
    return {
        createToken: function(data, options) {
            return JSON.stringify(assign({}, data, options, secret));
        },
    };
}

function getValidOptions() {
    return {
        eventName: 'event-of-a-lifetime',
        firebaseSecret: 'abcdef1234567890',
        firebaseUrl: 'https://my-h0t-base.firebaseio.com/',
        firebaseUser: 'fireman',
    };
}

tape('setup', t => {
    mockery.enable();
    mockery.registerMock('FirebaseTokenGenerator', FirebaseTokenGeneratorMock);
    t.end();
});

tape('event name', t => {
    const eventName = 'my-crazy-event';

    t.throws(template, 'no event name throws');
    t.equal(
        template(assign(getValidOptions(), { eventName: eventName })).event,
        eventName,
        'passes event name'
    );
    t.end();
});

tape('Firebase secret', t => {
    const options = getValidOptions();


    const auth = template(options).url.match(/auth=(.*)$/)[1];

    auth.indexOf(options.firebaseSecret) !== -1


    delete options.firebaseSecret;

    t.throws(template.bind(null, options), 'errors without Firebase secret');

    t.end();
});

tape('Firebase URL', t => {
    const options = getValidOptions();
    const myUrl = 'https://super-wacky-datum.firebase.io';

    delete options.firebaseUrl;

    t.throws(template.bind(null, options), 'errors without Firebase URL');
    t.ok(
        template(
            assign(getValidOptions(), { firebaseUrl: myUrl })
        ).url.indexOf(myUrl) !== -1,
        'passes Firebase URL'
    );
    t.end();
});

tape('HTTP method', t => {
    t.equal(
        template(getValidOptions()).requestType,
        'POST',
        'sets default method to POST'
    );
    t.equal(
        template(assign(getValidOptions(), { method: 'PUT' })).requestType,
        'PUT',
        'passes method'
    );
    t.end();
});

tape('myDevices option', t => {
    const options = getValidOptions();

    t.equal(template(options).mydevices, false, 'mydevices defaults to false');
    t.equal(
        template(assign({}, options, { myDevices: true })).mydevices,
        true,
        'passes mydevices param'
    );
    t.end();
});

tape('teardown', t => {
    mockery.deregisterMock('FirebaseTokenGenerator');
    mockery.disable();
    t.end();
});
