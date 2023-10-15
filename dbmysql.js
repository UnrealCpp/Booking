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
        (6, 'Dürer (2a)', 'Small Room', 1, 'sebald2c.png', 25, 159.66, 7, 10, 7, 15)", function (err, result) {
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
    statusID TINYINT \
  ) ENGINE=InnoDB;", function (err, result) {
    if (err) throw err;
    //console.log("Result: " + result);
  });
  //id 1-en 1-de 1-tr 2-en 2-de..
  //lang en de ru tr
  con.query("CREATE TABLE IF NOT EXISTS status ( \
    id INTEGER NOT NULL,\
    lang VARCHAR(10) NOT NULL, \
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
      if(!result.warningCount){     
        con.query("INSERT INTO `seat_plans_room` (`seat_plansID`, `roomID`, `capacity_room`, `cost_room`, `cost_room_vat`, `active`) VALUES\
        (1, 1, 200, '0.00', 7, 1),(2, 1, 160, '0.00', 7, 1),(3, 1, 85, '0.00', 7, 1),(4, 1, 120, '0.00', 7, 1),(5, 1, 198, '0.00', 7, 1),(6, 1, 188, '0.00', 7, 1),(7, 1, 120, '0.00', 7, 1),\
        (1, 2, 50, '0.00', 7, 1),(2, 2, 40, '0.00', 7, 1),(3, 2, 35, '0.00', 7, 1),(4, 2, 75, '0.00', 7, 1),(5, 2, 0, '0.00', 0, 0),(6, 2, 60, '0.00', 7, 1),(7, 2, 75, '0.00', 7, 1),(8, 2, 130, '0.00', 7, 1),\
        (1, 3, 20, '0.00', 7, 1),(2, 3, 16, '0.00', 7, 1),(3, 3, 16, '0.00', 7, 1),(4, 3, 14, '0.00', 7, 1),(5, 3, 25, '0.00', 7, 1),(6, 3, 16, '0.00', 7, 1),(7, 3, 18, '0.00', 7, 1),\
        (1, 4, 16, '0.00', 7, 1),(2, 4, 12, '0.00', 7, 1),(3, 4, 12, '0.00', 7, 1),(4, 4, 10, '0.00', 7, 1),(5, 4, 21, '0.00', 7, 1),(6, 4, 16, '0.00', 7, 1),(7, 4, 18, '0.00', 7, 1),\
        (1, 5, 20, '0.00', 7, 1),(2, 5, 16, '0.00', 7, 1),(3, 5, 16, '0.00', 7, 1),(4, 5, 14, '0.00', 7, 1),(5, 5, 25, '0.00', 7, 1),(6, 5, 16, '0.00', 7, 1),(7, 5, 18, '0.00', 7, 1),\
        (1, 6, 20, '0.00', 7, 1),(2, 6, 16, '0.00', 7, 1),(3, 6, 16, '0.00', 7, 1),(4, 6, 14, '0.00', 7, 1),(5, 6, 25, '0.00', 7, 1),(6, 6, 16, '0.00', 7, 1),(7, 6, 18, '0.00', 7, 1)", function (err, result) {
          if (err) throw err;
        });
      }
      
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