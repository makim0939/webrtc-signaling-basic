import http from 'http';
import socketIo from 'socket.io';

const server = http.createServer();

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

const io = new socketIo.Server(server, {
  cors: { origin: 'http://localhost:5173' },
});

io.on('connection', (socket) => {
  console.log('New connection');
  socket.on('message', () => {});
  socket.on('disconnect', () => {
    console.log('Disconnected');
  });
});
