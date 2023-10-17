var mysql = require('mysql');
require('dotenv').config();
var validator = require('validator');
const util = require('util');
var conn = mysql.createPool({
  connectionLimit : 10,
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB_NAME
});
// function getRoomSrvc(req, res, next) { 
//   conn.query('SELECT * FROM roomservice_room JOIN roomservice ON roomserviceID=roomservice.id WHERE active=1',function(err, rows) {
//     if (err) { return next(err); }

//     let uniqueSrvc = [...new Set(rows.map(item => item.short_name))];     
//     let list=uniqueSrvc.map(e=>{return rows.filter(er=>er.short_name===e)});
//     console.log(list[0][1].roomID);
//     var srv_src = rows.map(function(row) {
//       // rows.filter(e=>row.short_name===e.);

//       return {
//         room_id: row.roomID,
//         service_id: row.roomserviceID,
//         tkey: row.i18name,
//         short: row.short_name,
//         name: row.name,
//         desc: row.description,
//         type: row.type,
//         img: row.picture,
//         cost: row.cost,
//         vat: row.cost_vat,
//         sort: row.sort,
//         group: row.groupID
//       }
//     });

//     //let uniqueSrvc = [...new Set(srv_src.map(item => item.short))];    
//     res.locals.mySrv =uniqueSrvc;

//     next();
//   });
//   }
  function getSrvcRooms(req, res, next) {
    const query = 'SELECT * FROM roomservice_room JOIN roomservice ON roomserviceID=roomservice.id WHERE active=1';
  
    conn.query(query, (err, rows) => {
      if (err) {
        return next(err);
      }
  
      const uniqueSrvc = [...new Set(rows.map(item => item.short_name))];
  
      const serviceGroups = uniqueSrvc.map(shortName => {
        const group = rows.filter(frow => frow.short_name === shortName);
        return {
          short: shortName,
          rooms: group.map(mrow => (mrow.roomID)),
        };
      });
      console.log(serviceGroups)
      res.locals.mySrv = serviceGroups;
  
      next();
    });
  }
  function getRoomSrvc(req, res, next) {
    const query = 'SELECT * FROM roomservice_room JOIN roomservice ON roomserviceID=roomservice.id WHERE active=1';
  
    conn.query(query, (err, rows) => {
      if (err) {
        return next(err);
      }
  
      // Create a map to store roomID to short_name mapping
      const roomToShortNameMap = new Map();
  
      // Iterate through the rows and populate the map
      rows.forEach(row => {
        const roomID = row.roomID;
        const shortName = row.short_name;
  
        if (!roomToShortNameMap.has(roomID)) {
          roomToShortNameMap.set(roomID, []);
        }
  
        roomToShortNameMap.get(roomID).push(shortName);
      });
  
      // Convert the map to an array of objects
      const result = [...roomToShortNameMap].map(([roomID, services]) => ({
        roomID,
        services
      }));
      ///---------------////
      const uniqueSrvc = [...new Set(rows.map(item => item.short_name))];
  
      const serviceGroups = uniqueSrvc.map(shortName => {
        const group = rows.filter(frow => frow.short_name === shortName);
        return {
          short: shortName,
          rooms: group.map(mrow => (mrow.roomID)),
        };
      });
      //console.log(serviceGroups)
      res.locals.mySrv = serviceGroups;
      // Now, 'result' contains the desired grouping
      //console.log(result);
  
      res.locals.myRooms = result;
  
      next();
    });
  }
// function getRoomSrvc(req, res, next) { 
//   conn.query('SELECT * FROM roomservice_room JOIN roomservice ON roomserviceID=roomservice.id WHERE active=1',function(err, rows) {
//     if (err) { return next(err); }

//     var srv_src = rows.map(function(row) {
//       return {
//         room_id: row.roomID,
//         service_id: row.roomserviceID,
//         tkey: row.i18name,
//         short: row.short_name,
//         name: row.name,
//         desc: row.description,
//         type: row.type,
//         img: row.picture,
//         cost: row.cost,
//         vat: row.cost_vat,
//         sort: row.sort,
//         group: row.groupID
//       }
//     });
//     let uniqueSrvc = [...new Set(srv_src.map(item => item.short))];
//     res.locals.mySrv =uniqueSrvc;

//     next();
//   });
//   }
function fetchRooms(req, res, next) { 
  conn.query('SELECT * FROM room',
  function(err, rows) {
    if (err) { return next(err); }
    
    var rooms = rows.map(function(row) {
      return {
        id: row.id,
        name: row.name,
        text: row.description,
        type: row.type,
        img: row.picture,
        capacity: row.person_capacity,
        cost_room: row.cost_room,
        //discount_room,surcharge_room,
        vat: row.cost_room_vat,
        cost_person: row.cost_person,
        person_vat: row.cost_person_vat,
        prep: row.prep_minute,
        active: row.active
      }
    });
    res.locals.rooms = rooms;
    next();
  });
}
function getRoomSeatings(req, res, next){
  const query = 'SELECT id,roomID,i18name,picture,capacity_room FROM seat_plans_room spr JOIN seat_plans sp ON seat_plansID=sp.id WHERE spr.active=1;';
  
  conn.query(query, (err, rows) => {
    if (err) {
      return next(err);
    }
    let seatings = rows.map(function(row) {
      return {
        seating_id: row.id,
        room_id: row.roomID,
        desc: row.i18name,        
        img: row.picture,
        capacity: row.capacity_room
      }
    });
    res.locals.seatings = seatings;
    next();
  });
}

function utc(e) {  
  let t = new Date(e), a = new Date().getTimezoneOffset() / 60;
  //t.toISOString().slice(0,10);
  return new Date(t.setHours(t.getHours()-a));//subtractHours(t, a)
};
function subtractHours(e, t) {
  return e.setHours(e.getHours() + t), e;
}

  function getReservations(req, res, next){

  let _date = res.locals._getReservations.day;
  let _room = res.locals._getReservations.room;
  const query = 'SELECT * from room_reservation where roomID=? AND room_reservation.date=? ORDER BY time_from';//'SELECT * from room_reservation where roomID=? ORDER BY room_reservation.date,time_from';//
  const values = [_room,_date];
  conn.query(query, values, (err, rows) => {
    if (err) {
      return next(err);
    }
    let sorted_bookings = rows.map(function(row) {      
      return {
        id: row.roomID,
        date: utc(row.date),
        start: row.time_from,        
        end: row.time_to
      }
    });    
    res.locals._getReservations._list = sorted_bookings;

    conn.query('SELECT * from room_reservation where roomID=? ORDER BY room_reservation.date,time_from', [_room], (err, rows) => {
      if (err) {
        return next(err);
      }
      let sorted_bookingsAll = rows.map(function(row) {      
        return {
          id: row.roomID,
          date: utc(row.date),
          start: row.time_from,        
          end: row.time_to
        }
      });    
      res.locals._getReservations._listAll = sorted_bookingsAll;
      console.log("*********************************************")
  
      next();
    });
  });
}
function postReservation(req, res, next){

  //console.log("req.body.rezervasyon_tarihi");
  //console.log(util.types.isDate(new Date(req.body.rezervasyon_tarihi)));
  //validator.toDate(req.body.res_date)  string to date or null if not valid
  


  if(!validator.isDate(req.body.res_date))
    res.locals.messages.push("Reservation Date is invalid");
  
  if(!validator.isAfter(subtractHours(new Date(req.body.res_date),23).toISOString()))
    res.locals.messages.push("You cant reserve in to pastime!"+req.body.res_date+" "+new Date(req.body.res_date).toISOString());
  
  // if(!validator.isAfter(req.body.res_date,new Date(-1).toISOString().slice(0,10)))
  //   res.locals.messages.push("You cant reserve in to pastime!"+req.body.res_date+" "+new Date(-1).toISOString().slice(0,10));
  
  
  if(validator.equals(req.body.res_start,req.body.res_end))
    res.locals.messages.push("Start and End time must be different");

  if(!validator.isTime(req.body.res_start))
    res.locals.messages.push("Start Time is invalid");

  if(!validator.isTime(req.body.res_end))
    res.locals.messages.push("End Time is invalid");

  // console.log(res.locals.messages[0]);
  // console.log(req.body.res_date);
  // console.log(req.body.res_start);
  //console.log(req);

  if(res.locals.messages.length)
    return next("err");
  
    //if returns more than 0 rows then its conflict
    // SELECT * FROM (SELECT * FROM room_reservation WHERE roomID=1 AND room_reservation.date ='2023-11-15') AS q1 WHERE time_to > '8:00:00' AND time_from < '9:40:00';
    // SELECT * FROM room_reservation WHERE roomID=1 AND room_reservation.date ='2023-11-15' AND time_to > '8:00:00' AND time_from < '9:40:00';

    // if there is no conflict then insert row
    // INSERT INTO `room_reservation`(`roomID`, `date`, `time_from`, `time_to`) SELECT 2,'2023-11-16','7:00','8:00' WHERE NOT EXISTS (SELECT * FROM room_reservation WHERE roomID=2 AND room_reservation.date ='2023-11-16' AND time_to > '9:00:00' AND time_from < '18:00:00') 
    
    // select 0 to first booking in that day with same roomid
    // SELECT 0,MIN(time_from) from room_reservation where roomID=1 AND room_reservation.date="2023-11-15";
    // select all time_from's which are bigger then min(timeto)
    // SELECT time_from from room_reservation where roomID=1 AND room_reservation.date="2023-11-15" AND time_from> (SELECT MIN(time_to) from room_reservation)
    // SELECT * from room_reservation where roomID=1 AND room_reservation.date="2023-11-15" ORDER BY time_from
  //const query = 'INSERT INTO `room_reservation`(`roomID`, `date`, `time_from`, `time_to`) VALUES (?,?,?,?);';  
  const query = 'INSERT INTO `room_reservation`(`roomID`, `date`, `time_from`, `time_to`) SELECT ?,?,?,? WHERE NOT EXISTS (SELECT * FROM room_reservation WHERE roomID=? AND room_reservation.date =? AND time_to > ? AND time_from < ?);';  
  const values = [req.body.room_id,req.body.res_date,req.body.res_start,req.body.res_end,req.body.room_id,req.body.res_date,req.body.res_start,req.body.res_end];
  conn.query(query, values ,(err, result) => {
    if (err) {
      res.render('error',req.locals);
      return next(err);
    }
    if(!result.affectedRows){
      res.locals.messages.push("There is a conflict in Booking times");
      next("error");
    }
    // getReservations(req.body.res_date,req.body.room_id,(bookingList)=>{
    //   //console.log(bookingList);
    //   res.locals.bookingList = bookingList;
    //   return bookingList;
    // })
    res.locals._roomID = req.body.room_id;
    res.locals._resDate = req.body.res_date;

    next();
  });
}

// function middleware3(req, res, next) { req.requestTime = Date.now(); next() }
// function middleware3(req, res, next) { req.requestTime = Date.now(); next() }
// function middleware3(req, res, next) { req.requestTime = Date.now(); next() }
// function middleware3(req, res, next) { req.requestTime = Date.now(); next() }

module.exports = {
    getRoomSrvc, getSrvcRooms, fetchRooms,
    getRoomSeatings,postReservation,
    getReservations
}
