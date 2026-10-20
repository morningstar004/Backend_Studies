export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#5D75C0",
        darkBg: "#000000",
        lightGrey: "#696969",
      },
      backgroundColor: {
        glass: "var(--glass-background, rgba(255, 255, 255, 0.72))",
      },
      backdropBlur: {
        glass: "var(--glass-blur, 14px)",
      },
    },
  },
  plugins: [],
};
