const express = require('express');
const console = require('better-console');
const axios = require('axios');
const qs = require('qs');
const { encrypt, decrypt } = require('../../lib/crypto');
//const { friends_list } = require('./users');

const router = express.Router();

const HOST = 'http://localhost:8888';
const KAKAO_API = 'https://kapi.kakao.com';

router.post('/', (req, res) => {
    const { session } = req;
    const { access_token } = session.authData.kakao;

    const { content } = req.body;
    const encrypted_content = encrypt(content);
    const full_content = `[Encrypted Message] ${encrypted_content}`;

    axios({
      method: 'POST',
      url: `${KAKAO_API}/v2/api/talk/memo/default/send`,
      headers: {
        Authorization: `Bearer ${access_token}`
      },
      data: qs.stringify({'template_object':
        `{
          "object_type": "text",
          "text": "${full_content}",
          "link": {
            "web_url": "${HOST}"
          },
          "button_title": "바로 확인"
        }`})
    })
    .then(response => {
      console.info("==== response.data ====");
      console.log(response.data);
      res.redirect('/');
    })
    .catch(error => {
      console.error(error);
      res.json(error);
    });
  });


  router.post('/friends', (req, res) => {
    const { session } = req;
    const { access_token } = session.authData.kakao;
  
    const { content, uuid } = req.body;
    const encrypted_content = encrypt(content);
    const full_content = `[Encrypted Message] ${encrypted_content}`;
  
    axios({
      method: 'POST',
      url: `${KAKAO_API}/v1/api/talk/friends/message/default/send`,
      headers: {
        Authorization: `Bearer ${access_token}`
      },
      data: qs.stringify({
        "receiver_uuids": `["${uuid}"]`,
        "template_object":`{
          "object_type": "text",
          "text": "${full_content}",
          "link": {
            "web_url": "${HOST}"
          },
          "button_title": "바로 확인"
        }`})
    })
    .then(response => {
      console.info("==== response.data ====");
      console.log(response.data);
      res.redirect('/');
    })
    .catch(error => {
      console.error(error);
      res.json(error);
    });
  });
  
  router.post('/friends/decryption', (req, res) => {
    const { session } = req;
    const { access_token } = session.authData.kakao;

    const { encrypted, uuid } = req.body;
    const decrypted_content = decrypt(encrypted);
    const full_content = `[Decrypted Message] ${decrypted_content}`;
  
    axios({
      method: 'POST',
      url: `${KAKAO_API}/v1/api/talk/friends/message/default/send`,
      headers: {
        Authorization: `Bearer ${access_token}`
      },
      data: qs.stringify({
        "receiver_uuids": `["${uuid}"]`,
        "template_object": `{
          "object_type": "text",
          "text": "${full_content}",
          "link": {
            "web_url": "${HOST}"
          },
          "button_title": "바로 확인"
        }`})
    })
    .then(response => {
      console.info("==== response.data ====");
      console.log(response.data);
      res.redirect('/');
    })
    .catch(error => {
      console.error(error);
      res.json(error);
    });
  });

  module.exports = router;