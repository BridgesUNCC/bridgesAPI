var socketio = require('socket.io');

module.exports = function(server) {

  var io = socketio.listen(server);
  io.set('transports', ['websocket']);
  var socks = {};
  var verbose = false;

  io.on('connection', function (socket) {

    if(verbose) console.log('I see a new socket:', socket.id);


    /* Receive credentials from socket */
    socket.on('credentials', function(data) {
      var credentials = JSON.parse(data);

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
      socket.broadcast.to(channel).emit('announcement', {message: "User " + socket.id + " connected to channel " + channel});
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
        socket.broadcast.to(socks[socket.id]).emit('announcement', {message: "User " + socket.id + " disconnected"});
        delete socks[socket.id];
      } else {
        if(verbose) console.log('okbye');
      }
    });


  });

  return io;
};
