const room = require('express').Router();
//...

// Our app.use in the last file forwards a request to our room router.
// So this route actually handles `/room` because it's the root route when a request to /room is forwarded to our router.
room.get('/', function(req, res, next) {
  // res.send() our response here
});


// A route to handle requests to any individual album, identified by an album id
room.get('/:id', function(req, res, next) {
  let myAlbumId = req.params.id;
  // get album data from server and res.send() a response here
});

//...

module.exports = room;