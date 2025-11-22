// src/components/RecipeView.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  TextField
} from '@mui/material';
import {
  ArrowLeft,
  ChefHat,
  Calendar,
  User,
  Edit,
  Trash2,
  Flag
} from 'lucide-react';
import { useToast, ToastContainer } from './Toast';
import { COLORS } from '../utils/colors';
import ReportButton from './ReportButton';
import axios from 'axios';

export default function RecipeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  // Estados principales
  const [recipe, setRecipe] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Estados para comentarios
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadRecipe();
    loadUser();
    loadComments();
  }, [id]);

  // === Cargar datos principales ===
  const loadRecipe = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/recipes/${id}`);
      setRecipe(response.data);
    } catch (error) {
      console.error('Error al cargar receta:', error);
      showToast('Error al cargar la receta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('http://localhost:3000/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/recipes/${id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    }
  };

  // === Enviar un nuevo comentario ===
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:3000/recipes/${id}/comments`,
        { contenido: newComment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Actualizar comentarios con el nuevo
      setComments((prev) => [...prev, response.data.comment]);
      setNewComment('');
      showToast('Comentario publicado', 'success');
    } catch (error) {
      console.error('Error al publicar comentario:', error);
      showToast('No se pudo publicar el comentario', 'error');
    } finally {
      setSending(false);
    }
  };

  // === Funciones de edición/eliminación ===
  const handleEdit = () => navigate(`/recipes/${id}/edit`);
  const handleDelete = () => setDeleteDialogOpen(true);

  const confirmDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Receta eliminada exitosamente', 'success');
      setTimeout(() => navigate('/explorar'), 1500);
    } catch (error) {
      console.error('Error al eliminar receta:', error);
      const errorMsg = error.response?.data?.message || 'Error al eliminar la receta';
      showToast(errorMsg, 'error');
    }
  };
  const cancelDelete = () => setDeleteDialogOpen(false);

  // === Control de permisos ===
  const canEdit = user && recipe && (user.id === recipe.autorId || user.isAdmin);

  // === Renderizado ===
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: COLORS.fondoClaro, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!recipe) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: COLORS.fondoClaro, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="md">
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Receta no encontrada</Typography>
            <Button variant="contained" onClick={() => navigate('/explorar')}>
              Volver a explorar
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <Box sx={{ minHeight: '100vh', bgcolor: COLORS.fondoClaro }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: COLORS.paperBg,
            color: COLORS.bodyText,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1100
          }}
        >
          <Container maxWidth="md">
            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
              <IconButton onClick={() => navigate('/explorar')} sx={{ mr: 2, color: COLORS.mutedText }}>
                <ArrowLeft className="w-6 h-6" />
              </IconButton>
              <ChefHat className="w-8 h-8 mr-2" style={{ color: COLORS.principal }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.principal, flexGrow: 1 }}>
                {recipe.titulo}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {canEdit && (
                  <>
                    <Button variant="outlined" onClick={handleEdit} startIcon={<Edit className="w-4 h-4" />}>Editar</Button>
                    <Button variant="outlined" onClick={handleDelete} startIcon={<Trash2 className="w-4 h-4" />} color="error">Eliminar</Button>
                  </>
                )}
                <ReportButton
                  reportType="post"
                  reportedItemId={recipe.id}
                  itemName={recipe.titulo}
                  variant="button"
                />
              </Box>
            </Box>
          </Container>
        </Paper>

        <Container maxWidth="md" sx={{ mt: 3, pb: 4 }}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
            {/* Información de la receta */}
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>{recipe.titulo}</Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>{recipe.contenido}</Typography>

            {/* Comentarios */}
            <Box sx={{ mt: 5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>🔥 COMENTARIOS</Typography>

              {/* Lista de comentarios */}
              {comments.length === 0 ? (
                <Typography color={COLORS.mutedText}>No hay comentarios aún. ¡Sé el primero!</Typography>
              ) : (
                comments.map((c) => {
                  const isPostOwner = c.autor?.id === recipe.autorId;
                  console.log('🔍 Comentario:', c.autor?.username, 'ID:', c.autor?.id, 'Owner ID:', recipe.autorId, 'Is Owner:', isPostOwner);
                  return (
                  <Paper
                    key={c.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: '#fafafa',
                      border: '2px solid #f44336',
                      position: 'relative'
                    }}
                  >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar
                        sx={{
                          width: 30,
                          height: 30,
                          bgcolor: '#f44336',
                          border: '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                        {c.autor?.username?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                      </Avatar>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: '#d32f2f'
                        }}
                      >
                        {c.autor?.username || 'Usuario'}
                        {isPostOwner && ' 👑'}
                      </Typography>
                      <Typography variant="caption" color={COLORS.mutedText} sx={{ flexGrow: 1 }}>
                        {c.fecha ? new Date(c.fecha).toLocaleString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Fecha no disponible'}
                      </Typography>
                      <ReportButton
                        reportType="comment"
                        reportedItemId={c.id}
                        itemName={`Comentario de ${c.autor?.username || 'usuario'}`}
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontWeight: 500,
                        color: '#c62828'
                      }}
                    >
                      {c.contenido}
                    </Typography>
                  </Paper>
                  );
                })
              )}

              {/* Agregar comentario */}
              {user ? (
                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Escribe un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    multiline
                    rows={3}
                  />
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={handleAddComment}
                    disabled={sending}
                  >
                    {sending ? 'Enviando...' : 'Publicar'}
                  </Button>
                </Box>
              ) : (
                <Typography sx={{ mt: 3 }} color={COLORS.mutedText}>
                  Inicia sesión para dejar un comentario.
                </Typography>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>¿Eliminar receta?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que deseas eliminar la receta <strong>{recipe.titulo}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
