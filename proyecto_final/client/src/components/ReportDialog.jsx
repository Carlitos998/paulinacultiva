import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Flag,
  AlertTriangle,
  Send
} from 'lucide-react';
import { COLORS } from '../utils/colors';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam o contenido no deseado', description: 'Publicidad repetitiva o contenido irrelevante' },
  { value: 'inappropriate_content', label: 'Contenido inapropiado', description: 'Contenido ofensivo o vulgar' },
  { value: 'harassment', label: 'Acoso o intimidación', description: 'Ataques personales o acoso' },
  { value: 'violence', label: 'Violencia o contenido peligroso', description: 'Promoción de violencia o actividades peligrosas' },
  { value: 'copyright', label: 'Violación de derechos de autor', description: 'Uso no autorizado de material protegido' },
  { value: 'misinformation', label: 'Información falsa', description: 'Noticias falsas o información engañosa' },
  { value: 'hate_speech', label: 'Discurso de odio', description: 'Contenido discriminatorio o de odio' },
  { value: 'other', label: 'Otro', description: 'Otra razón no especificada' }
];

function ReportDialog({ open, onClose, onSubmit, reportType, itemName = '' }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ reason, description });
      handleClose();
    } catch (error) {
      console.error('Error al enviar reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDescription('');
    setLoading(false);
    onClose();
  };

  const selectedReason = REPORT_REASONS.find(r => r.value === reason);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, color: COLORS.bodyText }}>
        <Flag size={24} color={COLORS.error} />
        Reportar {reportType === 'post' ? 'Publicación' : 'Comentario'}
      </DialogTitle>

      <DialogContent>
        {itemName && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Estás reportando: <strong>{itemName}</strong>
          </Alert>
        )}

        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: COLORS.bodyText }}>
          Motivo del reporte
        </Typography>

        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <RadioGroup
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REPORT_REASONS.map((r) => (
              <Box key={r.value} sx={{ mb: 1 }}>
                <FormControlLabel
                  value={r.value}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {r.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.mutedText }}>
                        {r.description}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            ))}
          </RadioGroup>
        </FormControl>

        <TextField
          fullWidth
          label="Descripción adicional (opcional)"
          placeholder="Proporciona más detalles sobre el reporte..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          variant="outlined"
          helperText="Si tienes más información que quieras compartir, añádela aquí"
        />

        {selectedReason && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Motivo seleccionado:</strong> {selectedReason.label}
              <br />
              {selectedReason.description}
            </Typography>
          </Alert>
        )}

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            Los reportes falsos o maliciosos pueden resultar en acciones contra tu cuenta.
            Por favor, usa esta función de manera responsable.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined" disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={!reason || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <Send size={16} />}
          sx={{
            bgcolor: COLORS.error,
            '&:hover': {
              bgcolor: '#d32f2f'
            }
          }}
        >
          {loading ? 'Enviando...' : 'Enviar Reporte'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReportDialog;