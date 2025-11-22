// src/hooks/useSocket.js
import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const useSocket = (userId) => {
  const socketRef = useRef(null);
  const connectionRef = useRef(null);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (connectionRef.current) {
      clearTimeout(connectionRef.current);
      connectionRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!userId || socketRef.current) return;

    // Configurar conexión con el servidor Socket.IO
    socketRef.current = io('http://localhost:3000', {
      transports: ['websocket'],
      upgrade: false
    });

    const socket = socketRef.current;

    // Conectar y unirse a la sala del usuario
    socket.on('connect', () => {
      console.log('🔌 Conectado al servidor Socket.IO');
      socket.emit('join-user-room', userId);
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor Socket.IO');
    });
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      disconnect();
      return;
    }

    // Pequeño delay para evitar reconexiones rápidas
    connectionRef.current = setTimeout(() => {
      connect();
    }, 100);

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  // Retornar el socket para uso directo
  return socketRef.current;
};

export default useSocket;