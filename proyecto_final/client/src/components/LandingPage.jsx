import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid
} from '@mui/material';
import {
  ChefHat
} from 'lucide-react';
import { COLORS } from '../utils/colors';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section Mejorada */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(135deg, #fef7f0 0%, #fff8f5 50%, #fef5f0 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '600px',
            height: '600px',
            background: `radial-gradient(circle, ${COLORS.principal}15 0%, transparent 70%)`,
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '400px',
            height: '400px',
            background: `radial-gradient(circle, ${COLORS.claro}20 0%, transparent 70%)`,
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite reverse'
          },
          '@keyframes float': {
            '0%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
            '100%': { transform: 'translateY(0px)' }
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, py: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            {/* Logo mejorado */}
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 5,
              p: 2,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(209, 55, 39, 0.1)'
            }}>
              <ChefHat className="w-14 h-14 mr-3" style={{ color: COLORS.principal }} />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${COLORS.principal}, ${COLORS.oscuro})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: "'Lora', serif",
                  letterSpacing: -0.5
                }}
              >
                Paulina Cultiva
              </Typography>
            </Box>

            {/* Título principal con efectos */}
            <Typography
              variant="h1"
              sx={{
                mb: 4,
                fontWeight: 800,
                color: COLORS.bodyText,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.1,
                fontFamily: "'Lora', serif",
                position: 'relative',
                '& span': {
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '2px',
                    left: 0,
                    right: 0,
                    height: '8px',
                    backgroundColor: `${COLORS.principal}30`,
                    borderRadius: '4px',
                    zIndex: -1
                  }
                }
              }}
            >
              Comparte tus <Box component="span" sx={{ color: COLORS.principal }}>recetas</Box>,<br />
              cultiva <Box component="span" sx={{ color: COLORS.principal }}>sabores</Box>
            </Typography>

            {/* Subtítulo elegante */}
            <Typography
              variant="h6"
              sx={{
                mb: 8,
                color: COLORS.mutedText,
                fontWeight: 400,
                lineHeight: 1.7,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                maxWidth: '600px',
                mx: 'auto',
                px: 2
              }}
            >
              Únete a una comunidad apasionada por la cocina, donde cada receta cuenta una historia y cada plato une personas.
            </Typography>

            {/* Botones mejorados */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              sx={{ justifyContent: 'center', alignItems: 'center' }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  py: 3,
                  px: 6,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: '50px',
                  background: `linear-gradient(135deg, ${COLORS.principal}, ${COLORS.oscuro})`,
                  boxShadow: '0 8px 24px rgba(209, 55, 39, 0.25)',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${COLORS.oscuro}, ${COLORS.principal})`,
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: '0 12px 32px rgba(209, 55, 39, 0.35)',
                  },
                  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transition: 'left 0.6s',
                  },
                  '&:hover::before': {
                    left: '100%',
                  }
                }}
              >
                Unite a nosotros
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  py: 3,
                  px: 6,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: '50px',
                  borderWidth: '2px',
                  borderColor: COLORS.principal,
                  color: COLORS.principal,
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderWidth: '2px',
                    borderColor: COLORS.oscuro,
                    color: COLORS.oscuro,
                    background: `${COLORS.principal}10`,
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: '0 12px 24px rgba(209, 55, 39, 0.15)',
                  },
                  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                }}
              >
                Iniciar sesión
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer Mejorado */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${COLORS.bodyText} 0%, #1a1a1a 100%)`,
          color: 'white',
          py: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${COLORS.principal}40, transparent)`
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Soporte mejorado */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button
              href="mailto:paulina.cultiva.rrhh@gmail.com"
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                color: 'white',
                opacity: 0.9,
                px: 3,
                py: 1,
                borderRadius: '25px',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  opacity: 1,
                  background: `${COLORS.principal}20`,
                  border: `1px solid ${COLORS.principal}40`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px rgba(209, 55, 39, 0.2)`
                }
              }}
            >
              ✉️ Soporte
            </Button>
          </Box>

          {/* Copyright mejorado */}
          <Box sx={{ textAlign: 'center', pt: 3, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.7,
                fontSize: '0.85rem',
                fontWeight: 400,
                letterSpacing: 0.5
              }}
            >
              © 2024 Paulina Cultiva • Hecho con ❤️ para la comunidad
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}