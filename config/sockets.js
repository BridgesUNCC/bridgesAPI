var socketio = require('socket.io');
var mongoose = require('mongoose'),
    User = mongoose.model('User');

// check user credentials
// if a user + apikey exists, facilitate channel creation/join
// else, reject
var valid = function(creds, cb) {
  User
    .findOne({
        apikey: creds.apikey,
        username: creds.user
    })
    .exec(function(err, user) {
        if (err || !user) {
          console.log(err, user);
          cb(false);
        }
        console.log('returning true');
        cb(true);
    });
};

module.exports = function(server) {

  var io = socketio.listen(server);
  io.set('transports', ['websocket']);
  var socks = {};
  var verbose = false;

  io.on('connection', function (socket) {

    if(verbose) console.log('I see a new socket:', socket.id);


    /* Receive credentials from socket */
    socket.on('credentials', function(data) {
	var credentials;
	try {
		credentials = JSON.parse(data);
	} catch (err) {
	    if (verbose)
		console.log('Malformed JSON credentials: ', credentials);
	    else
		console.log('Malformed JSON credentials');
	    return;
	}

      /* Validate Credentials */
      valid(credentials, function(proceed){

        // invalid credentials
        if(!proceed) {
          if(verbose) console.log('Invalid credentials', socket.id);
          return;
        }

        // valid, proceed
        if(verbose) console.log('Validated credentials, joining channel', socket.id);

        /* Identify sockets with unique user_assignment pairs */
        var channel = credentials.user + "_" + credentials.assignment;

        /* Associate socket id with channel */
        socks[socket.id] = channel;

        /* Join unique channel */
        socket.join(channel);
        if(verbose) {
          console.log("User " + socket.id + " connected to channel " + channel);
          console.log('All sockets: ', socks);
        }

        /* Count users in current channel */
        var usersInChannel = io.sockets.adapter.rooms[channel].length;

        /* Emit announcement to everyone in channel to validate connection */
        io.sockets.in(channel).emit('announcement', {message: "User " + socket.id + " connected to channel " + channel, userCount: usersInChannel});

      });
    });


    /* Receives keydown events from web-based application sockets */
    socket.on('keydown', function (data) {
      if(verbose) console.log('keydown', { key: data.key, sock: socket.id, channel: socks[socket.id] });
      socket.broadcast.to(socks[socket.id]).emit('keydown', { key: data.key, type: 'keydown' });
    });

    /* Receives keyup events from web-based application sockets */
    socket.on('keyup', function (data) {
      if(verbose) console.log('keyup', { key: data.key, sock: socket.id, channel: socks[socket.id] });
      socket.broadcast.to(socks[socket.id]).emit('keyup', { key: data.key, type: 'keyup' });
    });

    /* Receives dataframe events from client-based sockets */
    socket.on('dataframe', function (dataframe) {
        if(verbose) console.log('dataframe', {data: dataframe, sock: socket.id, channel: socks[socket.id] });
        socket.broadcast.to(socks[socket.id]).emit('dataframe', { dataframe: dataframe });
    });

    /* Receives grid events from client-based sockets */
    socket.on('grid:recv', function (gridData) {
        if(verbose) console.log('grid', {data: gridData, sock: socket.id, channel: socks[socket.id] });
        socket.broadcast.to(socks[socket.id]).emit('grid:send', { gridData: gridData });
    });

    /* Receives grid events from client-based sockets */
    socket.on('gamegrid:recv', function (gridData) {
        if(verbose) console.log('gamegrid', {data: gridData, sock: socket.id, channel: socks[socket.id] });
        socket.broadcast.to(socks[socket.id]).emit('gamegrid:send', { gridData: gridData });
    });

    socket.on('disconnect', function() {
      if(socket && socket.id) {
        if(verbose) console.log(socket.id, 'logged off');

        var channel = socks[socket.id];

        /* If the channel has users in it, inform them that someone disconnected */
        if(io.sockets.adapter.rooms[channel]) {
          var usersInChannel = io.sockets.adapter.rooms[channel].length;

          io.sockets.in(channel).emit('announcement', {message: "User " + socket.id + " disconnected", userCount: usersInChannel});
        }

        delete socks[socket.id];
      } else {
        if(verbose) console.log('okbye');
      }
    });

  });

  return io;
};
