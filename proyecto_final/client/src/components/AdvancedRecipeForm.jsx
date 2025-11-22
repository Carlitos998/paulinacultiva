import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  Chip,
  InputAdornment,
  Rating,
  Card,
  CardContent,
  CardActions,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { ChevronLeft, Camera, Upload, Clock, Users, ChefHat, X } from 'lucide-react';
import axios from 'axios';
import { useToast, ToastContainer } from './Toast';
import { COLORS } from '../utils/colors';
import { TAGS } from '../utils/constants';

export default function AdvancedRecipeForm() {
  const navigate = useNavigate();
  const { toasts, showToast, closeToast, removeToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    titulo: '',
    ingredientes: '',
    pasos: '',
    duracionValor: '',
    duracionUnidad: 'min',
    dificultad: '',
    porcionesValor: '',
    selectedTags: [],
    foto: null,
    fotoPreview: null
  });

  const [errors, setErrors] = useState({});

  const handleTagToggle = (tagId) => {
    setForm(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('La foto no puede superar los 5MB', 'error', 3000);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          foto: file,
          fotoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    }

    if (!form.ingredientes.trim()) {
      newErrors.ingredientes = 'Los ingredientes son obligatorios';
    }

    if (!form.pasos.trim()) {
      newErrors.pasos = 'Los pasos a seguir son obligatorios';
    }

    if (!form.duracionValor || form.duracionValor <= 0) {
      newErrors.duracionValor = 'La duración es obligatoria';
    }

    if (!form.dificultad) {
      newErrors.dificultad = 'La dificultad es obligatoria';
    }

    if (!form.porcionesValor || form.porcionesValor <= 0) {
      newErrors.porcionesValor = 'El número de porciones es obligatorio';
    }

    if (form.selectedTags.length === 0) {
      newErrors.selectedTags = 'Debes seleccionar al menos una etiqueta';
    }

    if (!form.foto) {
      newErrors.foto = 'Debes subir una foto obligatoriamente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !loading && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Por favor completá todos los campos obligatorios', 'error', 3000);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Crear contenido formateado como en PostCard_old
      const contenidoFormateado = `🥘\n**Ingredientes:**\n${form.ingredientes}\n\n👩‍🍳\n**Pasos a seguir:**\n${form.pasos}`;

      // Crear FormData para subir la foto
      const formData = new FormData();
      formData.append('titulo', form.titulo);
      formData.append('contenido', contenidoFormateado);
      formData.append('tiempoPreparacion', form.duracionValor);
      formData.append('tiempoUnidad', form.duracionUnidad); // Enviar la unidad
      formData.append('dificultad', form.dificultad);
      formData.append('porciones', form.porcionesValor);
      formData.append('etiquetas', JSON.stringify(form.selectedTags));
      if (form.foto) {
        formData.append('foto', form.foto);
      }

      const { data } = await axios.post(
        'http://localhost:3000/recipes',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      showToast('¡Receta publicada exitosamente! 🎉', 'success', 2500);

      setTimeout(() => {
        navigate('/inicio'); // Redirigir al inicio en lugar de la vista individual
        // Recargar la página para mostrar la nueva receta
        window.location.reload();
      }, 2000);

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error al publicar la receta';
      showToast(errorMsg, 'error', 4000);
      console.error('Error:', error);
      setLoading(false); // Solo en caso de error
    }
    // NOTA: No setLoading(false) aquí - la animación continua hasta la redirección
  };

  return (
    <>
      <ToastContainer toasts={toasts} closeToast={closeToast} removeToast={removeToast} />

      <Box sx={{ minHeight: '100vh', bgcolor: COLORS.fondoClaro }}>
        {/* Header */}
        <AppBar
          position="static"
          sx={{
            bgcolor: COLORS.paperBg,
            color: COLORS.bodyText,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
          }}
        >
          <Toolbar>
            <IconButton
              onClick={() => navigate('/inicio')}
              sx={{ mr: 2, color: COLORS.mutedText }}
            >
              <ChevronLeft className="w-6 h-6" />
            </IconButton>
            <Typography variant="h6">
              Nueva Receta
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Formulario */}
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 3, pb: 8 }}>
          <Paper elevation={2} onKeyDown={handleKeyPress} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
              Nueva Receta
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Foto obligatoria */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, color: COLORS.bodyText, fontWeight: 600 }}>
                  📷 Foto (Obligatoria)
                </Typography>
                <Box sx={{ border: errors.foto ? `2px solid ${COLORS.error}` : `2px dashed ${COLORS.divider}`, borderRadius: 2, p: 2, textAlign: 'center' }}>
                  {form.fotoPreview ? (
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={form.fotoPreview}
                        alt="Preview"
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 1 }}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: COLORS.paperBg,
                          '&:hover': { bgcolor: COLORS.fondoClaro }
                        }}
                        onClick={() => setForm(prev => ({ ...prev, foto: null, fotoPreview: null }))}
                      >
                        <X className="w-4 h-4" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ py: 4, cursor: 'pointer' }} onClick={() => document.getElementById('foto-input').click()}>
                      <Camera className="w-12 h-12 mx-auto mb-2" style={{ color: COLORS.mutedText }} />
                      <Typography variant="body2" color={COLORS.mutedText}>
                        Haz clic para subir una foto
                      </Typography>
                      <Typography variant="caption" color={COLORS.mutedText}>
                        Máximo 5MB
                      </Typography>
                    </Box>
                  )}
                  <input
                    id="foto-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoChange}
                  />
                </Box>
                {errors.foto && (
                  <Typography variant="caption" color={COLORS.error} sx={{ mt: 1 }}>
                    {errors.foto}
                  </Typography>
                )}
              </Box>

              {/* Título */}
              <TextField
                label="Título *"
                value={form.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                fullWidth
                required
                error={!!errors.titulo}
                helperText={errors.titulo}
                InputProps={{
                  sx: { '& label.Mui-focused': { color: COLORS.principal } }
                }}
              />

              {/* Campos adicionales */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Duración *"
                      type="number"
                      placeholder="Ej: 30"
                      value={form.duracionValor}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (Number(value) > 0 && Number(value) <= 999)) {
                          handleChange('duracionValor', value);
                        }
                      }}
                      fullWidth
                      required
                      error={!!errors.duracionValor}
                      helperText={errors.duracionValor}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Clock className="w-4 h-4" style={{ color: COLORS.mutedText }} />
                          </InputAdornment>
                        ),
                        inputProps: { min: 1, max: 999 }
                      }}
                    />
                    <TextField
                      select
                      value={form.duracionUnidad}
                      onChange={(e) => handleChange('duracionUnidad', e.target.value)}
                      sx={{ minWidth: 100 }}
                    >
                      <MenuItem value="min">Min</MenuItem>
                      <MenuItem value="horas">Horas</MenuItem>
                    </TextField>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Porciones *"
                    type="number"
                    placeholder="Ej: 4"
                    value={form.porcionesValor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (Number(value) > 0 && Number(value) <= 50)) {
                        handleChange('porcionesValor', value);
                      }
                    }}
                    fullWidth
                    required
                    error={!!errors.porcionesValor}
                    helperText={errors.porcionesValor}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Users className="w-4 h-4" style={{ color: COLORS.mutedText }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          personas
                        </InputAdornment>
                      ),
                      inputProps: { min: 1, max: 50 }
                    }}
                  />
                </Grid>
              </Grid>

              {/* Dificultad */}
              <TextField
                label="Dificultad *"
                select
                value={form.dificultad}
                onChange={(e) => handleChange('dificultad', e.target.value)}
                fullWidth
                required
                error={!!errors.dificultad}
                helperText={errors.dificultad}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        bgcolor: COLORS.paperBg,
                        '& .MuiMenuItem-root': {
                          color: COLORS.bodyText,
                          '&:hover': {
                            bgcolor: COLORS.fondoClaro,
                          },
                          '&.Mui-selected': {
                            bgcolor: `${COLORS.principal}20`,
                            color: COLORS.principal,
                          },
                        }
                      }
                    }
                  }
                }}
              >
                <MenuItem value="">Selecciona la dificultad</MenuItem>
                <MenuItem value="facil">Fácil</MenuItem>
                <MenuItem value="medio">Medio</MenuItem>
                <MenuItem value="dificil">Difícil</MenuItem>
              </TextField>

              {/* Etiquetas obligatorias */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, color: COLORS.bodyText, fontWeight: 600 }}>
                  🏷️ Etiquetas (Obligatorio: al menos una)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {TAGS.map((tag) => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      clickable
                      onClick={() => handleTagToggle(tag.id)}
                      color={form.selectedTags.includes(tag.id) ? 'primary' : 'default'}
                      variant={form.selectedTags.includes(tag.id) ? 'filled' : 'outlined'}
                      sx={{
                        backgroundColor: form.selectedTags.includes(tag.id) ? tag.color : COLORS.paperBg,
                        color: form.selectedTags.includes(tag.id) ? COLORS.white : COLORS.bodyText,
                        borderColor: tag.color,
                        '&:hover': {
                          backgroundColor: form.selectedTags.includes(tag.id) ? tag.color : `${tag.color}20`,
                        }
                      }}
                    />
                  ))}
                </Box>
                {errors.selectedTags && (
                  <Typography variant="caption" color={COLORS.error} sx={{ mt: 1 }}>
                    {errors.selectedTags}
                  </Typography>
                )}
                {form.selectedTags.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color={COLORS.mutedText} sx={{ mb: 1 }}>
                      Etiquetas seleccionadas:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {form.selectedTags.map(tagId => {
                        const tag = TAGS.find(t => t.id === tagId);
                        return (
                          <Chip
                            key={tagId}
                            label={tag.name}
                            onDelete={() => handleTagToggle(tagId)}
                            size="small"
                            sx={{
                              backgroundColor: tag.color,
                              color: COLORS.white,
                              '& .MuiChip-deleteIcon': { color: COLORS.white }
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Ingredientes */}
              <TextField
                label="🥘 Ingredientes *"
                value={form.ingredientes}
                onChange={(e) => handleChange('ingredientes', e.target.value)}
                multiline
                rows={4}
                fullWidth
                required
                error={!!errors.ingredientes}
                helperText={errors.ingredientes || "Ej: 2 tazas de harina, 3 huevos, 1 taza de azúcar..."}
                placeholder="Lista los ingredientes necesarios para tu receta..."
                InputProps={{
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: COLORS.divider,
                        borderLeft: `4px solid #ff6b35`
                      },
                      '&:hover fieldset': {
                        borderColor: COLORS.principal,
                        borderLeft: `4px solid #ff6b35`
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: COLORS.principal,
                        borderLeft: `4px solid #ff6b35`
                      }
                    }
                  }
                }}
              />

              {/* Pasos a seguir */}
              <TextField
                label="👩‍🍳 Pasos a seguir *"
                value={form.pasos}
                onChange={(e) => handleChange('pasos', e.target.value)}
                multiline
                rows={6}
                fullWidth
                required
                error={!!errors.pasos}
                helperText={errors.pasos || "Describe los pasos para preparar tu receta..."}
                placeholder="1. Precalentar el horno a 180°C\n2. Mezclar los ingredientes secos\n3. Añadir los ingredientes húmedos..."
                InputProps={{
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: COLORS.divider,
                        borderLeft: `4px solid #4285f4`
                      },
                      '&:hover fieldset': {
                        borderColor: COLORS.principal,
                        borderLeft: `4px solid #4285f4`
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: COLORS.principal,
                        borderLeft: `4px solid #4285f4`
                      }
                    }
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                onClick={() => navigate('/inicio')}
                variant="outlined"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: COLORS.principal,
                  '&:hover': { bgcolor: COLORS.oscuro },
                  '&.Mui-disabled': {
                    bgcolor: COLORS.principal,
                    color: '#fff',
                    opacity: 0.7
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Publicando...</span>
                  </Box>
                ) : (
                  'Publicar'
                )}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
}