var express = require('express');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var conn = require('../dbmysql');
const fs = require('fs');
var crypto = require('crypto');
//import ROLES from '../config';
const {ROLES,calendar} = require('../config');
var locals = require('../config');
const checkIsInRole= require('../middleware/handle');
var room = require('../middleware/room');
// connect-ensure-login integrates seamlessly with Passport.

function user_logged(req){
  if(req.user?.username|| req.user?.name)  {
    locals.layout = "./layouts/layout_logged";
    locals.user= req.user ;
  }
  else locals.layout = "./layouts/layout";
}

var router = express.Router();
/* GET home page. */
router.get('/', room.getRoomSrvc,  room.fetchRooms, function(req, res, next) {  
  //req.i18n.changeLanguage(lang);
  if(!fs.existsSync("./.env"))
    return res.render('setup', { randombytes: crypto.randomBytes(16).toString('hex') });
  if (req.cookies.getSessionReturn) {
    res.clearCookie('getSessionReturn');
    return res.redirect(req.cookies.getSessionReturn);    
  }
  if (!req.user) { 
    locals.activeLogo = "active";
    user_logged(req);
    res.render('home',{locals}); 
    locals.activeLogo = "";
    return;
  }
  next();
}, function(req, res, next) {
  user_logged(req);
  return res.render('home', { locals,user: req.user, layout:'./layouts/layout_logged'});
});
router.get('/dashboard', function(req, res, next) {  
  user_logged(req);
  res.cookie('getSessionReturn', "/dashboard");
  next();
}, ensureLogIn,checkIsInRole(ROLES.Admin),function(req, res, next) {      
  res.clearCookie('getSessionReturn');
  res.render('dashboard', { user: req.user });
  //console.log(req.cookies)
});
router.get('/contact', function(req, res, next) {
  //req.i18n.changeLanguage(lang);
  locals.translation = req.t('greeting');
  locals.activeContact = "active";
  res.render('contact',locals);
  locals.activeContact = "";
});
router.get('/privacy', function(req, res, next) {  
  //req.i18n.changeLanguage(lang);
  locals.activePriv = "active";
  if(req.user?.username)  {
    locals.layout = "./layouts/layout_logged";
    locals.user= req.user ;
  }
  else locals.layout = "./layouts/layout";
  res.render('privacy',locals);
  locals.activePriv = "";
});
router.get('/setup', function(req, res, next) {
  return res.render('setup', { randombytes: crypto.randomBytes(16).toString('hex') });
});

router.get('/calendarconf', function(req, res, next) { 
  //console.log(calendar.month); 
  res.json(calendar);
});
router.get('/calendarconf/:id',function(req, res, next) { 
  res.locals._getReservations={day:new Date(),room:req.params.id};
  next();
}, room.getReservations,function(req, res, next) { 
  console.log(res.locals._getReservations._listAll);
  calendar.events.length=0;
  res.locals._getReservations._listAll.forEach(element => {
    
  const parts = element.date.split('.');
  parts[1]=parseInt( parts[1])-1;
  const originalDate = element.start;
  const hour = element.start.split(':');
  const hourTo = element.end.split(':');
    
    calendar.events.push({
      name:hour[0]+" to "+hourTo[0],
      paramStart:[parts[2],parts[1],parts[0],hour[0],hour[1],hour[2]],
      paramEnd:[parts[2],parts[1],parts[0],hourTo[0],hourTo[1],hourTo[2]]
    });
  });
  //console.log(calendar.month); 
  res.json(calendar);
});
router.get('/change/:lang', function(req, res, next) { 
    locals.lang=req.params.lang;
    res.redirect(req.get('referer'));

});
router.get('/calendarconf/:year/:month', function(req, res, next) { 
  //console.log(calendar.month); 
  let cal  = JSON.parse(JSON.stringify(calendar));
  cal.month.startYear=req.params.year;
  cal.month.startMonth=req.params.month;
  console.log(cal);
  res.json(cal);
});
// router.post('/book',ensureLogIn("../login"), room.postReservation, function(req, res, next) {
//   //INSERT INTO `room_reservation`(`roomID`, `date`, `time_from`, `time_to`) VALUES (4,"2023-11-11","80000","120000");
//   let myId = req.body.rezervasyon_tarihi;
//   console.log(myId);
//   return res.redirect('/book');
// });
// router.post('/', ensureLogIn, function(req, res, next) {
//   req.body.title = req.body.title.trim();
//   next();
// }, function(req, res, next) {
//   if (req.body.title !== '') { return next(); }
//   return res.redirect('/' + (req.body.filter || ''));
// }, function(req, res, next) {
//   conn.query('INSERT INTO todos (owner_id, title, completed) VALUES (?, ?, ?)', [
//     req.user.id,
//     req.body.title,
//     req.body.completed == true ? 1 : null
//   ], function(err) {
//     if (err) { return next(err); }
//     return res.redirect('/' + (req.body.filter || ''));
//   });
// });

module.exports = {router,locals};