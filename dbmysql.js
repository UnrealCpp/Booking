var mysql = require('mysql');
var crypto = require('crypto');
var ROLES = require('./config');
var connPool = mysql.createPool({
  connectionLimit : 10,
  host: "localhost",
  user: "pma",
  password: "",
  database: "booking"
});

//changed createConnection to createPool. Now node server doesn't crash when mysql connection is lost (like restart db).  

connPool.getConnection(function(err, con) {
  if (err) return console.error('Mysql Connection: ' + err.message); // not connected! 
  con.query("CREATE TABLE if not exists personal_info ( \
    id INTEGER  AUTO_INCREMENT PRIMARY KEY, \
    firstname VARCHAR(50), \
    surname VARCHAR(50),\
    gender VARCHAR(10),\
    birthdate DATE,\
    address VARCHAR(100)\
  )", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  con.query("CREATE TABLE if not exists users_roles ( \
    id INTEGER  AUTO_INCREMENT PRIMARY KEY, \
    usersID INTEGER, \
    rolesID INTEGER, \
    UNIQUE (usersID, rolesID) \
  )", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  con.query("CREATE TABLE if not exists roles ( \
    id INTEGER  AUTO_INCREMENT PRIMARY KEY, \
    description VARCHAR(20) UNIQUE \
  )", function (err, result) {
    if (err) throw err;    
    //console.log("Result: " + result);
  });
  for (var key in ROLES) {
    // skip loop if the property is from prototype
    //if (!ROLES.hasOwnProperty(key)) continue;
    con.query("INSERT IGNORE INTO roles (description) VALUES (?)", [key], function (err, result) {
      if (err) throw err;
    });
  }

  con.query("CREATE TABLE if not exists users ( \
    id INTEGER  AUTO_INCREMENT PRIMARY KEY, \
    username VARCHAR(50) UNIQUE, \
    hashed_password BLOB, \
    salt BLOB, \
    name VARCHAR(50), \
    email VARCHAR(50),\
    emailvalidation BOOLEAN,\
    creationdate DATETIME,\
    passwordrecoverytoken VARCHAR(50),\
    personal_infoID INTEGER\
  )", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  
  con.query("CREATE TABLE IF NOT EXISTS todos ( \
    id INTEGER  AUTO_INCREMENT PRIMARY KEY, \
    owner_id INTEGER NOT NULL, \
    title VARCHAR(50) NOT NULL, \
    completed INTEGER \
  )", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  con.query("CREATE TABLE IF NOT EXISTS federated_credentials ( \
    id INTEGER  AUTO_INCREMENT PRIMARY KEY, \
    user_id INTEGER NOT NULL, \
    provider TEXT NOT NULL, \
    subject TEXT NOT NULL, \
    UNIQUE (provider, subject) \
  )", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });

  var salt = crypto.randomBytes(32);
  var sql = "INSERT IGNORE INTO users (username, hashed_password, salt) VALUES (?, ?, ?)";
  var values = 
    [
      'alice',
      crypto.pbkdf2Sync('letmein', salt, 310000, 64, 'sha512'),
      salt
    ]
  ;
  con.query(sql, values, function (err, result) {
    if (err) throw err;
    //console.log("Number of records inserted: " + result.affectedRows);
    con.query("INSERT IGNORE INTO users_roles (usersID,rolesID) VALUES (?,?)", [result.insertId,3], function (err, res) {
      if (err) throw err;
    });
    console.log("Mysql connected");

  });
  con.release();
});

module.exports = connPool;
