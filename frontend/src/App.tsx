import { useEffect } from 'react';
import io from 'socket.io-client';

function App() {
  useEffect(() => {
    const socket = io('http://localhost:3000');
    socket.on('connect', () => {
      console.log('Connected to server');
    });
  }, []);
  return <>a</>;
}

export default App;
