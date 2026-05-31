/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#F2F5FB",
          100: "#DCE3F1",
          200: "#B5C2DD",
          300: "#8398BF",
          400: "#5169A0",
          500: "#2E4373",
          600: "#243762",
          700: "#1B2A4A",
          800: "#141F38",
          900: "#0C1428",
        },
        gold: {
          50: "#FDF5EC",
          100: "#FAE5CC",
          200: "#F2B077",
          300: "#EC9F5C",
          400: "#E8954A",
          500: "#D6843A",
          600: "#C9762F",
          700: "#9F5C23",
          800: "#754319",
          900: "#4B2A0F",
        },
        primary: {
          DEFAULT: "#1B2A4A",
          light: "#2E4373",
          dark: "#0C1428",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#E8954A",
          light: "#F2B077",
          dark: "#C9762F",
          foreground: "#FFFFFF",
        },
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        info: "#2563EB",
        surface: "#F8FAFC",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.06)",
        card: "0 4px 14px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
        elevated: "0 12px 32px rgba(15,23,42,0.12), 0 4px 8px rgba(15,23,42,0.06)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: 0, transform: "translateY(4px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 80%, 100%": { opacity: 0.3 },
          "40%": { opacity: 1 },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "pulse-dot": "pulse-dot 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
