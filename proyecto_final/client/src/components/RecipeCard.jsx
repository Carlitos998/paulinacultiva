// src/components/RecipeCard.jsx
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  IconButton,
  Avatar,
  Rating,
  Skeleton
} from '@mui/material';
import {
  Heart,
  Bookmark,
  Clock,
  Users,
  Flame,
  DollarSign,
  MessageCircle,
  Star,
  ChefHat,
  MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../utils/colors';
import ReportButton from './ReportButton';

export default function RecipeCard({ recipe, loading = false }) {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Debug: mostrar los datos de la receta
  console.log('RecipeCard - recipe:', recipe);

  if (loading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Skeleton variant="rectangular" height={200} />
        <CardContent sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" height={32} width="80%" />
          <Skeleton variant="text" height={20} width="40%" />
          <Skeleton variant="text" height={60} />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Skeleton variant="rectangular" width={60} height={24} />
            <Skeleton variant="rectangular" width={80} height={24} />
            <Skeleton variant="rectangular" width={70} height={24} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const handleCardClick = () => {
    navigate(`/recipes/${recipe.id}`);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    // TODO: Implementar guardar en favoritos
  };

  const handleLike = (e) => {
    e.stopPropagation();
    // TODO: Implementar like
  };

  // Obtener información de dificultad
  const getDifficultyInfo = (dificultad) => {
    const difficulties = {
      facil: { label: 'Fácil', color: COLORS.success },
      medio: { label: 'Medio', color: COLORS.successStar },
      dificil: { label: 'Difícil', color: COLORS.error }
    };
    return difficulties[dificultad] || difficulties.medio;
  };

  // Calcular tiempo total
  const totalTime = (recipe.tiempoPreparacion || 0) + (recipe.tiempoCoccion || 0);

  const difficultyInfo = getDifficultyInfo(recipe.dificultad);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
      onClick={handleCardClick}
    >
      {/* Imagen principal */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="div"
          sx={{
            height: 200,
            bgcolor: COLORS.fondoClaro,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {recipe.fotos && recipe.fotos.length > 0 ? (
            <img
              src={recipe.fotos[0]}
              alt={recipe.titulo}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <Box
            sx={{
              display: recipe.fotos && recipe.fotos.length > 0 ? 'none' : 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: COLORS.mutedText
            }}
          >
            <ChefHat className="w-12 h-12 mb-1" />
            <Typography variant="body2" color={COLORS.mutedText}>
              Sin imagen
            </Typography>
          </Box>
        </CardMedia>

        {/* Badge de dificultad */}
        <Chip
          label={difficultyInfo.label}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            bgcolor: difficultyInfo.color,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        />

        {/* Botones de acción */}
        <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={handleLike}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
            }}
          >
            <Heart className="w-4 h-4" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleSave}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
            }}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </IconButton>
          <ReportButton
            reportType="post"
            reportedItemId={recipe.id}
            itemName={recipe.titulo}
            size="small"
          />
        </Box>

        {/* Badge de video si tiene */}
        {recipe.videoUrl && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            ▶ Video
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
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

        {/* Autor y calificación */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar
            src={recipe.autor?.avatar}
            sx={{ width: 24, height: 24 }}
          >
            {recipe.autor?.username?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          <Typography variant="body2" color={COLORS.mutedText} sx={{ flexGrow: 1 }}>
            {recipe.autor?.username || 'Anónimo'}
          </Typography>
          {recipe.averageRating && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Star className="w-4 h-4" style={{ color: COLORS.successStar, fill: COLORS.successStar }} />
              <Typography variant="body2" fontWeight={600}>
                {parseFloat(recipe.averageRating).toFixed(1)}
              </Typography>
              {recipe.totalReviews && (
                <Typography variant="caption" color={COLORS.mutedText}>
                  ({recipe.totalReviews})
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Descripción corta */}
        <Typography
          variant="body2"
          color={COLORS.mutedText}
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4
          }}
        >
          {recipe.contenido}
        </Typography>

        {/* Información adicional */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {totalTime > 0 && (
            <Chip
              icon={<Clock className="w-3 h-3" />}
              label={`${totalTime} min`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
          {recipe.porciones && (
            <Chip
              icon={<Users className="w-3 h-3" />}
              label={`${recipe.porciones} porc.`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
          {recipe.calorias && (
            <Chip
              icon={<Flame className="w-3 h-3" />}
              label={`${recipe.calorias} cal`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
          {recipe.costo && (
            <Chip
              icon={<DollarSign className="w-3 h-3" />}
              label={`$${recipe.costo}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>

        {/* Categoría y cocina */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {recipe.category && (
            <Chip
              label={recipe.category.name}
              size="small"
              sx={{
                bgcolor: `${recipe.category.color}15`,
                color: recipe.category.color,
                fontSize: '0.75rem'
              }}
            />
          )}
          {recipe.cuisine && (
            <Chip
              label={`${recipe.cuisine.flag || ''} ${recipe.cuisine.name}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>

        {/* Tags */}
        {recipe.etiquetas && Array.isArray(recipe.etiquetas) && recipe.etiquetas.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {recipe.etiquetas.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={`#${tag}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 24 }}
              />
            ))}
            {recipe.etiquetas.length > 3 && (
              <Chip
                label={`+${recipe.etiquetas.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 24 }}
              />
            )}
          </Box>
        )}

        {/* Estadísticas de interacción */}
        {recipe.totalReviews > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, pt: 2, borderTop: `1px solid ${COLORS.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MessageCircle className="w-4 h-4" />
              <Typography variant="body2" color={COLORS.mutedText}>
                {recipe.totalReviews} reseñas
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}