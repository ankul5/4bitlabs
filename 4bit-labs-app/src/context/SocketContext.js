import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

// Replace with your backend URL when deploying. Use local IP for testing on physical device.
const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://10.18.152.17:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let newSocket;
    if (user) {
      newSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        
        // Join global room
        // The backend auto-joins 'global' internally, but we can explicitly emit if needed
        
        // Join school room
        if (user.schoolId) {
          const sId = typeof user.schoolId === 'object' ? user.schoolId._id || user.schoolId.id : user.schoolId;
          newSocket.emit('join:school', sId);
        }

        // Join admin room if relevant
        if (['mentor', 'school_admin', 'super_admin'].includes(user.role)) {
          newSocket.emit('join:admin');
        }
      });

      newSocket.on('connect_error', (error) => {
        console.warn('Socket connection error:', error.message);
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
