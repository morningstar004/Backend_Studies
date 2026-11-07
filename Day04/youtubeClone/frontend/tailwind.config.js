export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5E887E",
          hover: "#4C7067",
          light: "#E3ECE9",
          dark: "#3B5850",
        },
        accent: {
          DEFAULT: "#C7A17A",
          hover: "#B38C64",
          light: "#F7F1EA",
          dark: "#99734D",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#141C1E",
        },
        bg: {
          light: "#EFF3F1",
          dark: "#0E1416",
        },
        slateDark: "#22333B",
        lightGrey: "#7E8C89",
      },
      backgroundColor: {
        glass: "var(--glass-background, rgba(255, 255, 255, 0.75))",
      },
      backdropBlur: {
        glass: "var(--glass-blur, 14px)",
      },
    },
  },
  plugins: [],
};
