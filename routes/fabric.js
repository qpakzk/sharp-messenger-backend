const express = require('express');
const { enrollAdmin, registerUser } = require('../fabric/user');
const { query } = require('../fabric/query');
//const { invoke } = require('../fabric/invoke');

const router = express.Router();

router.post('/admin', (req, res, next) => {
  enrollAdmin()
  .then(_ => {
    console.log('success enroll admin');
    res.send('success enroll admin');
  })
  .catch(error => {
    console.error(error);
    next(error);
  })
});

module.exports = router;