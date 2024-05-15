import { useEffect, useState } from 'react';
import TextForm from './TextForm';
import { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

type WebSocketData = {
  sender: number;
  type: string;
  body: string;
};
type UserInfoObj = {
  [key: string]: { name: string; iceCandidates: RTCIceCandidate[] };
};

const Home = (props: { socket: Socket; connection: RTCPeerConnection }) => {
  const [id, setId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserInfoObj>({});

  const navigate = useNavigate();
  useEffect(() => {
    props.socket.on('connect', () => {
      console.log('Connected to server');
      setId('' + props.socket.id);
    });
    props.socket.on('message', (data: WebSocketData) => {});
    props.socket.on('onOnline', (jsonData: string) => {
      console.log('onOnline');
      const data = JSON.parse(jsonData) as UserInfoObj;
      setUsers(data);
    });
    props.socket.on('rename', (jsonData: string) => {
      const data = JSON.parse(jsonData) as UserInfoObj;
      setUsers(data);
    });
    props.socket.on('talk-request', ({ from }: { from: string }) => {
      console.log('talk-request');
      if (window.confirm(users[from].name ? users[from].name : from + 'からリクエスト')) {
        props.connection.createOffer().then((offer) => {
          props.connection.setLocalDescription(offer).then(() => {
            const data = props.connection.localDescription!.toJSON();
            props.socket.emit('sdp-offer', { from: id, to: from, data: JSON.stringify(data) });
            navigate('talkroom', {
              state: { from: id, to: from },
            });
          });
        });
      } else return;
    });
    props.socket.on('sdp-offer', ({ from, data }: { from: string; data: string }) => {
      console.log('on sdp-offer');
      props.connection.setRemoteDescription(JSON.parse(data)).then(() => {
        props.connection.createAnswer().then((answer) => {
          props.connection.setLocalDescription(answer).then(() => {
            console.log(props.connection.remoteDescription?.sdp);
            const answerData = props.connection.localDescription!.toJSON();
            props.socket.emit('sdp-answer', { from: id, to: from, data: JSON.stringify(answerData) });
            navigate('talkroom', {
              state: { from: id, to: from },
            });
          });
        });
      });
    });

    return () => {
      props.socket.off('connect');
      props.socket.off('message');
      props.socket.off('onOnline');
      props.socket.off('rename');
      props.socket.off('talk-request');
      props.socket.off('sdp-offer');
    };
  }, [id, navigate, props.connection, props.socket, users]);

  // props.socket.on('handshake', ({ from, jsonData }: { from: string; jsonData: string }) => {
  //   const data = JSON.parse(jsonData);
  //   if (data.type === 'request') {
  //     if (window.confirm(users[from] ? users[from] : from + 'からリクエスト')) {
  //       props.connection
  //         .createOffer()
  //         .then((offer) => {
  //           props.connection.setLocalDescription(offer);
  //         })
  //         .then(() => {
  //           const resData = JSON.stringify({ type: 'sdp-offer', data: props.connection.localDescription });
  //           props.socket.emit('handshake', { from: id, to: from, jsonData: resData });
  //         });
  //     } else return;
  //   }
  //   if (data.type === 'sdp-offer') {
  //     props.connection
  //       .setRemoteDescription(new RTCSessionDescription(data.data))
  //       .then(() => props.connection.createAnswer())
  //       .then((answer) => props.connection.setLocalDescription(answer))
  //       .then(() => {
  //         const resData = JSON.stringify({ type: 'sdp-answer', data: props.connection.localDescription });
  //         props.socket.emit('handshake', { from: id, to: from, jsonData: resData });
  //       });
  //   }
  //   if (data.type === 'sdp-answer') {
  //     props.connection.setRemoteDescription(new RTCSessionDescription(data.data));
  //   }
  // });
  // props.socket.on('disconnect', () => {
  //   console.log('Disconnected from server');
  // });

  const rename = (name: string) => {
    if (!id) return;
    props.socket.emit('rename', name);
    users[id].name = name;
    setUsers(users);
  };
  const connect = (key: string) => {
    console.log('connect');
    props.socket.emit('talk-request', { from: id, to: key });
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
        <p>Name: {users[id].name}</p>
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
                  {key + ' : ' + (users[key].name ? users[key].name : 'Anonymous')}{' '}
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
