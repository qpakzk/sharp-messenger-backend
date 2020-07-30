const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.locals.nick = '';
  res.locals.uuid = '';
  res.render('index');
});

router.get('/:nick', (req, res) => {
  const { nick } = req.params;
  const { uuid } = req.query;
  res.locals.nick = nick;
  res.locals.uuid = uuid;
  res.render('index');
});

module.exports = router;