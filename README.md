This project is Forked from 
https://github.com/passport/todos-express-password

had to remove history for security issues

changed sqlite database to local MySql database connection

# .env file should be added in to the project to support Google Authentication

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SESSION_SECRET=
```

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
