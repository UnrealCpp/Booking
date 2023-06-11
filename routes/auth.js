var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
var GoogleStrategy = require('passport-google-oidc');
//var db = require('../db');
var conn = require('../dbmysql');
var ROLES = require('../config');
//https://www.passportjs.org/tutorials/google/configure/
//you registered the app with Google.
//Then, added the client ID and secret in .env file.
//here configure the GoogleStrategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/oauth2/redirect/google',
  scope: [ 'profile']
}, function verify(issuer, profile, cb) {
  conn.query('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
    issuer,
    profile.id
  ], function(err, row) {

    if (err) { return cb(err); }
    if (!row.length) {
      conn.query('INSERT INTO users (name) VALUES (?)', [
        profile.displayName
      ], function(err,result) {
        if (err) { return cb(err); }
   
        var id = result.insertId; 
        conn.query('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
          id,
          issuer,
          profile.id
        ], function(err,result) {
          if (err) { return cb(err); }
          var user = {
            id: id,
            name: profile.displayName,
            role: 3
          };
          conn.query('INSERT INTO users_roles (usersID, rolesID) VALUES (?, ?)', [
            id,
            3
          ], function(err, rows) {
            if (err) { return next(err); }             
          });
          return cb(null, user);
        });
      });
    } else {    
      conn.query('SELECT * FROM users WHERE id = ?', [ row[0].user_id ], function(err, row) {
        if (err) { return cb(err); }
        if (!row.length) { return cb(null, false); }
        return cb(null, row[0]);
      });
    }
  });
}));
/* Configure password authentication strategy.
 *
 * The `LocalStrategy` authenticates users by verifying a username and password.
 * The strategy parses the username and password from the request and calls the
 * `verify` function.
 *
 * The `verify` function queries the database for the user record and verifies
 * the password by hashing the password supplied by the user and comparing it to
 * the hashed password stored in the database.  If the comparison succeeds, the
 * user is authenticated; otherwise, not.
 */
passport.use(new LocalStrategy(function verify(username, password, cb) {
  
  conn.query('SELECT * FROM users WHERE username = ?', [ username ], function(err, row) {
    if (err) { return cb(err); }
    if (!row.length) { return cb(null, false, { message: 'Incorrect username or password.' }); }

    crypto.pbkdf2(password, row[0].salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) { return cb(err); }
      if (!crypto.timingSafeEqual(row[0].hashed_password, hashedPassword)) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }

      return cb(null, row[0]);
    });
  });
}));



/* Configure session management.
 *
 * When a login session is established, information about the user will be
 * stored in the session.  This information is supplied by the `serializeUser`
 * function, which is yielding the user ID and username.
 *
 * As the user interacts with the app, subsequent requests will be authenticated
 * by verifying the session.  The same user information that was serialized at
 * session establishment will be restored when the session is authenticated by
 * the `deserializeUser` function.
 *
 * Since every request to the app needs the user ID and username, in order to
 * fetch todo records and render the user element in the navigation bar, that
 * information is stored in the session.
 */

passport.serializeUser(function(user, cb) {
  conn.query('SELECT * FROM users_roles WHERE usersID = ?', [
    user.id
  ], function(err, rows) {
    if (err) { return next(err); }    
    //if   
      process.nextTick(function() {
        cb(null, { id: user.id, username: user.username, name:user.name , roles: rows.map(r=>{return r.rolesID})});
      });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


var router = express.Router();

/** GET /login
 *
 * This route prompts the user to log in.
 *
 * The 'login' view renders an HTML form, into which the user enters their
 * username and password.  When the user submits the form, a request will be
 * sent to the `POST /login/password` route.
 *
 * @openapi
 * /login:
 *   get:
 *     summary: Prompt the user to log in using a username and password
 *     responses:
 *       "200":
 *         description: Prompt.
 *         content:
 *           text/html:
 */
router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
}));
/** POST /login/password
 *
 * This route authenticates the user by verifying a username and password.
 *
 * A username and password are submitted to this route via an HTML form, which
 * was rendered by the `GET /login` route.  The username and password is
 * authenticated using the `local` strategy.  The strategy will parse the
 * username and password from the request and call the `verify` function.
 *
 * Upon successful authentication, a login session will be established.  As the
 * user interacts with the app, by clicking links and submitting forms, the
 * subsequent requests will be authenticated by verifying the session.
 *
 * When authentication fails, the user will be re-prompted to login and shown
 * a message informing them of what went wrong.
 *
 * @openapi
 * /login/password:
 *   post:
 *     summary: Log in using a username and password
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: number
 *     responses:
 *       "302":
 *         description: Redirect.
 */
router.post('/login/password', passport.authenticate('local', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login',
  failureMessage: true
}));

/* POST /logout
 *
 * This route logs the user out.
 */
router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

/* GET /signup
 *
 * This route prompts the user to sign up.
 *
 * The 'signup' view renders an HTML form, into which the user enters their
 * desired username and password.  When the user submits the form, a request
 * will be sent to the `POST /signup` route.
 */
router.get('/signup', function(req, res, next) {
  res.render('signup');
});

/* POST /signup
 *
 * This route creates a new user account.
 *
 * A desired username and password are submitted to this route via an HTML form,
 * which was rendered by the `GET /signup` route.  The password is hashed and
 * then a new user record is inserted into the database.  If the record is
 * successfully created, the user is logged in.
 */
router.post('/signup', function(req, res, next) {
  var salt = crypto.randomBytes(16);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
    if (err) { return next(err); }
    conn.query('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
      req.body.username,
      hashedPassword,
      salt
    ], function(err,result) {
      if (err) { return next(err); }
      conn.query('INSERT INTO users_roles (usersID, rolesID) VALUES (?, ?)', [
        result.insertId,
        3
      ], function(err, rows) {
        if (err) { return next(err); }             
      });
      var user = {
        id: result.insertId,
        username: req.body.username,
        role: 3
      };
      req.login(user, function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });
  });
});

module.exports = router;
