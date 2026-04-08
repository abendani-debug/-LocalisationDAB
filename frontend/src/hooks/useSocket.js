import { useEffect } from 'react';
import { io } from 'socket.io-client';

let socket = null;

const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || '', {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
};

export default function useSocket(onDabUpdate) {
  useEffect(() => {
    const s = getSocket();

    if (onDabUpdate) {
      s.on('dab_update', onDabUpdate);
    }

    return () => {
      if (onDabUpdate) s.off('dab_update', onDabUpdate);
    };
  }, [onDabUpdate]);
}

export const joinDABRoom = (dabId) => getSocket().emit('join_dab', dabId);
export const leaveDABRoom = (dabId) => getSocket().emit('leave_dab', dabId);
