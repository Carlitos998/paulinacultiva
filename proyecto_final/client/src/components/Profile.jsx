// src/components/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  CircularProgress
} from '@mui/material';
import {
  ChevronLeft,
  Edit,
  Settings,
  Mail,
  Cake,
  MapPin,
  BookOpen,
  Heart,
  Star,
  TrendingUp,
  Calendar,
  ChefHat,
  Camera,
  Save,
  X,
  Trash2
} from 'lucide-react';
import { ToastContainer, useToast } from './Toast';
import { COLORS } from '../utils/colors';

function TabPanelComponent({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast, closeToast } = useToast();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [userStats, setUserStats] = useState({
    recipes: 0,
    likes: 0,
    followers: 0,
    following: 0,
    reviews: 0
  });

  const [userProfile, setUserProfile] = useState({
    username: 'Chef Paulina',
    email: 'paulina@paulinacultiva.com',
    bio: 'Amante de la cocina tradicional y experimental. Compartiendo recetas de abuela con un toque moderno.',
    location: 'Buenos Aires, Argentina',
    joinDate: 'Enero 2023',
    avatar: null
  });

  const [editForm, setEditForm] = useState({ ...userProfile });
  const [userRecipes, setUserRecipes] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  // Cargar recetas del usuario
  const loadUserRecipes = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/users/${userId}/recipes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Usar las recetas directamente (ya vienen en el formato correcto)
        const transformedRecipes = data.recipes || [];
        setUserRecipes(transformedRecipes);
        setUserStats(prev => ({
          ...prev,
          recipes: data.total || 0
        }));
      } else {
        console.error('Error al cargar recetas del usuario');
        showToast('Error al cargar tus recetas', 'error', 3000);
      }
    } catch (error) {
      console.error('Error al cargar recetas del usuario:', error);
      showToast('Error de conexión al cargar tus recetas', 'error', 3000);
    }
  };

  // Obtener info del usuario actual
  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.id);
        setUserProfile(prev => ({
          ...prev,
          username: data.username,
          email: data.email
        }));
        setEditForm(prev => ({
          ...prev,
          username: data.username,
          email: data.email
        }));
        return data.id;
      }
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
    }
    return null;
  };

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        setLoading(true);
        const userId = await getCurrentUser();
        if (userId) {
          await loadUserRecipes(userId);
        }
      } catch (error) {
        console.error('Error al inicializar perfil:', error);
        showToast('Error al cargar el perfil', 'error', 3000);
      } finally {
        setLoading(false);
      }
    };

    initializeProfile();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancelar edición
      setEditForm({ ...userProfile });
    } else {
      // Iniciar edición
      setEditForm({ ...userProfile });
    }
    setEditMode(!editMode);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserProfile({ ...editForm });
      setEditMode(false);
      showToast('¡Perfil actualizado exitosamente!', 'success', 2000);
    } catch (error) {
      showToast('Error al actualizar el perfil', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setEditForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showToast('Receta eliminada exitosamente', 'success', 2000);
        // Recargar las recetas del usuario
        if (currentUserId) {
          await loadUserRecipes(currentUserId);
        }
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Error al eliminar la receta', 'error', 3000);
      }
    } catch (error) {
      console.error('Error al eliminar receta:', error);
      showToast('Error de conexión al eliminar la receta', 'error', 3000);
    }
    setDeleteDialogOpen(false);
    setRecipeToDelete(null);
  };

  const handleDeleteClick = (recipe) => {
    setRecipeToDelete(recipe);
    setDeleteDialogOpen(true);
  };

  const recentActivity = [
    { type: 'recipe', title: 'Pasta Carbonara Clásica', date: 'Hace 2 días', action: 'Nueva receta' },
    { type: 'review', title: 'Empanadas Criollas', date: 'Hace 3 días', action: 'Dejó una reseña' },
    { type: 'like', title: 'Brownie de Chocolate', date: 'Hace 5 días', action: 'Le gustó' },
    { type: 'recipe', title: 'Tiramisú Italiano', date: 'Hace 1 semana', action: 'Nueva receta' }
  ];

  const badges = [
    { name: 'Chef Novato', icon: '👨‍🍳', earned: true },
    { name: 'Recetas Populares', icon: '⭐', earned: true },
    { name: 'Critico Experto', icon: '📝', earned: true },
    { name: 'Comunidad Activa', icon: '🤝', earned: false }
  ];

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} closeToast={closeToast} />

      <Box sx={{ minHeight: '100vh', bgcolor: COLORS.fondoClaro }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: COLORS.paperBg,
            color: COLORS.bodyText,
            boxShadow: `0 1px 3px 0 ${COLORS.subtleShadow}`,
            position: 'sticky',
            top: 0,
            zIndex: 1100
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
              <Button
                onClick={() => navigate('/inicio')}
                sx={{ mr: 2, color: COLORS.mutedText }}
                startIcon={<ChevronLeft className="w-5 h-5" />}
              >
                Volver
              </Button>

              <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.principal, flexGrow: 1 }}>
                Mi Perfil
              </Typography>

              <IconButton
                onClick={handleEditToggle}
                sx={{
                  color: editMode ? COLORS.principal : COLORS.mutedText,
                  '&:hover': { bgcolor: COLORS.fondoClaro }
                }}
              >
                {editMode ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
              </IconButton>
            </Box>
          </Container>
        </Paper>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: COLORS.principal }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Perfil Info */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
                  {/* Avatar */}
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: COLORS.principal,
                        fontSize: '3rem',
                        mb: 2,
                        border: `4px solid ${COLORS.paperBg}`,
                        boxShadow: `0 4px 12px ${COLORS.subtleShadow}`
                      }}
                    >
                      {userProfile.username[0].toUpperCase()}
                    </Avatar>
                    {editMode && (
                      <IconButton
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          bgcolor: COLORS.paperBg,
                          boxShadow: `0 2px 8px ${COLORS.subtleShadow}`,
                          '&:hover': { bgcolor: COLORS.fondoClaro }
                        }}
                        size="small"
                      >
                        <Camera className="w-4 h-4" />
                      </IconButton>
                    )}
                  </Box>

                  {/* Editable Fields */}
                  {editMode ? (
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Nombre de usuario"
                        value={editForm.username}
                        onChange={handleInputChange('username')}
                        sx={{ mb: 2 }}
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Biografía"
                        value={editForm.bio}
                        onChange={handleInputChange('bio')}
                        multiline
                        rows={3}
                        sx={{ mb: 2 }}
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Ubicación"
                        value={editForm.location}
                        onChange={handleInputChange('location')}
                        sx={{ mb: 2 }}
                        size="small"
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Save className="w-4 h-4" />}
                        onClick={handleSaveProfile}
                        sx={{
                          mb: 1,
                          bgcolor: COLORS.principal,
                          '&:hover': { bgcolor: COLORS.oscuro }
                        }}
                      >
                        Guardar Cambios
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.bodyText, mb: 1 }}>
                        {userProfile.username}
                      </Typography>
                      <Typography variant="body2" color={COLORS.mutedText} sx={{ mb: 2 }}>
                        {userProfile.bio}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                        <Chip
                          icon={<MapPin className="w-3 h-3" />}
                          label={userProfile.location}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={<Calendar className="w-3 h-3" />}
                          label={`Se unió en ${userProfile.joinDate}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Stats */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.principal }}>
                          {userStats.recipes}
                        </Typography>
                        <Typography variant="body2" color={COLORS.mutedText}>
                          Recetas
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.principal }}>
                          {userStats.likes}
                        </Typography>
                        <Typography variant="body2" color={COLORS.mutedText}>
                          Likes
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.principal }}>
                          {userStats.followers}
                        </Typography>
                        <Typography variant="body2" color={COLORS.mutedText}>
                          Seguidores
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.principal }}>
                          {userStats.reviews}
                        </Typography>
                        <Typography variant="body2" color={COLORS.mutedText}>
                          Reseñas
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Badges */}
                <Paper sx={{ p: 3, mt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.bodyText }}>
                    Logros
                  </Typography>
                  <Grid container spacing={2}>
                    {badges.map((badge, index) => (
                      <Grid item xs={6} key={index}>
                        <Chip
                          label={badge.name}
                          icon={<span>{badge.icon}</span>}
                          color={badge.earned ? "primary" : "default"}
                          variant={badge.earned ? "filled" : "outlined"}
                          disabled={!badge.earned}
                          sx={{
                            width: '100%',
                            justifyContent: 'center',
                            opacity: badge.earned ? 1 : 0.6
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>

              {/* Content Tabs */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ bgcolor: COLORS.paperBg }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      borderBottom: `1px solid ${COLORS.divider}`,
                      '& .MuiTab-root': {
                        color: COLORS.mutedText,
                        '&.Mui-selected': {
                          color: COLORS.principal
                        }
                      },
                      '& .MuiTabs-indicator': {
                        bgcolor: COLORS.principal
                      }
                    }}
                  >
                    <Tab icon={<BookOpen className="w-4 h-4" />} label="Mis Recetas" />
                    <Tab icon={<Heart className="w-4 h-4" />} label="Favoritos" />
                    <Tab icon={<TrendingUp className="w-4 h-4" />} label="Actividad" />
                  </Tabs>

                  <TabPanelComponent value={tabValue} index={0}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.bodyText }}>
                      Mis Recetas Publicadas
                    </Typography>
                    {userRecipes.length > 0 ? (
                      <Grid container spacing={2}>
                        {userRecipes.map((recipe) => (
                          <Grid item xs={12} sm={6} key={recipe.id}>
                            <Card variant="outlined" sx={{
                              borderColor: COLORS.divider,
                              '&:hover': {
                                borderColor: COLORS.principal,
                                boxShadow: `0 2px 8px ${COLORS.subtleShadow}`
                              }
                            }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ChefHat className="w-5 h-5" style={{ color: COLORS.principal }} />
                                    <Typography variant="h6" sx={{ ml: 1, fontSize: '1rem' }}>
                                      {recipe.titulo}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    onClick={() => handleDeleteClick(recipe)}
                                    size="small"
                                    sx={{
                                      color: COLORS.oscuro,
                                      '&:hover': {
                                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                        color: COLORS.oscuro
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </IconButton>
                                </Box>
                                <Typography variant="body2" color={COLORS.mutedText} sx={{ mb: 1 }}>
                                  {recipe.contenido.substring(0, 100)}{recipe.contenido.length > 100 ? '...' : ''}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                  <Typography variant="caption" color={COLORS.mutedText}>
                                    ⏱️ {recipe.duracion} | 👥 {recipe.porciones} | 📊 {recipe.dificultad}
                                  </Typography>
                                  {recipe.tags && recipe.tags.length > 0 && (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                      {recipe.tags.map((tag, index) => {
                                        const tagColors = {
                                          'fitness': '#10b981',
                                          'bajon': '#f59e0b',
                                          'veggie': '#22c55e',
                                          'salado': '#3b82f6',
                                          'dulce': '#ec4899',
                                          'chatarra': '#f97316'
                                        };
                                        return (
                                          <Chip
                                            key={index}
                                            label={tag}
                                            size="small"
                                            sx={{
                                              backgroundColor: tagColors[tag] || COLORS.principal,
                                              color: COLORS.white,
                                              fontSize: '0.7rem',
                                              height: '20px'
                                            }}
                                          />
                                        );
                                      })}
                                    </Box>
                                  )}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Chip label="★ 0.0" size="small" />
                                  <Chip label="❤️ 0" size="small" variant="outlined" />
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: COLORS.paperBg }}>
                        <ChefHat className="w-12 h-12 mx-auto mb-2" style={{ color: COLORS.mutedText }} />
                        <Typography variant="h6" sx={{ color: COLORS.bodyText, mb: 1 }}>
                          Aún no has publicado recetas
                        </Typography>
                        <Typography variant="body2" color={COLORS.mutedText} sx={{ mb: 2 }}>
                          ¡Comparte tu primera receta con la comunidad!
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => navigate('/nueva-receta-avanzada')}
                          sx={{
                            bgcolor: COLORS.principal,
                            '&:hover': { bgcolor: COLORS.oscuro }
                          }}
                        >
                          Crear Primera Receta
                        </Button>
                      </Paper>
                    )}
                  </TabPanelComponent>

                  <TabPanelComponent value={tabValue} index={1}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.bodyText }}>
                      Recetas Favoritas
                    </Typography>
                    <Typography variant="body2" color={COLORS.mutedText} sx={{ textAlign: 'center', py: 4 }}>
                      Aún no tienes recetas favoritas. ¡Explora y guarda las que te encanten!
                    </Typography>
                  </TabPanelComponent>

                  <TabPanelComponent value={tabValue} index={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.bodyText }}>
                      Actividad Reciente
                    </Typography>
                    <List>
                      {recentActivity.map((activity, index) => (
                        <ListItem key={index} divider>
                          <ListItemIcon>
                            {activity.type === 'recipe' && <BookOpen className="w-5 h-5" />}
                            {activity.type === 'review' && <Star className="w-5 h-5" />}
                            {activity.type === 'like' && <Heart className="w-5 h-5" />}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body1" color={COLORS.bodyText}>
                                {activity.action}: <strong>{activity.title}</strong>
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color={COLORS.mutedText}>
                                {activity.date}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </TabPanelComponent>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">
            <Typography variant="h6" sx={{ color: COLORS.oscuro, fontWeight: 600 }}>
              Confirmar Eliminación
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" color={COLORS.bodyText}>
              ¿Estás seguro de que deseas eliminar la receta "{recipeToDelete?.titulo}"?
            </Typography>
            <Typography variant="body2" color={COLORS.mutedText} sx={{ mt: 1 }}>
              Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ color: COLORS.mutedText }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleDeleteRecipe(recipeToDelete.id)}
              sx={{
                color: COLORS.oscuro,
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.1)'
                }
              }}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}