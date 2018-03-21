/*global escape: true*/
'use strict';

const Nexmo = require('nexmo');
const _ = require('lodash');

const CONFIG_KEYS = [ 'secret', 'key' ];
const TYPE_SMS = 'SMS';
const MAX_SMS_LENGTH = 90;

const NEXMO_SUCCESS = '0';
const NEXMO_THROTTLED = '1';
const NEXMO_INTERNAL_ERROR = '5';
const NEXMO_COMMUNICATION_FAIL = '13';
const NEXMO_RETRY_STATUS = [
  NEXMO_THROTTLED,
  NEXMO_INTERNAL_ERROR,
  NEXMO_COMMUNICATION_FAIL
];

let provider;

function getTextLength(str) {
  var len = 0;
  for (var i = 0; i < str.length; i++) {
    if (escape(str.charAt(i)).length === 6) {
      len++;
    }
    len++;
  }
  return len;
}

function getGlobalNumber(localNumber, countryCode) {
  var number = localNumber;

  if (_.startsWith(number, '0')) {
    number = number.substring(1);  // remove the first zero number.
  }

  return countryCode + number;
}

function init(config, cb) {
  if (!_.every(CONFIG_KEYS, key => _.get(config, key))) {
    return cb && cb(new Error('secret or key is missing'));
  }

  provider = new Nexmo({
    apiKey: config.key,
    apiSecret: config.secret
  });

  return cb && cb();
}

function send(body, cb) {
  let to = getGlobalNumber(body.to, body.countryCode);

  if (body.type === TYPE_SMS && getTextLength(body.text) > MAX_SMS_LENGTH) {
    return cb && cb(new Error('too long SMS messge'));
  }

  provider.message.sendSms(body.from, to, body.text, { type: 'unicode'}, (err, response) => {
    let msg;

    if (err) {
      return cb && cb(err);
    }

    msg = _.first(_.get(response, 'messages'));

    if (_.isUndefined(msg)) {
      return cb && cb(new Error('invalid response from Nexmo'));
    }

    if (msg.status === NEXMO_SUCCESS) {
      return cb && cb(null, response);
    } else {
      if (_.includes(NEXMO_RETRY_STATUS, msg.status)) {
        msg.code = 'RETRY';
      }

      return cb && cb(msg);
    }
  });
}

module.exports = {
  init: init,
  send: send
};
