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

//changed createConnection to createPool. Now node server doesn't crash when mysql connection is lost (like restart db).  

function fetchRooms(req, res, next) {
    console.time("Select rooms time: ");
    conn.query('SELECT * FROM room',
    function(err, rows) {
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
