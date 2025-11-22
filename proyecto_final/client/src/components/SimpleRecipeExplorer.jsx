// src/components/SimpleRecipeExplorer.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Pagination,
  IconButton
} from '@mui/material';
import {
  ArrowLeft,
  Plus,
  ChefHat
} from 'lucide-react';
import SimpleRecipeSearch from './SimpleRecipeSearch';
import SimpleRecipeCard from './SimpleRecipeCard';
import { useToast, ToastContainer } from './Toast';
import axios from 'axios';
import { COLORS } from '../utils/colors';

export default function SimpleRecipeExplorer() {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page: filters.page || pagination.page,
        limit: filters.limit || pagination.limit,
        search: filters.search || '',
        ...filters
      };

      // Remover campos vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      console.log('Cargando recetas con params:', params);
      const response = await axios.get('http://localhost:3000/recipes', { params });
      console.log('Respuesta del servidor:', response.data);

      setRecipes(response.data.recipes || []);
      setPagination({
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 12,
        totalPages: response.data.totalPages || 0
      });
    } catch (error) {
      console.error('Error al cargar recetas:', error);
      console.error('Error completo:', error.response?.data || error.message);

      // Manejo específico de errores comunes
      if (error.code === 'ERR_NETWORK') {
        showToast('Error de conexión. Verifica que el servidor esté corriendo.', 'error');
      } else if (error.response?.status === 401) {
        showToast('No autorizado. Por favor inicia sesión nuevamente.', 'error');
      } else {
        showToast('Error al cargar las recetas', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters) => {
    loadRecipes({ ...filters, page: 1 });
  };

  const handlePageChange = (event, value) => {
    loadRecipes({ page: value });
  };

  const handleCreateRecipe = () => {
    navigate('/nueva-receta');
  };

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
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
              <IconButton
                onClick={() => navigate('/inicio')}
                sx={{ mr: 2, color: COLORS.mutedText }}
              >
                <ArrowLeft className="w-6 h-6" />
              </IconButton>

              <ChefHat className="w-8 h-8 mr-2" style={{ color: COLORS.principal }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.principal, flexGrow: 1 }}>
                Explorar Recetas
              </Typography>

              <Button
                variant="contained"
                onClick={handleCreateRecipe}
                startIcon={<Plus className="w-4 h-4" />}
                sx={{
                  bgcolor: COLORS.principal,
                  '&:hover': { bgcolor: COLORS.oscuro },
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Nueva Receta
              </Button>
            </Box>
          </Container>
        </Paper>

        <Container maxWidth="lg" sx={{ mt: 3, pb: 4 }}>
          {/* Búsqueda */}
          <SimpleRecipeSearch onSearch={handleSearch} loading={loading} />

          {/* Resultados */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {pagination.total > 0 ? (
                <>
                  {pagination.total} receta{pagination.total !== 1 ? 's' : ''} encontrada{pagination.total !== 1 ? 's' : ''}
                </>
              ) : (
                'No se encontraron recetas'
              )}
            </Typography>

            {pagination.total > 0 && (
              <Typography variant="body2" color={COLORS.mutedText}>
                Página {pagination.page} de {pagination.totalPages}
              </Typography>
            )}
          </Box>

          {/* Grid de recetas */}
          {loading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <SimpleRecipeCard loading />
                </Grid>
              ))}
            </Grid>
          ) : recipes.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {recipes.map((recipe) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
                    <SimpleRecipeCard recipe={recipe} />
                  </Grid>
                ))}
              </Grid>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        '&.Mui-selected': {
                          bgcolor: COLORS.principal,
                          color: 'white',
                          '&:hover': { bgcolor: COLORS.oscuro }
                        }
                      }
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            // Estado vacío
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                bgcolor: COLORS.fondoClaro,
                borderRadius: 2
              }}
            >
              <ChefHat className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.mutedText }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.bodyText }}>
                ¿No encuentras lo que buscas?
              </Typography>
              <Typography variant="body2" color={COLORS.mutedText} sx={{ mb: 4 }}>
                Intenta con otros términos de búsqueda o crea una nueva receta.
              </Typography>
              <Button
                variant="contained"
                onClick={handleCreateRecipe}
                startIcon={<Plus className="w-4 h-4" />}
                sx={{
                  bgcolor: COLORS.principal,
                  '&:hover': { bgcolor: COLORS.oscuro },
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Crear nueva receta
              </Button>
            </Paper>
          )}
        </Container>
      </Box>
    </>
  );
}