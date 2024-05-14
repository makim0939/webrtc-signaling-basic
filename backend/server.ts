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
  users[socket.id] = '';
  socket.emit('onOnline', JSON.stringify(users));
  socket.broadcast.emit('onOnline', JSON.stringify(users));
  socket.on('message', () => {});
  socket.on('rename', (name: string) => {
    console.log('Renamed');
    users[socket.id] = name;
    socket.broadcast.emit('rename', JSON.stringify(users));
  });
  socket.on('handshake', ({ from, to, jsonData }: { from: string; to: string; jsonData: string }) => {
    const data = JSON.parse(jsonData);
    console.log(from, to, data);
    if (data.type === 'request') {
      socket.join(from + to);
      socket.to(to).emit('handshake', { from, jsonData });
    }
    if (data.type === 'sdp-offer') {
      socket.join(from + to);
      socket.to(from + to).emit('handshake', { from, jsonData });
    }
    if (data.type === 'sdp-answer') {
      socket.join(from + to);
      socket.to(from + to).emit('handshake', { from, jsonData });
    }
  });
  socket.on('disconnect', () => {
    console.log('Disconnected');
    delete users[socket.id];
  });
});
