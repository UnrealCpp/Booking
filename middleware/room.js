var mysql = require('mysql');
require('dotenv').config();
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
      // Now, 'result' contains the desired grouping
      console.log(result);
  
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
// function middleware3(req, res, next) { req.requestTime = Date.now(); next() }
// function middleware3(req, res, next) { req.requestTime = Date.now(); next() }
// function middleware3(req, res, next) { req.requestTime = Date.now(); next() }
// function middleware3(req, res, next) { req.requestTime = Date.now(); next() }

module.exports = {
    getRoomSrvc,
    getSrvcRooms,
    fetchRooms
}
