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
 

function serviceByRoom(req, res, next) {
  conn.query('SELECT * FROM roomservice_room JOIN roomservice ON roomserviceID=roomservice.id ',function(err, rows) {
    if (err) { return next(err); }

    var srv_src = rows.map(function(row) {
      return {
        room_id: row.roomID,
        service_id: row.roomserviceID,
        tkey: row.i18name,
        short: row.short_name,
        name: row.name,
        desc: row.description,
        type: row.type,
        img: row.picture,
        cost: row.cost,
        vat: row.cost_vat,
        sort: row.sort,
        group: row.groupID
      }
    });

    res.locals.mySrv = [...new Set(srv_src.map(item => item.short))];
    next();
  });

}
function fetchRooms(req, res, next) {
    console.time("Select rooms time: ");
    conn.query('SELECT * FROM room',
    async function(err, rows) {
      if (err) { return next(err); }
      
      var rooms = rows.map(function(row) {
        return {
          id: row.id,
          name: row.name,
          text: row.description,
          img: row.picture,
          type: row.type,
          capacity: row.person_capacity,
          cost_room: row.cost_room,
          cost_person: row.cost_person
        }
      });
      res.locals.rooms = rooms;
      next();
    });
    console.timeEnd("Select rooms time: ");
  }

module.exports = fetchRooms;
