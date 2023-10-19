var mysql = require('mysql');
require('dotenv').config();
var validator = require('validator');
//const util = require('util');
var conn = mysql.createPool({
  connectionLimit : 10,
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB_NAME
});

function checkByTime() {

}

function timeConflicts(){

}

function btnHourIsAvailable(){
  
  //available-btns
}

module.exports = {
    getRoomSrvc, getSrvcRooms, fetchRooms,
    getRoomSeatings,postReservation,
    getReservations
}