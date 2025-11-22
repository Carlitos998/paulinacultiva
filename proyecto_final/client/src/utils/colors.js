// Paleta centralizada de colores para Paulina Cultiva
// Basada en la especificación del componente Register
export const COLORS = {
  fondoClaro: "#f9f2ec",   // root --fondo
  principal: "#d13727",    // root --principal
  oscuro: "#8b1e14",       // root --oscuro
  claro: "#f76c5e",        // root --claro
  bodyText: "#3d3d3d",     // texto principal
  paperBg: "#ffffff",      // tarjeta / paper
  mutedText: "#444",       // textos secundarios
  divider: "#f0dad5",      // líneas / bordes suaves
  successStar: "#ffbe3b",
  subtleShadow: "rgba(0,0,0,0.1)",
  white: "#ffffff",
  error: "#ef4444",
  warning: "#f59e0b",
  success: "#10b981",
  info: "#3b82f6"
};

// Función para obtener colores de forma segura
export const getColor = (colorName) => {
  return COLORS[colorName] || COLORS.bodyText;
};

// Tema para Material-UI
export const getMuiTheme = (createTheme) => {
  return createTheme({
    palette: {
      background: {
        default: COLORS.fondoClaro,
        paper: COLORS.paperBg,
      },
      primary: {
        main: COLORS.principal,
        dark: COLORS.oscuro,
        light: COLORS.claro,
      },
      text: {
        primary: COLORS.bodyText,
        secondary: COLORS.mutedText,
      },
      divider: COLORS.divider,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  });
};

export default COLORS;