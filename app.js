const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const flash = require('connect-flash');
require('dotenv').config();

const indexRouter = require('./routes');
const authRouter = require('./routes/kakao/auth');
const usersRouter = require('./routes/kakao/users');
const messageRouter = require('./routes/kakao/message');
const fabricRouter = require('./routes/fabric');


const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 8888);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,
    secure: false
  },
  store: new FileStore(),
}));
app.use(flash());

app.use('/', indexRouter);
app.use('/kakao/auth', authRouter);
app.use('/kakao/users', usersRouter);
app.use('/kakao/message', messageRouter);
app.use('/fabric', fabricRouter);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(`
    ===========================
      http://localhost:${app.get('port')}
    ===========================
  `);
});
