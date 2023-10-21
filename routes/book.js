const book = require('express').Router();
const room = require('../middleware/room');
//const getReservations = require('../middleware/room').getReservations;
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var locals = require('../config');
//...

// Our app.use in the last file forwards a request to our book router.
// So this route actually handles `/book` because it's the root route when a request to /book is forwarded to our router.
book.get('/', ensureLogIn("../login"), function(req, res, next) { 
  return res.redirect('/'); 
});
book.get('/list/:id/:date',function(req, res, next) { 
  res.locals._getReservations={day:new Date(req.params.date),room:req.params.id};
  next();
},room.getReservations,function(req, res, next) {
  // console.log(res.locals._getReservations);
  // console.log("__________________");
  // console.log(req.locals);
  let param = res.locals._getReservations;
  //console.log(locals)
  res.render('room/list',{locals, list:param, layout:"./layouts/layout_logged", user: req?.user}); 
});

// A route to booking
book.get('/:id',ensureLogIn("../login"), function(req, res, next) { 
  //////////////////////////////////////////////////////const dayFormatter = Intl.DateTimeFormat("de-DE",{datestyle:"short"});
  
  res.locals._getReservations={day:new Date(),room:req.params.id};
  next();
},room.getReservations, room.fetchRooms,room.getRoomSeatings, function(req, res, next) {
  let param = req.params.id;
  let room = res.locals.rooms.filter((elem)=> elem.id==param);
  let seating_list = res.locals.seatings.filter((elem)=> elem.room_id==param);
  
  user_logged(req);  

  res.render('room/reserve',{locals, bookId:param,room:room[0], layout:"./layouts/layout_logged", user: req?.user, seatings:seating_list}); 
});

function fillOccupiedBookingHours(_bookings){
  //console.log(_bookings);

}

book.post('/',ensureLogIn("../login"),function(req, res, next) { 
  //res.render('loading',{locals, layout:"./layouts/layout_logged", user: req?.user});
  next();
},  room.postReservation, function(req, res, next) {
  //INSERT INTO `room_reservation`(`roomID`, `date`, `time_from`, `time_to`) VALUES (4,"2023-11-11","80000","120000");
  //INSERT INTO `room_reservation`(`roomID`, `date`, `time_from`, `time_to`) VALUES (4,"2023-11-11","08:00","12:00");
  //let myId = res.locals._roomID;
  // console.log(res.locals._roomID)  ;
  // console.log("__________________");
  // console.log(res.locals._resDate);
  return res.redirect('/book/list/'+res.locals._roomID+'/'+res.locals._resDate); 
});
function user_logged(req){
  if(req.user?.username|| req.user?.name)  {
    locals.layout = "./layouts/layout_logged";
    locals.user= req.user ;
  }
  else locals.layout = "./layouts/layout";
}
module.exports = book;
  //getReservations(new Date("2023-10-17").toISOString().slice(0,10),param,fillOccupiedBookingHours);