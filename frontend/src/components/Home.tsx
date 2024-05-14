import { useState } from 'react';
import TextForm from './TextForm';
import { Socket } from 'socket.io-client';

type WebSocketData = {
  sender: number;
  type: string;
  body: string;
};
type UserNameObj = {
  [key: string]: string;
};

const Home = (props: { socket: Socket; connection: RTCPeerConnection }) => {
  const [id, setId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserNameObj>({});

  props.socket.on('connect', () => {
    console.log('Connected to server');
    setId('' + props.socket.id);
  });
  props.socket.on('message', (data: WebSocketData) => {
    console.log(data);
  });
  props.socket.on('onOnline', (jsonData: string) => {
    const data = JSON.parse(jsonData) as UserNameObj;
    setUsers(data);
  });
  props.socket.on('rename', (jsonData: string) => {
    const data = JSON.parse(jsonData) as UserNameObj;
    setUsers(data);
  });
  props.socket.on('handshake', ({ from, jsonData }: { from: string; jsonData: string }) => {
    const data = JSON.parse(jsonData);
    if (data.type === 'request') {
      if (window.confirm(users[from] ? users[from] : from + 'からリクエスト')) {
        props.connection
          .createOffer()
          .then((offer) => {
            props.connection.setLocalDescription(offer);
          })
          .then(() => {
            const resData = JSON.stringify({ type: 'sdp-offer', data: props.connection.localDescription });
            props.socket.emit('handshake', { from: id, to: from, jsonData: resData });
          });
      } else return;
    }
    if (data.type === 'sdp-offer') {
      props.connection
        .setRemoteDescription(new RTCSessionDescription(data.data))
        .then(() => props.connection.createAnswer())
        .then((answer) => props.connection.setLocalDescription(answer))
        .then(() => {
          const resData = JSON.stringify({ type: 'sdp-answer', data: props.connection.localDescription });
          props.socket.emit('handshake', { from: id, to: from, jsonData: resData });
        });
    }
    if (data.type === 'sdp-answer') {
      props.connection.setRemoteDescription(new RTCSessionDescription(data.data));
    }
  });
  props.socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  const rename = (name: string) => {
    if (!id) return;
    props.socket.emit('rename', name);
    users[id] = name;
    setUsers(users);
  };
  const connect = (key: string) => {
    console.log('connect');
    const data = JSON.stringify({ type: 'request', data: '' });
    props.socket.emit('handshake', { from: id, to: key, jsonData: data });
  };

  if (!id) return;
  return (
    <>
      <h2>Home</h2>
      <div>
        <p>
          <b>| Your Profile</b>
        </p>
        <p>ID: {id}</p>
        <p>Name: {users[id]}</p>
        <TextForm onSubmit={rename} />
      </div>
      <div>
        <p>
          <b>| Participants</b>
        </p>
        <div>
          {Object.keys(users).map((key) => (
            <div key={key}>
              {key !== id && (
                <p>
                  {key + ' : ' + (users[key] ? users[key] : 'Anonymous')}{' '}
                  <button
                    onClick={() => {
                      connect(key);
                    }}
                  >
                    接続
                  </button>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
