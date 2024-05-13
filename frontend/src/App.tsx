import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import { Socket, io } from 'socket.io-client';
import { useEffect, useState } from 'react';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    const socket = io('http://localhost:3000');
    setSocket(socket);
    return () => {
      socket.disconnect();
    };
  }, []);
  if (socket === null) return <></>;
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home socket={socket} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
