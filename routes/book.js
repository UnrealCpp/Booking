const book = require('express').Router();
const fetchRooms = require('../src/room');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
//...

// Our app.use in the last file forwards a request to our book router.
// So this route actually handles `/book` because it's the root route when a request to /book is forwarded to our router.
book.get('/', ensureLogIn("../login"), function(req, res, next) {
  // res.send() our response here  
  res.render('room/reserve',{bookId:"1"}); 
});


// A route to handle requests to any individual album, identified by an album id
book.get('/:id', fetchRooms, function(req, res, next) {
  let param = req.params.id;
  let room = res.locals.rooms.filter((elem)=> elem.id==param);
  res.render('room/reserve',{bookId:param,room:room[0]}); 
  // get album data from server and res.send() a response here
});
book.post('/',ensureLogIn("../login"), function(req, res, next) {
  
  let myId = req.body.rezervasyon_tarihi;
  console.log(req.body.filter);
    // get album data from server and res.send() a response here
  return res.redirect('/book' + (req.body.filter || ''));
});

module.exports = book;