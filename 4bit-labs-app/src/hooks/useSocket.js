import { useEffect } from 'react';
import { useSocketContext } from '../context/SocketContext';

/**
 * Custom hook to subscribe to real-time events.
 * 
 * @param {string} event - The socket event name to listen for (e.g. 'course:updated')
 * @param {function} callback - The function to call when the event occurs
 */
export const useSocket = (event, callback) => {
  const socket = useSocketContext();

  useEffect(() => {
    if (!socket || !event || !callback) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [socket, event, callback]);

  return socket;
};
