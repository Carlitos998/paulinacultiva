// src/theme.js
import { createTheme } from "@mui/material/styles";

const PALETTE = {
  primary: "#d13727",
  primaryDark: "#8b1e14",
  primaryLight: "#f76c5e",
  background: "#f9f2ec",
  paper: "#ffffff",
  text: "#3d3d3d",
  muted: "#444",
  divider: "#f0dad5",
  shadow: "rgba(0,0,0,0.1)",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: PALETTE.primary, dark: PALETTE.primaryDark, light: PALETTE.primaryLight },
    background: { default: PALETTE.background, paper: PALETTE.paper },
    text: { primary: PALETTE.text, secondary: PALETTE.muted },
    divider: PALETTE.divider,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: PALETTE.primary,
          color: "#fff",
          "&:hover": { backgroundColor: PALETTE.primaryDark },
          textTransform: "none",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: PALETTE.divider,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: PALETTE.primaryLight,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: PALETTE.primary,
            boxShadow: `0 0 0 6px rgba(209,55,39,0.06)`,
          },
          "& input": {
            color: PALETTE.text,
          },
          "&:-webkit-autofill": {
            WebkitBoxShadow: `0 0 0 1000px ${PALETTE.paper} inset`,
            WebkitTextFillColor: PALETTE.text,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: PALETTE.primaryDark,
          "&.Mui-focused": { color: PALETTE.primary },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: PALETTE.primaryDark,
          color: "#fff",
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: PALETTE.paper,
          border: `1px solid ${PALETTE.divider}`,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          "& input:-webkit-autofill": {
            WebkitBoxShadow: `0 0 0 1000px ${PALETTE.paper} inset`,
            WebkitTextFillColor: PALETTE.text,
          },
        },
      },
    },
  },
});

export default theme;
