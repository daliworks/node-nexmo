'use strict';

var nexmo = require('./');

nexmo.init({
  secret: 'your_secret_key',
  key: 'your_api_key',
});

nexmo.send({
  to: '01000000000',
  from: '0200000000', // your number
  type: 'SMS',
  text: '테스트  test .. abcdeef .....efer 테스트 입니다',
}, function (err, result) {
  console.log('result err=%s, result', err, result);
});
