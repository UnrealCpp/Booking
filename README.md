This project is Forked from 
https://github.com/passport/todos-express-password

had to remove history for security issues

changed sqlite database to local MySql database connection

# .env file should be added in to the project to support Google Authentication

```bash
NODE_ENV=development
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SESSION_SECRET=
ADMIN_PASS=
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=pma
MYSQL_PASS=
MYSQL_DB_NAME=booking
SESSION_DB_NAME=sessions
```


# watch out for database connection. Auto creates tables inside  database: "booking" and  database: "sessions"
uses global local database username
TODO: 
* a setup page for db configuration...
* remove "INSERT IGNORE INTO..." querries to setup page only. "IGNORE" creates id gaps in tables. mySql innodb_autoinc_lock_mode=1 for auto_increment lock but it has performance cost. Check if value exists some other way then "INSERT INTO..." if neccesary.https://www.percona.com/blog/avoiding-auto-increment-holes-on-innodb-with-insert-ignore/
* unification of database names



# express-passport

This app illustrates how to use [Passport](https://www.passportjs.org/) with
[Express](https://expressjs.com/) to sign users in with a username and password or using their Google account.

## Quick Start

To run this app, clone the repository and install dependencies:

```bash
$ git clone https://github.com/burakdogmus/express-passport.git
$ cd express-passport
$ npm install
```

Then start the server.

```bash
$ npm run dev
```

Navigate to [`http://localhost:3000`](http://localhost:3000).


## License

[The Unlicense](https://opensource.org/licenses/unlicense)

## Credit

Created by [Jared Hanson](https://www.jaredhanson.me/)
