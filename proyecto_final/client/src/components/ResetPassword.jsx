import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Box, Paper, TextField, Button, Typography, Stack, Alert } from "@mui/material";
import { ToastContainer, useToast } from "../components/Toast";
import { COLORS } from "../utils/colors";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toasts, showToast, removeToast, closeToast } = useToast();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      showToast("Token de recuperación no proporcionado", "error", 5000);
      navigate("/forgot-password");
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/password-reset/${token}`);

      if (response.data.success) {
        setIsTokenValid(true);
        showToast("Token válido. Por favor, crea tu nueva contraseña.", "success", 3000);
      }
    } catch (error) {
      setIsTokenValid(false);
      const errorMessage = error.response?.data?.message || "Token inválido o expirado";
      showToast(errorMessage, "error", 5000);

      setTimeout(() => {
        navigate("/forgot-password");
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.newPassword || !formData.confirmPassword) {
      showToast("Por favor, completa todos los campos", "error", 3000);
      return;
    }

    if (formData.newPassword.length < 6) {
      showToast("La contraseña debe tener al menos 6 caracteres", "error", 3000);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast("Las contraseñas no coinciden", "error", 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post("http://localhost:3000/password-reset", {
        token,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        setIsResetComplete(true);
        showToast("¡Contraseña restablecida exitosamente!", "success", 3000);

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al restablecer la contraseña";
      showToast(errorMessage, "error", 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} closeToast={closeToast} />

        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: COLORS.fondoClaro,
            p: 2,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 4,
              width: "100%",
              maxWidth: 450,
              textAlign: "center",
              bgcolor: COLORS.cardBackground,
            }}
          >
            <Typography variant="h6" sx={{ color: COLORS.bodyText }}>
              Verificando token de recuperación...
            </Typography>
          </Paper>
        </Box>
      </>
    );
  }

  if (!isTokenValid) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} closeToast={closeToast} />

        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: COLORS.fondoClaro,
            p: 2,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 4,
              width: "100%",
              maxWidth: 450,
              textAlign: "center",
              bgcolor: COLORS.cardBackground,
            }}
          >
            <Alert severity="error" sx={{ mb: 3 }}>
              Token inválido o expirado
            </Alert>
            <Button
              variant="contained"
              onClick={() => navigate("/forgot-password")}
              sx={{
                bgcolor: COLORS.primary,
                "&:hover": {
                  bgcolor: COLORS.primaryHover || COLORS.primary,
                }
              }}
            >
              Solicitar nuevo token
            </Button>
          </Paper>
        </Box>
      </>
    );
  }

  if (isResetComplete) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} closeToast={closeToast} />

        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: COLORS.fondoClaro,
            p: 2,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 4,
              width: "100%",
              maxWidth: 450,
              textAlign: "center",
              bgcolor: COLORS.cardBackground,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: COLORS.primary,
                mb: 2,
                fontSize: "48px"
              }}
            >
              ✅
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: COLORS.primary,
                mb: 2,
                fontWeight: "600"
              }}
            >
              ¡Contraseña Restablecida!
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: COLORS.bodyText,
                mb: 3
              }}
            >
              Tu contraseña ha sido restablecida exitosamente.
              Serás redirigido al inicio de sesión...
            </Typography>
          </Paper>
        </Box>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} closeToast={closeToast} />

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: COLORS.fondoClaro,
          color: COLORS.bodyText,
          p: 2,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 450,
            bgcolor: COLORS.cardBackground,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                color: COLORS.primary,
                fontWeight: "bold",
                mb: 1
              }}
            >
              🌱 Paulina Cultiva
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: COLORS.bodyText,
                fontWeight: "600",
                mb: 2
              }}
            >
              Restablecer Contraseña
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: COLORS.bodyText,
              }}
            >
              Crea tu nueva contraseña
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nueva Contraseña"
                type="password"
                value={formData.newPassword}
                onChange={handleChange("newPassword")}
                variant="outlined"
                required
                disabled={isSubmitting}
                inputProps={{ minLength: 6 }}
                helperText="Mínimo 6 caracteres"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: COLORS.inputBorder,
                    },
                    "&:hover fieldset": {
                      borderColor: COLORS.primary,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: COLORS.primary,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: COLORS.bodyText,
                  },
                  "& .MuiInputBase-input": {
                    color: COLORS.bodyText,
                  },
                }}
              />

              <TextField
                fullWidth
                label="Confirmar Contraseña"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                variant="outlined"
                required
                disabled={isSubmitting}
                error={formData.confirmPassword && formData.newPassword !== formData.confirmPassword}
                helperText={
                  formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                    ? "Las contraseñas no coinciden"
                    : ""
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                        ? "error"
                        : COLORS.inputBorder,
                    },
                    "&:hover fieldset": {
                      borderColor: COLORS.primary,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: COLORS.primary,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: COLORS.bodyText,
                  },
                  "& .MuiInputBase-input": {
                    color: COLORS.bodyText,
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  bgcolor: COLORS.primary,
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px",
                  "&:hover": {
                    bgcolor: COLORS.primaryHover || COLORS.primary,
                  },
                  "&:disabled": {
                    bgcolor: COLORS.primary,
                    opacity: 0.7,
                  },
                }}
              >
                {isSubmitting ? "Restableciendo..." : "Restablecer Contraseña"}
              </Button>
            </Stack>
          </form>

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Button
              onClick={() => navigate("/login")}
              sx={{
                color: COLORS.primary,
                textTransform: "none",
                fontWeight: "600"
              }}
            >
              ← Volver al inicio de sesión
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
}