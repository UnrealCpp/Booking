var express = require('express');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var conn = require('../dbmysql');
const fs = require('fs');
var crypto = require('crypto');
//import ROLES from '../config';
const ROLES = require('../config');
const checkIsInRole= require('../middleware/handle');
// connect-ensure-login integrates seamlessly with Passport.
var locals = {
  title: 'KORNS Booking',
  description: 'Page Description',
  header: 'Page Header'
};
let lang = "en";//test
function user_logged(req){
  if(req.user?.username|| req.user?.name)  {
    locals.layout = "./layouts/layout_logged";
    locals.user= req.user ;
  }
  else locals.layout = "./layouts/layout";
}
function ensureLoggedIn(req, res, next){
  ensureLogIn();  
  next();
}

function fetchTodos(req, res, next) {
  console.time("mysql Select todos time: ");
  conn.query('SELECT * FROM todos WHERE owner_id = ?', [
    req.user.id
  ], function(err, rows) {
    if (err) { return next(err); }
    
    var todos = rows.map(function(row) {
      return {
        id: row.id,
        title: row.title,
        completed: row.completed == 1 ? true : false,
        url: '/' + row.id
      }
    });
    res.locals.todos = todos;
    res.locals.activeCount = todos.filter(function(todo) { return !todo.completed; }).length;
    res.locals.completedCount = todos.length - res.locals.activeCount;
    next();
  });
  console.timeEnd("mysql Select todos time: ");
}

var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  req.i18n.changeLanguage(lang);
  if(!fs.existsSync("./.env"))
    return res.render('setup', { randombytes: crypto.randomBytes(16).toString('hex') });
  if (req.cookies.getSessionReturn) {
    res.clearCookie('getSessionReturn');
    return res.redirect(req.cookies.getSessionReturn);    
  }
  if (!req.user) { 
    locals.activeLogo = "active";
    user_logged(req);

    res.render('home',locals); 
    locals.activeLogo = "";
    return;
  }
  next();
}, fetchTodos, function(req, res, next) {
  res.locals.filter = null;  
  user_logged(req);
  res.render('index', { locals,user: req.user, layout:'./layouts/layout_logged'});
});
router.get('/dashboard', function(req, res, next) {  
  user_logged(req);
  res.cookie('getSessionReturn', "/dashboard");
  next();
}, ensureLoggedIn,checkIsInRole(ROLES.Admin),function(req, res, next) {      
  res.clearCookie('getSessionReturn');
  res.render('dashboard', { user: req.user });
  //console.log(req.cookies)
});
router.get('/contact', function(req, res, next) {
  req.i18n.changeLanguage(lang);
  locals.translation = req.t('greeting');
  locals.activeContact = "active";
  res.render('contact',locals);
  locals.activeContact = "";
});
router.get('/privacy', function(req, res, next) {  
  req.i18n.changeLanguage(lang);
  locals.activePriv = "active";
  if(req.user?.username)  {
    locals.layout = "./layouts/layout_logged";
    locals.user= req.user ;
  }
  else locals.layout = "./layouts/layout";
  res.render('privacy',locals);
  locals.activePriv = "";
});
router.get('/active', ensureLoggedIn, fetchTodos, function(req, res, next) {
  res.locals.todos = res.locals.todos.filter(function(todo) { return !todo.completed; });
  res.locals.filter = 'active';
  res.render('index', { user: req.user });
});

router.get('/completed', ensureLoggedIn, fetchTodos, function(req, res, next) {
  res.locals.todos = res.locals.todos.filter(function(todo) { return todo.completed; });
  res.locals.filter = 'completed';
  res.render('index', { user: req.user });
});
router.get('/setup', function(req, res, next) {
  return res.render('setup', { randombytes: crypto.randomBytes(16).toString('hex') });
});
router.post('/', ensureLoggedIn, function(req, res, next) {
  req.body.title = req.body.title.trim();
  next();
}, function(req, res, next) {
  if (req.body.title !== '') { return next(); }
  return res.redirect('/' + (req.body.filter || ''));
}, function(req, res, next) {
  conn.query('INSERT INTO todos (owner_id, title, completed) VALUES (?, ?, ?)', [
    req.user.id,
    req.body.title,
    req.body.completed == true ? 1 : null
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

router.post('/:id(\\d+)', ensureLoggedIn, function(req, res, next) {
  req.body.title = req.body.title.trim();
  next();
}, function(req, res, next) {
  if (req.body.title !== '') { return next(); }
  conn.query('DELETE FROM todos WHERE id = ? AND owner_id = ?', [
    req.params.id,
    req.user.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
}, function(req, res, next) {
  conn.query('UPDATE todos SET title = ?, completed = ? WHERE id = ? AND owner_id = ?', [
    req.body.title,
    req.body.completed !== undefined ? 1 : null,
    req.params.id,
    req.user.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

router.post('/:id(\\d+)/delete', ensureLoggedIn, function(req, res, next) {
  conn.query('DELETE FROM todos WHERE id = ? AND owner_id = ?', [
    req.params.id,
    req.user.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

router.post('/toggle-all', ensureLoggedIn, function(req, res, next) {
  conn.query('UPDATE todos SET completed = ? WHERE owner_id = ?', [
    req.body.completed !== undefined ? 1 : null,
    req.user.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

router.post('/clear-completed', ensureLoggedIn, function(req, res, next) {
  conn.query('DELETE FROM todos WHERE owner_id = ? AND completed = ?', [
    req.user.id,
    1
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

module.exports = router;
