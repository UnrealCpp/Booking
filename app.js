var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var csrf = require('csurf');
var passport = require('passport');
var logger = require('morgan');
require('dotenv').config();
const errorHandler = require("./middleware/errHandle");
const expressLayouts = require("express-ejs-layouts");
const i18next = require('i18next');
const Backend = require('i18next-node-fs-backend');
const i18nextMiddleware = require('i18next-http-middleware');


// pass the session to the connect sqlite3 module
// allowing it to inherit from session.Store
//var SQLiteStore = require('connect-sqlite3')(session);
const MySQLStore = require('express-mysql-session')(session);
const options = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.SESSION_DB_NAME
}
var {router,locals} = require('./routes/index');
var authRouter = require('./routes/auth');
const roomRouter = require('./routes/room');
const bookRouter = require('./routes/book');
const { Console } = require('console');
i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
      debug: false,
        backend: {
            loadPath: __dirname + '/resources/locales/{{lng}}/{{ns}}.json'
        },
        fallbackLng: 'de',
        preload: ['en','de','tr','es','ar','ru-RU','fr']
    });
var app = express();
app.use(expressLayouts);
app.set('layout','./layouts/layout');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.pluralize = require('pluralize');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  key: 'express_passport',
  secret: process.env.SESSION_SECRET,
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  store: new MySQLStore(options)//new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
  
}));
app.use(csrf());
app.use(passport.authenticate('session'));
app.use(function(req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !! msgs.length;
  req.session.messages = [];
  next();
});
app.use(function(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use(i18nextMiddleware.handle(i18next));
app.use(function(req, res, next) {
  if(locals.lang){
    req.i18n.changeLanguage(locals.lang);
  }
  next();
});
app.use('/', router);
app.use('/', authRouter);
app.use('/room',roomRouter);
app.use('/book',bookRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

app.use(errorHandler);
module.exports = app;
