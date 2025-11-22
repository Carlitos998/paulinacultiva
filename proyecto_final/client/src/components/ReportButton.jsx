import { useState } from 'react';
import { IconButton, Tooltip, Snackbar, Alert, Button } from '@mui/material';
import { Flag } from 'lucide-react';
import ReportDialog from './ReportDialog';
import { useToast } from './Toast';
import { COLORS } from '../utils/colors';

function ReportButton({
  reportType,
  reportedItemId,
  itemName = '',
  size = 'small',
  variant = 'icon' // 'icon' o 'button'
}) {
  console.log('⚡ ReportButton montado:', { reportType, reportedItemId, itemName, variant });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const { showToast } = useToast();

  const handleSubmit = async ({ reason, description }) => {
    console.log('🎯 Enviando reporte:', { reportType, reportedItemId, reason });
    try {
      const token = localStorage.getItem('token');

      // URL directa como en PostCard_old.jsx
      let url;
      if (reportType === 'post') {
        url = `http://localhost:3000/recipes/${reportedItemId}/report`;
      } else if (reportType === 'comment') {
        // Obtener el recipeId de la URL actual como en PostCard_old.jsx
        const recipeId = window.location.pathname.split('/recipes/')[1]?.split('/')[0];
        url = `http://localhost:3000/recipes/${recipeId}/comments/${reportedItemId}/report`;
      } else {
        showToast('Tipo de reporte no válido', 'error', 3000);
        return;
      }

      console.log('🌐 URL del reporte:', url);

      const requestBody = {
        reason,
        description
      };

      console.log('📤 Enviando request:', {
        url,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token ? token.substring(0, 20) + '...' : 'NO_TOKEN'}`,
          'Content-Type': 'application/json'
        },
        body: requestBody
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        data
      });

      if (data.success) {
        showToast('Reporte enviado exitosamente', 'success', 3000);
      } else {
        showToast(data.message || 'Error al enviar el reporte', 'error', 3000);
      }

    } catch (error) {
      console.error('Error al enviar reporte:', error);
      showToast('Error de conexión al enviar el reporte', 'error', 3000);
    }
  };

  const handleOpenDialog = () => {
    console.log('🚀 Abriendo diálogo de reporte:', { reportType, reportedItemId });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  if (variant === 'button') {
    return (
      <>
        <Button
          variant="outlined"
          color="error"
          size={size}
          startIcon={<Flag size={16} />}
          onClick={handleOpenDialog}
          sx={{
            borderColor: COLORS.error,
            color: COLORS.error,
            '&:hover': {
              borderColor: '#d32f2f',
              bgcolor: 'rgba(244, 67, 54, 0.04)'
            }
          }}
        >
          Reportar
        </Button>

        <ReportDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          reportType={reportType}
          itemName={itemName}
        />
      </>
    );
  }

  return (
    <>
      <Tooltip title="Reportar contenido">
        <IconButton
          size={size}
          onClick={handleOpenDialog}
          sx={{
            color: COLORS.mutedText,
            '&:hover': {
              color: COLORS.error,
              bgcolor: 'rgba(244, 67, 54, 0.04)'
            }
          }}
        >
          <Flag size={size === 'small' ? 16 : 20} />
        </IconButton>
      </Tooltip>

      <ReportDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        reportType={reportType}
        itemName={itemName}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={notification.severity} onClose={() => setNotification(prev => ({ ...prev, open: false }))}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ReportButton;