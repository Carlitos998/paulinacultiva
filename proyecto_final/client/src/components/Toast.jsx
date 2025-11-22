// src/components/Toast.jsx
import React from "react";
import { Snackbar, Alert, IconButton, Slide, Paper, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ChefHat, AlertCircle } from "lucide-react";

const SlideRight = (props) => <Slide {...props} direction="left" />;
const SlideLeft = (props) => <Slide {...props} direction="right" />; 
// Entra desde la derecha, sale hacia la derecha

export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const showToast = (messageOrOptions, type = "success", duration = 3000) => {
    let options;

    // Si el primer parámetro es un objeto, usarlo como opciones
    if (typeof messageOrOptions === 'object' && messageOrOptions !== null) {
      options = {
        id: messageOrOptions.id || Date.now() + Math.random(),
        message: messageOrOptions.message || messageOrOptions,
        type: messageOrOptions.type || type,
        duration: messageOrOptions.duration || duration,
        position: messageOrOptions.position || 'top-right',
        style: messageOrOptions.style || {}
      };
    } else {
      // Comportamiento original para compatibilidad
      options = {
        id: Date.now() + Math.random(),
        message: messageOrOptions,
        type: type,
        duration: duration,
        position: 'top-right',
        style: {}
      };
    }

    setToasts((prev) => [...prev, { ...options, open: true }]);
  };

  const closeToast = (id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, open: false } : t))
    );
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, closeToast, removeToast };
};

export const ToastContainer = ({ toasts, closeToast, removeToast }) => {
  const getPosition = (position) => {
    switch (position) {
      case 'top-left':
        return { vertical: "top", horizontal: "left" };
      case 'top-right':
        return { vertical: "top", horizontal: "right" };
      case 'bottom-left':
        return { vertical: "bottom", horizontal: "left" };
      case 'bottom-right':
        return { vertical: "bottom", horizontal: "right" };
      default:
        return { vertical: "top", horizontal: "right" };
    }
  };

  const getTransition = (position) => {
    return position === 'top-left' ? SlideLeft : SlideRight;
  };

  return (
    <>
      {toasts.map((t) => {
        // Notificación especial de bienvenida
        if (t.type === 'welcome') {
          return (
            <Snackbar
              key={t.id}
              open={t.open}
              autoHideDuration={t.duration ?? 3000}
              anchorOrigin={getPosition(t.position)}
              TransitionComponent={getTransition(t.position)}
              TransitionProps={{
                appear: true,
                onExited: () => removeToast(t.id)
              }}
              onClose={(_e, reason) => {
                if (reason === "clickaway") return;
                closeToast(t.id);
              }}
              sx={{ zIndex: 9999 }}
            >
              <Paper
                elevation={6}
                sx={{
                  background: t.style?.background || 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                  color: t.style?.color || 'white',
                  borderRadius: t.style?.borderRadius || '20px',
                  padding: t.style?.padding || '12px 20px',
                  boxShadow: t.style?.boxShadow || '0 4px 16px rgba(255, 107, 53, 0.25)',
                  border: t.style?.border || '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: t.style?.fontSize || '14px',
                  fontWeight: t.style?.fontWeight || '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  minWidth: t.style?.minWidth || '280px',
                  transform: t.style?.transform || 'none',
                  animation: t.style?.animation || 'slideInRight 0.5s ease-out',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:before': t.style?.['&:before'] || {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                    borderRadius: '20px'
                  },
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                    animation: 'shimmer 3s infinite'
                  }
                }}
              >
                {/* Ícono más pequeño y bonito */}
                <Box sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '16px' }}>👋</span>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    flexGrow: 1,
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  {t.message}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() => closeToast(t.id)}
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    p: 0.5,
                    minWidth: 'auto',
                    '&:hover': {
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.15)'
                    },
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <CloseIcon sx={{ fontSize: '18px' }} />
                </IconButton>
              </Paper>
            </Snackbar>
          );
        }

        // Notificaciones estándar
        return (
          <Snackbar
            key={t.id}
            open={t.open}
            autoHideDuration={t.duration ?? 3000}
            anchorOrigin={getPosition(t.position)}
            TransitionComponent={getTransition(t.position)}
            TransitionProps={{
              appear: true,
              onExited: () => removeToast(t.id)
            }}
            onClose={(_e, reason) => {
              if (reason === "clickaway") return;
              closeToast(t.id);
            }}
            sx={{ zIndex: 9999 }}
          >
            <Alert
              variant="filled"
              severity={t.type === "error" ? "error" : "success"}
              onClose={() => closeToast(t.id)}
              sx={{ width: "100%" }}
              action={
                <IconButton size="small" color="inherit" onClick={() => closeToast(t.id)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              {t.message}
            </Alert>
          </Snackbar>
        );
      })}
    </>
  );
};
