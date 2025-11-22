// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import useSocket from './useSocket';

const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const socket = useSocket(userId);

  // Obtener el token de autenticación
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Cargar notificaciones desde la API
  const loadNotifications = useCallback(async (page = 1, unread = false) => {
    if (!userId) return; // Evitar cargar si no hay userId

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page,
        limit: 20,
        unread: unread ? 'true' : 'false'
      });

      const response = await fetch(
        `http://localhost:3000/api/notifications?${params}`,
        {
          headers: getAuthHeaders()
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
      } else {
        throw new Error('Error al cargar notificaciones');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Solo depende de userId

  // Cargar contador de no leídas
  const loadUnreadCount = useCallback(async () => {
    if (!userId) return; // Evitar cargar si no hay userId

    try {
      const response = await fetch(
        'http://localhost:3000/api/notifications/unread-count',
        {
          headers: getAuthHeaders()
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Error al cargar contador de no leídas:', err);
    }
  }, [userId]); // Solo depende de userId

  // Marcar notificación como leída
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: getAuthHeaders()
        }
      );

      if (response.ok) {
        // Actualizar estado local
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, isRead: true }
              : notif
          )
        );

        // Actualizar contador
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err);
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/notifications/read-all',
        {
          method: 'PUT',
          headers: getAuthHeaders()
        }
      );

      if (response.ok) {
        // Actualizar estado local
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );

        // Resetear contador
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  }, []);

  // Eliminar notificación
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      );

      if (response.ok) {
        // Actualizar estado local
        const deletedNotif = notifications.find(n => n.id === notificationId);
        setNotifications(prev =>
          prev.filter(notif => notif.id !== notificationId)
        );

        // Actualizar contador si estaba no leída
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
    }
  }, [notifications]);

  // Escuchar notificaciones en tiempo real
  useEffect(() => {
    if (!socket) return;

    socket.on('new-notification', (notification) => {
      // Agregar nueva notificación al inicio
      setNotifications(prev => [notification, ...prev]);

      // Incrementar contador si no está leída
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      socket.off('new-notification');
    };
  }, [socket]);

  // Cargar contador de no leídas al cambiar userId
  useEffect(() => {
    if (userId) {
      loadUnreadCount();
    }
  }, [userId]); // Solo cargar contador, no todas las notificaciones

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};

export default useNotifications;