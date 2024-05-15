import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import { Socket, io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import TalkRoom from './components/TalkRoom';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connection, setConnection] = useState<RTCPeerConnection | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:3000');
    const peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

    let sender: RTCRtpSender;
    navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then((stream) => {
      setStream(stream);

      stream.getTracks().forEach((track) => {
        try {
          sender = peerConnection.addTrack(track, stream);
        } catch (e) {
          console.log(e);
        }
      });
    });

    peerConnection.onicecandidate = (e) => {
      if (!e.candidate) {
        socket.emit('ice-candidate', { id: socket.id, data: '' });
        return;
      }
      const data = JSON.stringify(e.candidate);
      socket.emit('ice-candidate', { id: socket.id, data });
    };

    setConnection(peerConnection);
    setSocket(socket);

    return () => {
      socket.disconnect();

      sender && peerConnection.removeTrack(sender);
      peerConnection.close();
    };
  }, []);
  if (!socket || !connection || !stream) return <></>;
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home socket={socket} connection={connection} />} />
          <Route path="/talkroom" element={<TalkRoom socket={socket} connection={connection} stream={stream} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
