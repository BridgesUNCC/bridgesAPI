var socketio = require('socket.io');

module.exports.listen = function(app) {
  var io = socketio.listen(app);
  var socks = {};


  io.sockets.on('connection', function (socket) {
    console.log('adding new socket', socket.id);
    socks[socket.id] = "user";

    socket.join('user1_assignment1');
    socket.broadcast.to('user1_assignment1').emit('announcement', {message: "User " + socket.id + " connected"});

    /* Receives keydown events from web-based application sockets */
    socket.on('keydown', function (data) {
      console.log('keydown', { pressed: 'key ' + data.key, sock: socket.id });
      socket.broadcast.to('user1_assignment1').emit('keydown', { pressed: 'key ' + data.key });
    });

    /* Receives dataframe events from client-based sockets */
    socket.on('dataframe', function (dataframe) {
        console.log('dataframe', {data: dataframe, sock: socket.id });
        socket.broadcast.to('user1_assignment1').emit('dataframe', { dataframe: dataframe });
    });

    socket.on('disconnect', function() {
      if(socket && socket.id) {
        console.log(socket.id, 'logged off');
        socket.broadcast.to('user1_assignment1').emit('announcement', {message: "User " + socket.id + " disconnected"});
        delete socks[socket.id];
      } else {
        console.log('okbye');
      }
    });


  });

  return io;
};
