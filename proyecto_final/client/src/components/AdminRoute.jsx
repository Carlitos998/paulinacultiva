import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:3000/me');
        setIsAdmin(response.data.isAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body1">Verificando permisos...</Typography>
      </Box>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/inicio" replace />;
  }

  return children;
}