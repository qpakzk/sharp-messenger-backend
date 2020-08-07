const express = require('express');
const console = require('better-console');
const axios = require('axios');
const qs = require('qs');

const router = express.Router();

const APP_KEY = process.env.APP_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const HOST = 'http://localhost:8888';
const REDIRECT_URL = `${HOST}/kakao/users/friends/callback`;

const KAKAO_AUTH = 'https://kauth.kakao.com';
const KAKAO_API = 'https://kapi.kakao.com';

router.get('/profile', async (req, res) => {
    const { session } = req;
    const { access_token } = session.authData.kakao;

    let response;
    try {
        response = await axios({
            method: 'GET',
            url: `${KAKAO_API}/v1/api/talk/profile`,
            headers: {
                Authorization: `Bearer ${access_token}`
            }
      });
  
        console.info("==== response.data ====");
        console.log(response.data);
        res.redirect(`/?nickName=${response.data.nickName}`);
    } catch (error) {
        console.error(error);
        res.json(error);
    }
  });

router.get('/friends', (req, res) => {
    res.redirect(`${KAKAO_AUTH}/oauth/authorize?client_id=${APP_KEY}&redirect_uri=${REDIRECT_URL}&response_type=code&scope=friends`);
});
  
router.get('/friends/callback', async (req, res) => {
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
    console.info('==== access_token ====');
    console.log(access_token);

    let friendsResponse;
    try {
        friendsResponse = await axios({
            method: 'GET',
            url: `${KAKAO_API}/v1/api/talk/friends`,
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        console.info("==== friendsResponse.data ====");
        console.log(friendsResponse.data);
    } catch (error) {
        console.error(error);
        return res.json(error);
    }

    req.session.friendsResponse=friendsResponse.data;
    return res.redirect(`/friends`);
});
  
  module.exports = router;