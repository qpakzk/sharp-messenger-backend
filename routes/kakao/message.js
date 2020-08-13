const express = require('express');
const console = require('better-console');
const axios = require('axios');
const qs = require('qs');
const { encrypt, decrypt } = require('../../lib/crypto');
const { mint, transferFrom } = require('../../fabric/invoke');
const { query } = require('../../fabric/query');
const { response } = require('express');

const router = express.Router();

const HOST = 'http://localhost:8888';
const KAKAO_API = 'https://kapi.kakao.com';

const tokenType = 'message';

router.post('/', (req, res) => {
  const { session } = req;
  const { access_token } = session.authData.kakao;

  const { content } = req.body;
  console.info('==== content ====');
  console.log(content);

  const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const encrypted_content = encrypt(content, key);

  const userId = session.authData.kakao.id.toString();
  const timestamp = Date.now();
    
  const xattr = {
    'from': userId,
    'to': userId,
    'date': new Date(timestamp),
    'key': key,
  };

  const uri = {
    'path': '',
    'hash': '',
  };

  console.info('==== mint ====');
  console.log(`tokenId=${timestamp},tokenType=${tokenType},owner=${userId},xattr=${JSON.stringify(xattr)},uri=${JSON.stringify(uri)}`);
  mint(timestamp, tokenType, userId, xattr, uri);

  const full_content = `[Token ID] ${timestamp} [Encrypted Message] ${encrypted_content}`;
  console.info('==== full_content ====');
  console.log(full_content);
  
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
    res.redirect('/me');
  })
  .catch(error => {
    console.error(error);
    res.json(error);
  });
});


router.post('/friends', (req, res) => {
  const { session } = req;
  const { access_token } = session.authData.kakao;

  const { content, uuid, id } = req.body;
  console.info('==== content ====');
  console.log(content);
  console.info('==== uuid ====');
  console.log(uuid);
  console.info('==== id ====');
  console.log(id);

  const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const encrypted_content = encrypt(content, key);

  const userId = session.authData.kakao.id.toString();
  const timestamp = Date.now();
    
  const xattr = {
    'from': userId,
    'to': id,
    'date': new Date(timestamp),
    'key': key,
  };

  const uri = {
    'path': '',
    'hash': '',
  };

  console.info('==== mint ====');
  console.log(`tokenId=${timestamp},tokenType=${tokenType},owner=${userId},xattr=${JSON.stringify(xattr)},uri=${JSON.stringify(uri)}`);
  mint(timestamp, tokenType, userId, xattr, uri);

  const full_content = `[Token ID] ${timestamp} [Encrypted Message] ${encrypted_content}`;

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
    res.redirect('/friends');
  })
  .catch(error => {
    console.error(error);
    res.json(error);
  });
});

router.post('/friends/decryption', async (req, res) => {
  const { encrypted, tokenID } = req.body;
  const userId = req.session.authData.kakao.id.toString();

  try {
    const token = await query(userId, tokenID);
    console.info('==== query ====');
    console.log(`userId=${userId},tokenId=${tokenID}`);
    console.log(`query return value=${token}`);

    const tokenObj = JSON.parse(token); 
    const { key } = tokenObj.xattr;
    const decrypted_content = decrypt(encrypted, key);

    res.redirect(`/decrypt?decrypted=${decrypted_content}`);
  } catch (error) {
    console.error(error);
    res.json(error);
  }
});

  module.exports = router;