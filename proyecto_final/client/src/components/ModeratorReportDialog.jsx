import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Box,
  IconButton,
  Chip
} from '@mui/material';
import {
  CheckCircle,
  Trash2,
  X,
  AlertTriangle,
  Flag,
  XCircle
} from 'lucide-react';
import { COLORS } from '../utils/colors';

function ModeratorReportDialog({ open, onClose, onSubmit, report, type = 'content' }) {
  const [loading, setLoading] = useState(false);

  const handleResolve = async () => {
    setLoading(true);
    try {
      await onSubmit({ action: 'resolve' });
      onClose();
    } catch (error) {
      console.error('Error al resolver reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async () => {
    setLoading(true);
    try {
      await onSubmit({ action: 'delete_content' });
      onClose();
    } catch (error) {
      console.error('Error al eliminar contenido:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    setLoading(true);
    try {
      await onSubmit({ action: 'dismiss' });
      onClose();
    } catch (error) {
      console.error('Error al descartar reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeLabel = () => {
    if (report?.reportType === 'post') return 'Publicación';
    if (report?.reportType === 'comment') return 'Comentario';
    return 'Contenido';
  };

  const getReportReasonLabel = (reason) => {
    const labels = {
      spam: 'Spam',
      inappropriate_content: 'Contenido inapropiado',
      harassment: 'Acoso',
      violence: 'Violencia',
      copyright: 'Derechos de autor',
      misinformation: 'Información falsa',
      hate_speech: 'Discurso de odio',
      other: 'Otro'
    };
    return labels[reason] || reason;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      reviewed: 'info',
      resolved: 'success',
      dismissed: 'default'
    };
    return colors[status] || 'default';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        color: COLORS.bodyText,
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Flag size={24} color={COLORS.error} />
          Gestionar Reporte
        </Box>
        <IconButton onClick={onClose} size="small">
          <X />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" paragraph sx={{ fontWeight: 500 }}>
          Reporte #{report?.id}
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box>
            <Typography variant="body2" color={COLORS.mutedText} sx={{ mb: 1 }}>
              Tipo:
            </Typography>
            <Chip
              label={getReportTypeLabel()}
              size="small"
              color="primary"
            />
          </Box>

          <Box>
            <Typography variant="body2" color={COLORS.mutedText} sx={{ mb: 1 }}>
              Estado:
            </Typography>
            <Chip
              label={report?.status || 'pending'}
              size="small"
              color={getStatusColor(report?.status)}
            />
          </Box>

          <Box>
            <Typography variant="body2" color={COLORS.mutedText} sx={{ mb: 1 }}>
              Razón:
            </Typography>
            <Chip
              label={getReportReasonLabel(report?.reason)}
              size="small"
              variant="outlined"
            />
          </Box>

          <Box>
            <Typography variant="body2" color={COLORS.mutedText} sx={{ mb: 1 }}>
              Reportado por:
            </Typography>
            <Typography variant="body2">
              {report?.reporter?.username || 'Usuario'}
            </Typography>
          </Box>

          {report?.description && (
            <Box>
              <Typography variant="body2" color={COLORS.mutedText} sx={{ mb: 1 }}>
                Descripción:
              </Typography>
              <Typography variant="body2">
                {report.description}
              </Typography>
            </Box>
          )}

          {report?.reportedContent && (
            <Box>
              <Typography variant="body2" color={COLORS.mutedText} sx={{ mb: 1 }}>
                Contenido:
              </Typography>
              <Box sx={{
                p: 2,
                bgcolor: '#f5f5f5',
                borderRadius: 1,
                maxHeight: 100,
                overflow: 'auto'
              }}>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {report.reportType === 'post'
                    ? report.reportedContent?.titulo
                    : report.reportedContent?.contenido?.substring(0, 100) + '...'
                  }
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {report?.status === 'pending' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Este reporte está pendiente de revisión. Puedes marcarlo como revisado (conservar contenido), eliminar el contenido reportado, o descartar el reporte.
            </Typography>
          </Alert>
        )}

        {report?.status === 'resolved' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Este reporte ya ha sido resuelto y marcado como revisado.
            </Typography>
          </Alert>
        )}

        {report?.status === 'dismissed' && (
          <Alert severity="default" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Este reporte fue descartado por el moderador.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ padding: 2, gap: 1 }}>
        {report?.status === 'pending' && (
          <>
            <Button
              onClick={handleResolve}
              variant="contained"
              color="success"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle size={16} />}
              sx={{ flexGrow: 1 }}
            >
              {loading ? 'Procesando...' : '✅ Marcar como Revisado'}
            </Button>

            <Button
              onClick={handleDeleteContent}
              variant="contained"
              color="error"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <Trash2 size={16} />}
              sx={{ flexGrow: 1 }}
            >
              {loading ? 'Eliminando...' : '🗑️ Eliminar Contenido'}
            </Button>

            <Button
              onClick={handleDismiss}
              variant="contained"
              color="secondary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <XCircle size={16} />}
              sx={{ flexGrow: 1 }}
            >
              {loading ? 'Descartando...' : '❌ Descartar Reporte'}
            </Button>
          </>
        )}

        <Button
          onClick={onClose}
          variant="outlined"
          color="secondary"
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ModeratorReportDialog;