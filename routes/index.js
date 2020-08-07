const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  const { session } = req;
  if (session.authData && session.authData['kakao']) {
    const { nickName } = req.query;
    
    res.locals.nickName = '';
    if (nickName) {
      res.locals.nickName = nickName;
    }
    
    res.render('main')
  } else {
    res.render('login')
  }
});

router.get('/me', (req, res) => {
  res.render('me');
});

router.get('/friends', (req, res) => {
  const { friendsResponse } = req.session;
  console.info('==== friendsRespones ====');
  console.log(friendsResponse);

  res.locals.friends = [];
  if (friendsResponse) {
    res.locals.friends = friendsResponse.elements;
  }

  res.render('friends');
});

router.get('/decrypt', (req, res) => {
  const { decrypted } = req.query;

  res.locals.decrypted = '';
  if (decrypted) {
    res.locals.decrypted = decrypted;
  }
  res.render('decrypt');
});

module.exports = router;