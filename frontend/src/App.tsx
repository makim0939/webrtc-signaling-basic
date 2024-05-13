import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import { Socket, io } from 'socket.io-client';
import { useEffect, useState } from 'react';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connection, setConnection] = useState<RTCPeerConnection | null>(null);
  useEffect(() => {
    const socket = io('http://localhost:3000');
    const connection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    setConnection(connection);
    setSocket(socket);
    return () => {
      socket.disconnect();
      connection.close();
    };
  }, []);
  if (!socket || !connection) return <></>;
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home socket={socket} connection={connection} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
