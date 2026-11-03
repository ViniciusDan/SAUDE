export const theme = {
  colors: {
    primary: "#1351B4",
    primaryDark: "#0d3d8a",
    primaryLight: "#dbeaff",
    accent: "#34A853",
    accentDark: "#2d8f47",
    accentLight: "#d4edda",
    
    // Neutros
    neutral: {
      50: "#f8f9fa",
      100: "#f3f4fa",
      200: "#e5e7ef",
      300: "#ced4da",
      400: "#aac5e6",
      500: "#6c757d",
      600: "#5b6b88",
      700: "#495057",
      800: "#213355",
      900: "#212529"
    },
    
    // Estados
    success: "#34A853",
    warning: "#ffc107",
    error: "#c62828",
    info: "#1351B4",
    
    // Backgrounds
    background: {
      light: "#ffffff",
      dark: "#1a1a1a",
      secondary: "#f8f9fa",
      tertiary: "#f3f4fa"
    },
    
    // Text
    text: {
      primary: "#212529",
      secondary: "#495057",
      tertiary: "#6c757d",
      inverse: "#ffffff"
    }
  },
  
  spacing: {
    xs: "0.25rem",    // 4px
    sm: "0.5rem",     // 8px
    md: "1rem",       // 16px
    lg: "1.5rem",     // 24px
    xl: "2rem",       // 32px
    "2xl": "2.5rem",  // 40px
    "3xl": "3rem"     // 48px
  },
  
  typography: {
    fontFamily: {
      sans: '"Segoe UI", "Inter", "Roboto", Arial, sans-serif',
      mono: '"Courier New", monospace'
    },
    fontSize: {
      xs: "0.75rem",   // 12px
      sm: "0.875rem",  // 14px
      base: "1rem",    // 16px
      lg: "1.125rem",  // 18px
      xl: "1.25rem",   // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem"   // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px rgba(0, 0, 0, 0.07)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.1)",
    "2xl": "0 25px 50px rgba(0, 0, 0, 0.15)"
  },
  
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px"
  },
  
  transitions: {
    fast: "0.15s ease",
    normal: "0.2s ease",
    slow: "0.3s ease"
  },
  
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px"
  }
} as const;

export type Theme = typeof theme;

