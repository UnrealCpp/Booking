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
    if(!result.warningCount){
      for (var key in ROLES) {
        // skip loop if the property is from prototype
        //if (!ROLES.hasOwnProperty(key)) continue;
        con.query("INSERT INTO roles (description) VALUES (?)", [key], function (err, result) {
          if (err) throw err;
        });
      }
    }
  });

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
    personal_infoID INTEGER, \
    active BOOLEAN DEFAULT 1 \
  ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //create admin user if table just created (no warning message)
    if(!result.warningCount){
      var salt = crypto.randomBytes(32);
      var sql = "INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)";
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
        con.query("INSERT INTO users_roles (usersID,rolesID) VALUES (?,?)", [result.insertId,1], function (err, res) {
          if (err) throw err;
        });
        console.log("Admin User Created");
    
      });
    }
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
    cost_room DECIMAL(8,2), \
    discount_room DECIMAL(3,1) DEFAULT 0, \
    surcharge_room DECIMAL(3,1) DEFAULT 0, \
    cost_room_vat INTEGER DEFAULT 0, \
    cost_person DECIMAL(8,2) DEFAULT 0, \
    cost_person_vat INTEGER DEFAULT 0, \
    prep_minute INTEGER DEFAULT 30, \
    active BOOLEAN DEFAULT 1 \
  ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    if(!result.warningCount){     
        con.query("INSERT INTO `room` (`id`, `name`, `description`, `type`, `picture`, `person_capacity`, `cost_room`, `cost_room_vat`, `cost_person`, `cost_person_vat`, `prep_minute`) VALUES\
        (1, 'Korn (S1)', 'default offer\nRoom booking with the possibility to book interior design offers and catering offers individually\n \nup to 60 people\nHalf day (up to 4 hours) €181.50\nFull day (from 4 hours) €319.00\n \nSpecial surcharges for half a day (up to 4 hours)\nSpecial surcharge: Evenings after 6 p.m. (per hour) €10.00\nWeekend or public holiday surcharge (per hour) €10.00\n \nSpecial surcharges all day (from 4 hours)\nSpecial surcharge: Evenings after 6 p.m. (per hour) €10.00\nWeekend or public holiday surcharge (per hour) €10.00', 1, 'korns1.png', 198, 150, 18, 50, 18, 30),\
        (2, 'Burgblick (S2)', 'fghfghfgh', 2, 'burgblicks2.png', 75, 55, 66, 7878, 0, 30),\
        (3, 'Sebald (2c)', 'fghfghfgh', 1, 'sebald2c.png', 60, 55, 66, 7878, 0, 30),\
        (4, 'Kleiner Liebling (1)', 'This room is 198 m² and there is a vintage bar just outside the door. It is good for presentations, meetings, celebration etc... ', 2, 'liebling1.png', 198, 500, 7, 55, 7, 30),\
        (5, 'Lorenz (2b)', 'fghfghfgh', 1, 'lorenz2b.png', 75, 55, 66, 7878, 0, 30),\
        (6, 'Dürer (2a)', 'Small Room', 1, 'durer.jpg', 25, 159.66, 7, 10, 7, 15)", function (err, result) {
          if (err) throw err;
          console.log(result.affectedRows + " Rows inserted to room table.");
        });
    }

  });
  con.query("CREATE TABLE IF NOT EXISTS report_room ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    log VARCHAR(255), \
    log_time TIMESTAMP, \
    roomId INTEGER NOT NULL, \
    cost_room DECIMAL(8,2), \
    cost_room_vat INTEGER, \
    cost_person DECIMAL(8,2), \
    cost_person_vat INTEGER, \
    active BOOLEAN DEFAULT 1 \
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
    statusID TINYINT DEFAULT 1\
  ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    if(!result.warningCount){     
      con.query("INSERT INTO `room_reservation` (`id`, `roomID`, `datetime`, `date`, `time_from`, `time_to`, `statusID`) VALUES\
      (1, 4, '2023-10-16 17:58:41', '2023-11-11', '13:00:00', '18:00:00', 1),\
      (2, 4, '2023-10-16 17:58:57', '2023-11-12', '08:00:00', '12:00:00', 1),\
      (3, 4, '2023-10-16 22:52:43', '2023-11-11', '10:00:00', '12:00:00', 1),\
      (4, 4, '2023-10-16 22:52:40', '2023-11-11', '09:00:00', '10:00:00', 1),\
      (5, 1, '2023-10-16 22:34:15', '2023-11-15', '07:00:00', '08:00:00', 1),\
      (6, 1, '2023-10-16 23:37:43', '2023-11-15', '14:40:00', '18:00:00', 1),\
      (7, 1, '2023-10-16 22:36:23', '2023-11-15', '13:00:00', '14:00:00', 1),\
      (8, 1, '2023-10-16 22:51:37', '2023-11-15', '12:03:00', '12:30:00', 1),\
      (9, 6, '2023-10-16 21:08:23', '2023-11-15', '09:00:00', '13:00:00', 1),\
      (10, 1, '2023-10-16 21:19:09', '2023-10-30', '09:00:00', '13:00:00', 1),\
      (11, 1, '2023-10-16 23:37:30', '2023-11-15', '09:00:00', '12:00:00', 1),\
      (12, 1, '2023-10-16 22:47:14', '2023-11-16', '08:00:00', '10:00:00', 1),\
      (13, 1, '2023-10-16 22:50:56', '2023-11-16', '10:00:00', '12:00:00', 1),\
      (14, 2, '2023-10-16 22:48:28', '2023-11-16', '07:00:00', '08:00:00', 1),\
      (15, 2, '2023-10-16 22:53:13', '2023-11-16', '17:00:00', '19:00:00', 1),\
      (16, 1, '2023-10-17 01:57:51', '2023-10-17', '09:00:00', '12:00:00', 1),\
      (17, 1, '2023-10-17 01:57:45', '2023-10-17', '12:00:00', '13:00:00', 1),\
      (18, 2, '2023-10-17 01:49:22', '2023-10-17', '09:00:00', '13:00:00', 1),\
      (19, 3, '2023-10-17 01:56:36', '2023-10-17', '09:00:00', '13:00:00', 1),\
      (20, 6, '2023-10-17 02:05:54', '2023-10-17', '13:00:00', '14:00:00', 1),\
      (21, 4, '2023-10-17 02:08:18', '2023-10-28', '13:00:00', '13:00:00', 1),\
      (22, 6, '2023-10-17 02:10:29', '2023-10-17', '07:21:00', '13:00:00', 1),\
      (23, 6, '2023-10-17 02:25:14', '2023-10-17', '14:00:00', '15:00:00', 1),\
      (24, 6, '2023-10-17 02:32:25', '2023-10-17', '20:00:00', '21:00:00', 1),\
      (25, 6, '2023-10-17 02:53:43', '2023-10-17', '21:00:00', '23:00:00', 1),\
      (26, 6, '2023-10-17 02:54:46', '2023-11-02', '09:00:00', '13:00:00', 1),\
      (27, 6, '2023-10-17 02:56:03', '2023-10-29', '09:00:00', '13:00:00', 1),\
      (28, 6, '2023-10-17 02:56:56', '2023-10-22', '22:00:00', '23:00:00', 1),\
      (29, 6, '2023-10-17 02:59:45', '2023-11-01', '09:00:00', '13:00:00', 1),\
      (30, 6, '2023-10-17 03:14:46', '2023-12-22', '09:00:00', '13:00:00', 1),\
      (31, 6, '2023-10-17 03:16:07', '2023-10-31', '09:00:00', '13:00:00', 1),\
      (32, 6, '2023-10-17 03:17:42', '2023-11-05', '09:00:00', '13:00:00', 1),\
      (33, 6, '2023-10-17 03:18:53', '2023-10-30', '09:00:00', '13:00:00', 1),\
      (34, 1, '2023-10-17 03:19:14', '2024-01-18', '09:00:00', '13:00:00', 1),\
      (35, 6, '2023-10-17 03:19:47', '2023-11-12', '09:00:00', '13:00:00', 1),\
      (36, 2, '2023-10-17 03:21:09', '2023-11-05', '09:00:00', '13:00:00', 1),\
      (37, 5, '2023-10-17 03:21:52', '2024-03-21', '09:00:00', '13:00:00', 1),\
      (38, 5, '2023-10-17 03:22:43', '2023-11-30', '09:00:00', '13:00:00', 1),\
      (39, 5, '2023-10-17 03:23:30', '2023-12-13', '09:00:00', '13:00:00', 1),\
      (40, 1, '2023-10-17 03:25:20', '2023-10-18', '09:00:00', '13:00:00', 1),\
      (41, 6, '2023-10-17 03:27:08', '2023-10-18', '15:00:00', '20:00:00', 1),\
      (42, 3, '2023-10-17 03:29:57', '2023-10-18', '10:00:00', '13:00:00', 1),\
      (43, 1, '2023-10-17 03:30:58', '2023-10-18', '14:00:00', '15:00:00', 1),\
      (44, 5, '2023-10-17 03:31:22', '2023-10-17', '09:00:00', '13:00:00', 1),\
      (45, 1, '2023-10-17 03:34:23', '2024-10-17', '09:00:00', '13:00:00', 1),\
      (46, 1, '2023-10-17 04:05:57', '2023-10-19', '09:00:00', '13:00:00', 1),\
      (47, 1, '2023-10-17 04:17:21', '2023-10-17', '13:00:00', '15:00:00', 1),\
      (48, 1, '2023-10-17 10:00:29', '2023-10-18', '20:00:00', '22:00:00', 1),\
      (49, 5, '2023-10-17 10:04:10', '2023-10-17', '22:00:00', '23:00:00', 1),\
      (50, 1, '2023-10-17 10:06:23', '2023-10-19', '21:00:00', '23:00:00', 1),\
      (51, 6, '2023-10-17 10:11:47', '2023-11-17', '15:00:00', '18:00:00', 1),\
      (52, 6, '2023-10-17 10:13:30', '2024-10-17', '09:00:00', '13:00:00', 1),\
      (53, 5, '2023-10-17 10:17:41', '2023-11-17', '06:00:00', '09:00:00', 1),\
      (54, 4, '2023-10-17 10:19:02', '2023-12-17', '09:00:00', '13:00:00', 1),\
      (55, 6, '2023-10-17 10:25:11', '2023-10-20', '14:00:00', '16:00:00', 1),\
      (56, 1, '2023-10-17 11:07:41', '2027-10-17', '09:00:00', '13:00:00', 1),\
      (57, 1, '2023-10-17 11:08:51', '2026-10-17', '09:00:00', '13:00:00', 1),\
      (58, 5, '2023-10-17 11:09:31', '2029-10-17', '09:00:00', '13:00:00', 1),\
      (59, 6, '2023-10-17 11:11:08', '2027-10-17', '09:00:00', '13:00:00', 1),\
      (60, 5, '2023-10-17 11:19:25', '2024-02-17', '09:00:00', '13:00:00', 1),\
      (61, 1, '2023-10-17 11:29:36', '2025-02-17', '09:00:00', '13:00:00', 1),\
      (62, 6, '2023-10-17 11:42:52', '2023-11-15', '18:00:00', '20:00:00', 1),\
      (63, 4, '2023-10-17 11:56:01', '2023-10-18', '07:00:00', '09:00:00', 1),\
      (64, 6, '2023-10-17 12:08:57', '2023-11-17', '13:00:00', '14:00:00', 1),\
      (65, 5, '2023-10-17 12:10:54', '2023-10-17', '14:00:00', '15:00:00', 1),\
      (66, 3, '2023-10-17 12:15:26', '2023-10-17', '07:00:00', '08:00:00', 1),\
      (67, 3, '2023-10-17 12:17:39', '2023-10-17', '08:00:00', '09:00:00', 1),\
      (68, 1, '2023-10-17 12:19:47', '2023-10-18', '07:00:00', '08:00:00', 1);", function (err, result) {
        if (err) throw err;
      });
    }    //console.log("Result: " + result);
  });
  //id 1-en 1-de 1-tr 2-en 2-de..
    //lang VARCHAR(10) NOT NULL, \  BU NE BEYA????
  //lang en de ru tr
  con.query("CREATE TABLE IF NOT EXISTS status ( \
    id INTEGER NOT NULL,\
    name VARCHAR(50) NOT NULL \
    ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });


  //capacity differs from room to room
  con.query("CREATE TABLE IF NOT EXISTS seat_plans_room ( \
    seat_plansID INTEGER, \
    roomID INTEGER, \
    capacity_room INTEGER DEFAULT 1, \
    cost_room DECIMAL(8,2) DEFAULT 0, \
    cost_room_vat INTEGER DEFAULT 0, \
    active BOOLEAN DEFAULT 1 \
    ) ENGINE=InnoDB;", function (err, result) {
      if (err) throw err;

      
  });

  //description is default name before localization
  //i18name is key for localization  
  con.query("CREATE TABLE IF NOT EXISTS seat_plans ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    i18name varchar(20),\
    description VARCHAR(20), \
    picture VARCHAR(50), \
    min_capacity INTEGER DEFAULT 1, \
    cost DECIMAL(8,2) DEFAULT 0, \
    cost_vat INTEGER DEFAULT 0, \
    active BOOLEAN DEFAULT 1 \
    ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    if(!result.warningCount){     
      con.query("INSERT INTO `seat_plans` (`id`, `i18name`, `description`, `picture`, `min_capacity`, `cost`, `cost_vat`, `active`) VALUES\
      (1, 'seminar', 'Seminar', 'Seminar.jpg', 14, '0.00', 0, 1),\
      (2, 'block', 'Blocktafel', 'Blocktafel.jpg', 12, '0.00', 0, 1),\
      (3, 'u_form', 'U-Form', 'U-Form.jpg', 12, '0.00', 0, 1),\
      (4, 'parl', 'Parlament', 'Parlament.jpg', 14, '0.00', 0, 1),\
      (5, 'chairs', 'Stuhlreihen', 'Stuhlreihen.jpg', 20, '0.00', 0, 1),\
      (6, 'bank', 'Bankett', 'Bankett.jpg', 12, '0.00', 0, 1),\
      (7, 'circle', 'Stuhlkreis', 'Stuhlkreis.jpg', 8, '0.00', 0, 1),\
      (8, 'cinema', 'Kino', 'Kino.jpg', 130, '0.00', 0, 1)", function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " Rows inserted to seat_plans table.");
      });
    }     
  });
  //type is 1-defaultServices 2-service 3-catering 4-combinedPackages
  //description is default text before localization
  //groupID for catering headers (breakfast ,wine, cakes...)
  con.query("CREATE TABLE IF NOT EXISTS roomservice ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    i18name VARCHAR(20) NOT NULL, \
    short_name VARCHAR(20), \
    name VARCHAR(100) NOT NULL, \
    description TEXT, \
    type INT, \
    picture VARCHAR(50), \
    cost DECIMAL(8,2) DEFAULT 0, \
    cost_vat INTEGER DEFAULT 7, \
    sort INTEGER,\
    groupID INTEGER, \
    active BOOLEAN DEFAULT 1 \
    ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    if(!result.warningCount){
      con.query("INSERT INTO `roomservice` (`id`, `i18name`, `short_name`, `name`, `description`, `type`, `picture`, `cost`, `cost_vat`, `sort`, `groupID`, `active`) VALUES\
      (1, 'rs.platform', 'Stage', 'Elevated Platform Stage', '50 cm height 7 meter width elevated stage for presentations and speeches', 1, NULL, '150.00', 7, 0, 0, 1),\
      (2, 'rs.stagelights', 'Lighting', 'Stage & Studio Lighting', NULL, 1, NULL, '75.00', 7, 1, 0, 1),\
      (3, 'rs.projector', 'Projection', 'Projector', 'Height 20-120cm, 2m x 1m', 1, '', '42.20', 7, 2, 0, 1),\
      (4, 'rs.flipchart', NULL, 'Flip chart with paper', 'Visualize your processes on our flip chart. Metal stand with a large pad that can be written on with markers.', 2, '', '10.00', 7, 3, 0, 1),\
      (5, 'rs.metaplan', NULL, 'Metaplan wall / pin board covered with paper', '', 2, '', '10.00', 7, 4, 0, 1),\
      (6, 'rs.prcase', NULL, 'Presenters case', 'Lockable, robust presentation case with carrying handle and carrying strap for a clear and orderly arrangement of items filled with scissors, glue sticks, masking tape, pincushions, cutter knives, flipchart pens, jumbo markers, marking pins, marking dots and various presentation cards.', 2, '', '30.00', 7, 5, 0, 1),\
      (7, 'rs.staff', NULL, 'Staff surcharge per hour', '(e.g. buffet, champagne reception with service)', 2, '', '24.73', 7, 6, 0, 1),\
      (8, 'rs.lectern', NULL, 'Lectern', '', 2, '', '25.21', 7, 7, 0, 1),\
      (9, 'rs.4kled', '65 inch TV', 'Smart 4k LED TV - 65 inches', 'Flat screen LED TV with 65 inch and 4k Ulta HD For presentations, watching videos, video conferences, monitor, TV via DVBT2, etc... in any lighting condition! Internet capable | PurColor | HDR (High Dynamic Range) | Smart Remote | Autodetection ( automatic recognition of devices) rollable TV stand - height adjustable and with two shelves (e.g.: laptop and camera)', 1, '', '50.42', 7, 8, 0, 1),\
      (10, 'rs.penpad', NULL, 'Pen and writing pad', 'Ballpoint pen and writing pad', 2, '', '2.94', 7, 9, 0, 1),\
      (11, 'rs.tvadjustable', NULL, 'TV with electronic position adjustment (vertical and horizontal)', 'The screen can be tilted horizontally so that you can work on it like you would at a table.', 2, '', '90.00', 7, 10, 0, 1),\
      (12, 'rs.seating', NULL, 'Rearrangement of seating', '', 2, '', '75.00', 7, 11, 0, 1),\
      (13, 'rs.wireless', NULL, 'Wireless Internet access', '50 mbit', 2, '', '21.00', 7, 12, 0, 1),\
      (14, 'rs.whiteboard', NULL, 'Whiteboard with board markers and magnets', '', 2, '', '10.00', 7, 13, 0, 1),\
      (15, 'rs.alldaydrinks', NULL, 'Drinks flat rate all day', 'Per person/individually or combine with packages. <br>Drink as much as you want of non-alcoholic soft drinks, coffee and mineral water 0.5l.', 3, '', '15.55', 7, 14, 1, 1),\
      (16, 'rs.halfdaydrinks', NULL, 'Drinks flat rate half day', 'Per person/individually or combine with packages. <br>Drink as much as you want of non-alcoholic soft drinks, coffee and mineral water 0.5l.', 3, '', '10.50', 7, 15, 1, 1),\
      (17, 'rs.coffeebreak', NULL, 'No. 3 coffee break', 'Per person, with a minimum number depending on the room. <br>3. (Sweet) coffee break : pastries & pastries - 1x hot drink for free', 3, '', '7.29', 7, 16, 1, 1),\
      (18, 'rs.', NULL, 'name', 'desc', 3, '', '10.00', 7, 17, 1, 1),\
      (19, 'rs.cake', NULL, 'Cake / cake according to customer requirements at daily price', '', 3, '', '0.00', 7, 100, 15, 1);", function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " Rows inserted to roomservice table.");
      });
    }     
  });
  //which room has what service available.
  //if roomservice type is 1 then insert what rooms is capable here
  con.query("CREATE TABLE IF NOT EXISTS roomservice_catering_group ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    i18name varchar(20),\
    name VARCHAR(100), \
    picture VARCHAR(50), \
    sort INTEGER,\
    active BOOLEAN DEFAULT 1 \
    ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    if(!result.warningCount){
      con.query("INSERT INTO `roomservice_catering_group` (`i18name`, `name`, `sort`) VALUES\
      ('cat.special', 'Special offers', 1),\
      ('cat.snacks', 'Korns_Snacks', 2),\
      ('cat.snacks', 'Korns_Snacks', 3),\
      ('cat.snacks', 'Korns_Snacks', 4),\
      ('cat.snacks', 'Korns_Snacks', 5),\
      ('cat.snacks', 'Korns_Snacks', 6),\
      ('cat.snacks', 'Korns_Snacks', 7),\
      ('cat.snacks', 'Korns_Snacks', 8),\
      ('cat.snacks', 'Korns_Snacks', 9),\
      ('cat.snacks', 'Korns_Snacks', 10),\
      ('cat.snacks', 'Korns_Snacks', 11),\
      ('cat.snacks', 'Korns_Snacks', 12),\
      ('cat.snacks', 'Korns_Snacks', 13),\
      ('cat.aperatifs', 'Aperitifs', 14),\
      ('cat.cakes', 'Cakes and tarts for afternoon coffee', 15)", function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " Rows inserted to roomservice_catering_group table.");
      });
    }
  });

  con.query("CREATE TABLE IF NOT EXISTS roomservice_room ( \
    roomserviceID INTEGER, \
    roomID INTEGER \
    ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    if(!result.warningCount){
      con.query("INSERT INTO `roomservice_room` (`roomserviceID`, `roomID`) VALUES\
      (1, 1),(1, 2),(2, 1),(3, 1),(3, 2),(3, 3),(9, 1),(9, 2);", function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " Rows inserted to roomservice_room table.");
      });
    }   
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
    calculated_total DECIMAL(8,2), \
    offer_total DECIMAL(8,2), \
    statusID TINYINT, \
    active BOOLEAN DEFAULT 1 \
  ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  //DECIMAL(12,2) 1234567890.12 total (12 digits with decimal) 8 allocates 4 bytes, 12-8=4 allocates 2 bytes. 6 bytes total.
  //int is 4 bytes, DATE is 3 bytes, DATETIME is 8 bytes
  con.query("CREATE TABLE IF NOT EXISTS report_resorder ( \
    id INTEGER AUTO_INCREMENT PRIMARY KEY, \
    log VARCHAR(255), \
    log_time TIMESTAMP, \
    resorderId INTEGER NOT NULL, \
    calculated_total DECIMAL(12,4), \
    offer_total DECIMAL(12,4), \
    statusID TINYINT, \
    active BOOLEAN DEFAULT 1 \
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
  console.log("Mysql Tables are ready.");
  con.release();
});

module.exports = connPool;



// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('1','1','200','0','7')"//korn
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('2','1','160','0','7')"//korn
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('3','1','85','0','7')"//korn
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('4','1','120','0','7')"//korn
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('5','1','198','0','7')"//korn
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('6','1','188','0','7')"//korn
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('7','1','120','0','7')"//korn
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('1','2','50','0','7')"//burg
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('2','2','40','0','7')"//burg
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('3','2','35','0','7')"//burg
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('4','2','75','0','7')"//burg
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`, `active`) VALUES ('5','2','0','0','0','0')"//burg
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('6','2','60','0','7')"//burg
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('7','2','75','0','7')"//burg
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('8','2','130','0','7')"//burg
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('1','3','20','0','7')"//sebald
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('2','3','16','0','7')"//sebald
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('3','3','16','0','7')"//sebald
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('4','3','14','0','7')"//sebald
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('5','3','25','0','7')"//sebald
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('6','3','16','0','7')"//sebald
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('7','3','18','0','7')"//sebald
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('1','4','16','0','7')"//darling
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('2','4','12','0','7')"//darling
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('3','4','12','0','7')"//darling
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('4','4','10','0','7')"//darling
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('5','4','21','0','7')"//darling
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('6','4','16','0','7')"//darling
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('7','4','18','0','7')"//darling
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('1','5','20','0','7')"//lorenz
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('2','5','16','0','7')"//lorenz
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('3','5','16','0','7')"//lorenz
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('4','5','14','0','7')"//lorenz
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('5','5','25','0','7')"//lorenz
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('6','5','16','0','7')"//lorenz
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('7','5','18','0','7')"//lorenz
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('1','6','20','0','7')"//dürer
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('2','6','16','0','7')"//dürer
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('3','6','16','0','7')"//dürer
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('4','6','14','0','7')"//dürer
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('5','6','25','0','7')"//dürer
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('6','6','16','0','7')"//dürer
// "INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('7','6','18','0','7')"//dürer

// INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES 
// ('1','1','200','0','7'),('2','1','160','0','7'),('3','1','85','0','7'),('4','1','120','0','7'),('5','1','198','0','7'),('6','1','188','0','7'),('7','1','120','0','7'),
// ('1','2','50','0','7'),('2','2','40','0','7'),('3','2','35','0','7'),('4','2','75','0','7');
// INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`, `active`) VALUES ('5','2','0','0','0','0');
// INSERT INTO `seat_plans_room`(`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`) VALUES ('6','2','60','0','7'),('7','2','75','0','7'),('8','2','130','0','7'),('1','3','20','0','7'),('2','3','16','0','7'),('3','3','16','0','7'),('4','3','14','0','7'),('5','3','25','0','7'),('6','3','16','0','7'),('7','3','18','0','7'),('1','4','16','0','7'),('2','4','12','0','7'),('3','4','12','0','7'),('4','4','10','0','7'),('5','4','21','0','7'),('6','4','16','0','7'),('7','4','18','0','7'),('1','5','20','0','7'),('2','5','16','0','7'),('3','5','16','0','7'),('4','5','14','0','7'),('5','5','25','0','7'),('6','5','16','0','7'),('7','5','18','0','7'),('1','6','20','0','7'),('2','6','16','0','7'),('3','6','16','0','7'),('4','6','14','0','7'),('5','6','25','0','7'),('6','6','16','0','7'),('7','6','18','0','7');

// //INSERT INTO `room`(`name`, `description`, `type`, `picture`, `person_capacity`, `cost_room`, `cost_room_vat`, `cost_person`, `cost_person_vat`, `prep_minute`) VALUES ('Dürer (2a)','Small Room','1','sebald2c.png','25','159.66','7','10','7','15');

// INSERT INTO `seat_plans`(`i18name`, `description`, `picture`, `min_capacity`, `cost`, `cost_vat`) VALUES ('seminar','Seminar','Seminar.jpg','14','0','0');
// INSERT INTO `seat_plans`(`i18name`, `description`, `picture`, `min_capacity`, `cost`, `cost_vat`) VALUES ('block','Blocktafel','Blocktafel.jpg','12','0','0');
// INSERT INTO `seat_plans`(`i18name`, `description`, `picture`, `min_capacity`, `cost`, `cost_vat`) VALUES ('u_form','U-Form','U-Form.jpg','12','0','0');
// INSERT INTO `seat_plans`(`i18name`, `description`, `picture`, `min_capacity`, `cost`, `cost_vat`) VALUES ('parl','Parlament','Parlament.jpg','14','0','0');
// INSERT INTO `seat_plans`(`i18name`, `description`, `picture`, `min_capacity`, `cost`, `cost_vat`) VALUES ('chairs','Stuhlreihen','Stuhlreihen.jpg','20','0','0');
// INSERT INTO `seat_plans`(`i18name`, `description`, `picture`, `min_capacity`, `cost`, `cost_vat`) VALUES ('bank','Bankett','Bankett.jpg','12','0','0');
// INSERT INTO `seat_plans`(`i18name`, `description`, `picture`, `min_capacity`, `cost`, `cost_vat`) VALUES ('circle','Stuhlkreis','Stuhlkreis.jpg','8','0','0');
// INSERT INTO `seat_plans`(`i18name`, `description`, `picture`, `min_capacity`, `cost`, `cost_vat`) VALUES ('cinema','Kino','Kino.jpg','130','0','0');

// INSERT INTO `room` (`id`, `name`, `description`, `type`, `picture`, `person_capacity`, `cost_room`, `cost_room_vat`, `cost_person`, `cost_person_vat`, `prep_minute`) VALUES
// (1, 'Korn (S1)', 'default offer\nRoom booking with the possibility to book interior design offers and catering offers individually\n \nup to 60 people\nHalf day (up to 4 hours) €181.50\nFull day (from 4 hours) €319.00\n \nSpecial surcharges for half a day (up to 4 hours)\nSpecial surcharge: Evenings after 6 p.m. (per hour) €10.00\nWeekend or public holiday surcharge (per hour) €10.00\n \nSpecial surcharges all day (from 4 hours)\nSpecial surcharge: Evenings after 6 p.m. (per hour) €10.00\nWeekend or public holiday surcharge (per hour) €10.00', 1, 'korns1.png', 198, 150, 18, 50, 18, 30),
// (2, 'Burgblick (S2)', 'fghfghfgh', 2, 'burgblicks2.png', 75, 55, 66, 7878, 0, 30),
// (3, 'Sebald (2c)', 'fghfghfgh', 1, 'sebald2c.png', 60, 55, 66, 7878, 0, 30),
// (4, 'Kleiner Liebling (1)', 'This room is 198 m² and there is a vintage bar just outside the door. It is good for presentations, meetings, celebration etc... ', 2, 'liebling1.png', 198, 500, 7, 55, 7, 30),
// (5, 'Lorenz (2b)', 'fghfghfgh', 1, 'lorenz2b.png', 75, 55, 66, 7878, 0, 30),
// (6, 'Dürer (2a)', 'Small Room', 1, 'sebald2c.png', 25, 159.66, 7, 10, 7, 15);