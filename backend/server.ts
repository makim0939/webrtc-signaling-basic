import http from 'http';
import socketIo from 'socket.io';

const server = http.createServer();

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

const io = new socketIo.Server(server, {
  cors: { origin: 'http://localhost:5173' },
});

type UserNameObj = {
  [key: string]: string;
};
const users = new Object() as UserNameObj;
io.on('connection', (socket) => {
  console.log(socket.id);
  users[socket.id] = '';
  socket.on('message', () => {});
  socket.on('rename', (name: string) => {
    users[socket.id] = name;
    socket.emit('message', 'rename to ' + name);
  });
  socket.on('disconnect', () => {
    console.log('Disconnected');
  });
});
