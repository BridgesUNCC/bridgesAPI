var socketio = require('socket.io');

module.exports.listen = function(app) {
  var io = socketio.listen(app);
  var socks = {};

  io.sockets.on('connection', function (socket) {
    console.log('adding new socket', socket.id);
    socks[socket.id] = "user";

    socket.on('keydown', function (data) {
      console.log('ok', { pressed: 'key ' + data.key });
      socket.emit('ok', { pressed: 'key ' + data.key, all: socks });
    });

    socket.on('disconnect', function(socket) {
      console.log('ok bye');
      delete socks[socket.id];
    });
  });

  return io;
};
