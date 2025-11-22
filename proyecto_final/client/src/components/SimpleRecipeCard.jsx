// src/components/SimpleRecipeCard.jsx
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar
} from '@mui/material';
import { ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../utils/colors';

export default function SimpleRecipeCard({ recipe, loading = false }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ height: 200, bgcolor: COLORS.fondoClaro, mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>Cargando...</Typography>
          <Typography variant="body2">Cargando descripción...</Typography>
        </CardContent>
      </Card>
    );
  }

  const handleCardClick = () => {
    navigate(`/recipes/${recipe.id}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Icono de receta */}
        <Box sx={{
          height: 200,
          bgcolor: COLORS.fondoClaro,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          borderRadius: 1
        }}>
          <ChefHat className="w-16 h-16" style={{ color: COLORS.mutedText }} />
        </Box>

        {/* Título */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1,
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {recipe.titulo}
        </Typography>

        {/* Autor con username */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar
            sx={{ width: 24, height: 24, bgcolor: COLORS.principal }}
          >
            {recipe.autor?.username?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          <Typography variant="body2" color={COLORS.mutedText}>
            {recipe.autor?.username || `Autor #${recipe.autorId}`}
          </Typography>
        </Box>

        {/* Descripción corta */}
        <Typography
          variant="body2"
          color={COLORS.mutedText}
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4
          }}
        >
          {recipe.contenido}
        </Typography>

        {/* Fecha de publicación */}
        <Typography variant="caption" color={COLORS.mutedText} sx={{ mt: 2, display: 'block' }}>
          {recipe.fechaPublicacion ?
            new Date(recipe.fechaPublicacion).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }) : 'Fecha desconocida'
          }
        </Typography>
      </CardContent>
    </Card>
  );
}