/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#10B981", // Emerald 500
        secondary: "#F59E0B", // Amber 500
        dark: "#1F2937", // Gray 800
        light: "#F9FAFB", // Gray 50
      },
      fontFamily: {
        // We can add custom fonts here later if we load them
      }
    },
  },
  presets: [require("nativewind/preset")],
  plugins: [],
}
