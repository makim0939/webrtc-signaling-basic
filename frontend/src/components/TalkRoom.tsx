import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

const TalkRoom = (props: { socket: Socket; connection: RTCPeerConnection; stream: MediaStream }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from: string = location.state.from;
  const to: string = location.state.to;
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!props.connection.localDescription) {
      navigate('/');
    }
    localVideoRef.current && (localVideoRef.current.srcObject = props.stream);
    props.socket.on('sdp-answer', ({ data }: { data: string }) => {
      console.log('on sdp-answer');
      props.connection.setRemoteDescription(JSON.parse(data)).then(() => {
        console.log(props.connection.remoteDescription?.sdp);
      });
    });

    props.socket.on('ice-candidate', ({ data }: { data: string }) => {
      console.log(data);
      const candidates: RTCIceCandidate[] = JSON.parse(data);
      candidates.forEach(async (candidate: RTCIceCandidate) => {
        if (!candidate) return;
        props.connection.addIceCandidate(candidate);
      });
    });

    props.connection.ontrack = (e) => remoteVideoRef.current && (remoteVideoRef.current.srcObject = e.streams[0]);
    return () => {
      props.socket.off('sdp-answer');
    };
  }, [props.socket, props.connection, from, to, navigate, props.stream]);
  return (
    <div>
      <video ref={localVideoRef} autoPlay playsInline></video>
      <video ref={remoteVideoRef} autoPlay playsInline></video>
    </div>
  );
};

export default TalkRoom;
