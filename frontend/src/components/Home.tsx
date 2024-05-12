import { useCallback, useEffect, useState } from 'react';
import TextForm from './TextForm';
import io from 'socket.io-client';

type WebSocketData = {
  sender: number;
  type: string;
  body: string;
};

const Home = () => {
  const [id, setID] = useState<number | null>(null);
  const [name, setName] = useState<string>('');

  const socket = io('http://localhost:3000');
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });
    socket.on('message', (data: WebSocketData) => {
      console.log(data);
    });
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const rename = (name: string) => {
    if (!socket) return;
    console.log(name);
    socket.emit('rename', name);
    setName(name);
  };

  return (
    <>
      <h2>Home</h2>
      <div>
        <p>
          <b>| Your Profile</b>
        </p>
        <p>ID: {id}</p>
        <p>Name: {name}</p>
        <TextForm onSubmit={rename} />
      </div>
      <div>
        <p>
          <b>| Participants</b>
        </p>
      </div>
    </>
  );
};

export default Home;
