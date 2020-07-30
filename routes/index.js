const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.locals.nick = '';
  res.render('index');
});

router.get('/:nick', (req, res) => {
  const { nick } = req.params;
  res.locals.nick = nick;
  res.render('index');
});

module.exports = router;