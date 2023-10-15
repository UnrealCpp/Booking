const book = require('express').Router();
const room = require('../middleware/room');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var locals = require('../config');
//...

// Our app.use in the last file forwards a request to our book router.
// So this route actually handles `/book` because it's the root route when a request to /book is forwarded to our router.
book.get('/', ensureLogIn("../login"), room.fetchRooms, function(req, res, next) {
  // res.send() our response here  
  let room = res.locals.rooms.filter((elem)=> elem.id==1);
  user_logged(req);
  res.render('room/reserve',{bookId:"1",room:room[0],layout:locals.layout,user: req?.user}); 
});


// A route to booking
book.get('/:id',ensureLogIn("../login"), room.fetchRooms, function(req, res, next) {
  let param = req.params.id;
  let room = res.locals.rooms.filter((elem)=> elem.id==param);
  user_logged(req);
  res.render('room/reserve',{bookId:param,room:room[0],layout:locals.layout,user: req?.user}); 
});
book.post('/',ensureLogIn("../login"), function(req, res, next) {
  
  let myId = req.body.rezervasyon_tarihi;
  console.log(req.body.filter);
  return res.redirect('/book' + (req.body.filter || ''));
});
function user_logged(req){
  if(req.user?.username|| req.user?.name)  {
    locals.layout = "./layouts/layout_logged";
    locals.user= req.user ;
  }
  else locals.layout = "./layouts/layout";
}
module.exports = book;