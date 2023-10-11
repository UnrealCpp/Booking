var mysql = require('mysql');
var crypto = require('crypto');
var {ROLES} = require('./config');
require('dotenv').config();
var connPool = mysql.createPool({
  connectionLimit : 10,
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB_NAME
});

//changed createConnection to createPool. Now node server doesn't crash when mysql connection is lost (like restart db).  

connPool.getConnection(function(err, con) {
  if (err) return console.error('Mysql Connection: ' + err.message); // not connected! 
  con.query("CREATE TABLE if not exists personal_info ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    firstname VARCHAR(50), \
    surname VARCHAR(50),\
    gender VARCHAR(10),\
    phone VARCHAR(20),\
    birthdate DATE,\
    nation VARCHAR(50),\
    prefered_lang VARCHAR(10),\
    company VARCHAR(50),\
    company_phone VARCHAR(20),\
    vat_id VARCHAR(20),\
    vat_address VARCHAR(150),\
    address VARCHAR(150)\
  ) ENGINE = InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  con.query("CREATE TABLE if not exists users_roles ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    usersID INTEGER, \
    rolesID INTEGER, \
    UNIQUE (usersID, rolesID) \
  ) ENGINE = InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  con.query("CREATE TABLE if not exists roles ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    description VARCHAR(20) UNIQUE \
  ) ENGINE=InnoDB;", function (err, result) {
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
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    username VARCHAR(50) UNIQUE, \
    hashed_password BLOB, \
    salt BLOB, \
    name VARCHAR(50), \
    email VARCHAR(50),\
    emailvalidation BOOLEAN,\
    creationdate DATETIME,\
    passwordrecoverytoken VARCHAR(50),\
    personal_infoID INTEGER \
  ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  
  con.query("CREATE TABLE IF NOT EXISTS todos ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    owner_id INTEGER NOT NULL, \
    title VARCHAR(50) NOT NULL, \
    completed INTEGER \
  ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });

  //type ceviri icin 1-oda 2-salon 3-birlesikOdalar 4-ozelIstek gibi
  con.query("CREATE TABLE IF NOT EXISTS room ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    name VARCHAR(100) NOT NULL, \
    description TEXT, \
    type INT, \
    picture VARCHAR(50), \
    person_capacity INTEGER DEFAULT 40, \
    cost_room INTEGER DEFAULT 0, \
    discount_room INTEGER DEFAULT 0, \
    surcharge_room INTEGER DEFAULT 0, \
    cost_room_vat INTEGER DEFAULT 0, \
    cost_person INTEGER DEFAULT 0, \
    cost_person_vat INTEGER DEFAULT 0, \
    prep_minute INTEGER DEFAULT 30 \
  ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  con.query("CREATE TABLE IF NOT EXISTS report_room ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    log VARCHAR(255), \
    log_time TIMESTAMP, \
    roomId INTEGER NOT NULL, \
    cost_room INTEGER, \
    cost_room_vat INTEGER, \
    cost_person INTEGER, \
    cost_person_vat INTEGER \
  ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  ///doesnt work here but it works inside php_admin sql command
  // add userID -> username -> userrole
  // con.query("DELIMITER $$ CREATE TRIGGER ins_cost AFTER INSERT ON room \
  // FOR EACH ROW BEGIN \
  //   INSERT INTO report_room (log, log_time, roomId, cost_room, cost_room_vat, cost_person, cost_person_vat) \
  //   VALUES('insert', NOW(), NEW.id, NEW.cost_room, NEW.cost_room_vat, NEW.cost_person, NEW.cost_person_vat); \
  // END$$ \
  // DELIMITER ; \
  // )", function (err, result) {
  //   if (err) throw err;
  //   //console.log("Result: " + result);
  // });
  // con.query("DELIMITER $$ CREATE TRIGGER upd_cost AFTER UPDATE ON room \
  // FOR EACH ROW BEGIN \
  //   INSERT INTO report_room (log, log_time, roomId, cost_room, cost_room_vat, cost_person, cost_person_vat) \
  //   VALUES('update', NOW(), NEW.id, NEW.cost_room, NEW.cost_room_vat, NEW.cost_person, NEW.cost_person_vat); \
  // END$$ \
  // DELIMITER ; \
  // )", function (err, result) {
  //   if (err) throw err;
  //   //console.log("Result: " + result);
  // });
  con.query("CREATE TABLE IF NOT EXISTS room_reservation ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    roomID INT NOT NULL, \
    datetime TIMESTAMP, \
    date DATE, \
    time_from TIME, \
    time_to TIME, \
    statusID TINYINT \
  ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  con.query("CREATE TABLE IF NOT EXISTS status ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    name VARCHAR(20) NOT NULL \
    ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  //type is 1-defaultServices 2-service 3-catering 4-combinedPackages
  con.query("CREATE TABLE IF NOT EXISTS roomservice ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    name VARCHAR(100) NOT NULL, \
    description TEXT, \
    type INT, \
    picture VARCHAR(50), \
    cost INTEGER DEFAULT 0, \
    cost_vat INTEGER DEFAULT 0 \
    ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  //which room has what service available.
  con.query("CREATE TABLE IF NOT EXISTS roomservice_room ( \
    roomserviceID INTEGER, \
    roomID INTEGER \
    ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  con.query("CREATE TABLE IF NOT EXISTS roomservice_order ( \
    roomserviceID INTEGER, \
    orderID INTEGER \
    ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  con.query("CREATE TABLE IF NOT EXISTS resorder ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    userID INT, \
    roomreservationID INT, \
    datetime_order TIMESTAMP, \
    statusID TINYINT \
  ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  con.query("CREATE TABLE IF NOT EXISTS report_resorder ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    log VARCHAR(255), \
    log_time TIMESTAMP, \
    resorderId INTEGER NOT NULL, \
    statusID TINYINT \
  ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  con.query("CREATE TABLE IF NOT EXISTS federated_credentials ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    user_id INTEGER NOT NULL, \
    provider VARCHAR(100) NOT NULL, \
    subject VARCHAR(100) NOT NULL, \
    UNIQUE (provider, subject) \
  ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });

  var salt = crypto.randomBytes(32);
  var sql = "INSERT IGNORE INTO users (username, hashed_password, salt) VALUES (?, ?, ?)";
  var values = 
    [
      'Admin',
      crypto.pbkdf2Sync(process.env.ADMIN_PASS, salt, 310000, 64, 'sha512'),
      salt
    ]
  ;
  con.query(sql, values, function (err, result) {
    if (err) throw err;
    //console.log("Number of records inserted: " + result.affectedRows);
    if(result.affectedRows)
    con.query("INSERT IGNORE INTO users_roles (usersID,rolesID) VALUES (?,?)", [result.insertId,1], function (err, res) {
      if (err) throw err;
    });
    console.log("Mysql connected");

  });
  con.release();
});

module.exports = connPool;
