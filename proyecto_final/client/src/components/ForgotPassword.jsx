import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Box, Paper, TextField, Button, Typography, Stack } from "@mui/material";
import { ToastContainer, useToast } from "../components/Toast";
import { COLORS } from "../utils/colors";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toasts, showToast, removeToast, closeToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showToast("Por favor, ingresa tu email", "error", 3000);
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Por favor, ingresa un email válido", "error", 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await axios.post("http://localhost:3000/password-reset-request", { email });

      if (data.success) {
        setIsSubmitted(true);
        showToast(data.message, "success", 5000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al enviar el correo de recuperación";
      showToast(errorMessage, "error", 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              ¿Olvidaste tu contraseña?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: COLORS.bodyText,
                mb: 3
              }}
            >
              No te preocupes, te enviaremos un enlace para recuperarla
            </Typography>
          </Box>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  required
                  disabled={isSubmitting}
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
                  {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>
              </Stack>
            </form>
          ) : (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: COLORS.primary,
                  mb: 2,
                  fontWeight: "600"
                }}
              >
                ✅ Correo enviado
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: COLORS.bodyText,
                  mb: 3
                }}
              >
                Hemos enviado un enlace de recuperación a tu email.
                Revisa tu bandeja de entrada y carpeta de spam.
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: COLORS.bodyText,
                  mb: 3
                }}
              >
                El enlace expirará en 1 hora por seguridad.
              </Typography>
            </Box>
          )}

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Link
              to="/login"
              style={{
                color: COLORS.primary,
                textDecoration: "none",
                fontWeight: "600"
              }}
            >
              ← Volver al inicio de sesión
            </Link>
          </Box>
        </Paper>
      </Box>
    </>
  );
}