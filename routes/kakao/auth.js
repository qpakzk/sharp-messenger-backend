const express = require('express');
const console = require('better-console');
const qs = require('qs');
const axios = require('axios');

const router = express.Router();

const APP_KEY = process.env.APP_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const HOST = 'http://localhost:8888';
const REDIRECT_URL = `${HOST}/kakao/auth/callback`;

const KAKAO_AUTH = 'https://kauth.kakao.com';
const KAKAO_API = 'https://kapi.kakao.com';

router.get('/', (req, res) => {
  res.redirect(`${KAKAO_AUTH}/oauth/authorize?client_id=${APP_KEY}&redirect_uri=${REDIRECT_URL}&response_type=code`);
});

router.get('/callback', async (req, res) => {
  const { session, query } = req;
  const { code } = query;

  console.info("==== session ====");
  console.log(session);

  let tokenResponse;
  try {
    tokenResponse = await axios({
      method: 'POST',
      url: `${KAKAO_AUTH}/oauth/token`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify({
        grant_type: 'authorization_code',
        client_id: APP_KEY,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URL,
        code
      })
    });
    console.info('==== tokenResponse.data ====');
    console.log(tokenResponse.data);
  } catch (error) {
    console.error(error);
    return res.json(error);
  }

  const { access_token } = tokenResponse.data;

  let userResponse;
  try {
    userResponse = await axios({
      method: 'GET',
      url: `${KAKAO_API}/v2/user/me`,
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    console.info('==== userResponse.data ====');
    console.log(userResponse.data);
  } catch (error) {
    console.error(error);
    return res.json(error);
  }

  const authData = {
    ...tokenResponse.data,
    ...userResponse.data
  };

  linkUser(session, 'kakao', authData) ? console.info('계정에 연결되었습니다.') : console.warn('이미 연결된 계정입니다.');
  res.redirect(`/?nickName=${userResponse.data.properties.nickname}`);
});

router.get('/logout', async (req, res) => {
  const { session } = req;

  const { access_token } = session.authData.kakao;

  let response;
  try {
    response = await axios({
      method: 'POST',
      url: `${KAKAO_API}/v1/user/unlink`,
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    console.info('==== response.data ====');
    console.log(response.data);
  } catch (error) {
    console.error(error);
    return res.json(error);
  }

  const { id } = response.data;
  unlinkUser(session, 'kakao', id) ? console.log('연결이 해제되었습니다.') : console.log('카카오와 연동된 계정이 아닙니다.');
  
  res.redirect('/');
});

const linkUser = (session, provider, authData) => {
  if (session.authData) {
    if (session.authData[provider]) {
      return false;
    }
    session.authData[provider] = authData;
  } else {
    session.authData = {
      [provider]: authData
    };
  }
  return true;
}

function unlinkUser(session, provider, userId) {
  let result = false;
  if (session.authData && 
    session.authData[provider] &&
    session.authData[provider].id === userId) {
    delete session.authData[provider];
    result = true;
  }

  return result;
}

module.exports = router;
