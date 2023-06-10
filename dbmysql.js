var mysql = require('mysql');
var crypto = require('crypto');

var con = mysql.createConnection({
  host: "localhost",
  user: "pma",
  password: "",
  database: "booking"
});

con.connect(function(err) {
  if (err) throw err;
  //console.log("Connected!");

  con.query("CREATE TABLE if not exists users ( \
    id INTEGER  AUTO_INCREMENT PRIMARY KEY, \
    username TEXT UNIQUE, \
    hashed_password BLOB, \
    salt BLOB, \
    name TEXT \
  )", function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
  });
  
  con.query("CREATE TABLE IF NOT EXISTS todos ( \
    id INTEGER  AUTO_INCREMENT PRIMARY KEY, \
    owner_id INTEGER NOT NULL, \
    title TEXT NOT NULL, \
    completed INTEGER \
  )", function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
  });
  con.query("CREATE TABLE IF NOT EXISTS federated_credentials ( \
    id INTEGER  AUTO_INCREMENT PRIMARY KEY, \
    user_id INTEGER NOT NULL, \
    provider TEXT NOT NULL, \
    subject TEXT NOT NULL, \
    UNIQUE (provider, subject) \
  )", function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
  });

  var salt = crypto.randomBytes(16);
  var sql = "INSERT IGNORE INTO users (username, hashed_password, salt) VALUES (?, ?, ?)";
  var values = 
    [
      'alice',
      crypto.pbkdf2Sync('letmein', salt, 310000, 32, 'sha256'),
      salt
    ]
  ;
  con.query(sql, values, function (err, result) {
    if (err) throw err;
    console.log("Number of records inserted: " + result.affectedRows);
  });
  
});

module.exports = con;
