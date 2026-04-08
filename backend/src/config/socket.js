const { Server } = require('socket.io');
const { env } = require('./env');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('join_dab', (dabId) => {
      socket.join(`dab_${dabId}`);
    });

    socket.on('leave_dab', (dabId) => {
      socket.leave(`dab_${dabId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io non initialisé');
  return io;
};

module.exports = { initSocket, getIO };
