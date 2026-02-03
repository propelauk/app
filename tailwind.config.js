/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.tsx", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  corePlugins: {
    space: false,
  },
  theme: {
    // NOTE to AI: You can extend the theme with custom colors or styles here.
    extend: {
      colors: {
        // Calm Dark Theme - ADHD Productivity App
        background: {
          DEFAULT: '#1a1a1f', // Very dark charcoal (not pure black)
          card: '#252529',    // Mist gray for cards
          elevated: '#2f2f35', // Slightly lighter for elevation
        },
        primary: {
          DEFAULT: '#5b9a8b', // Desaturated teal
          light: '#6fb3a2',
          dark: '#4a8276',
          muted: '#4a7d71',
        },
        accent: {
          DEFAULT: '#5b9a8b', // Blue-green accent
          success: '#6b9b7a',
          warning: '#c4a574',
          danger: '#b87070',
        },
        text: {
          DEFAULT: '#e8e8e8',
          secondary: '#9a9a9f',
          muted: '#6b6b70',
        },
        border: {
          DEFAULT: '#3a3a40',
          light: '#454550',
        },
      },
      fontSize: {
        xs: "10px",
        sm: "12px",
        base: "14px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "40px",
        "5xl": "48px",
        "6xl": "56px",
        "7xl": "64px",
        "8xl": "72px",
        "9xl": "80px",
      },
    },
  },
  darkMode: "class",
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      const spacing = theme("spacing");

      // space-{n}  ->  gap: {n}
      matchUtilities(
        { space: (value) => ({ gap: value }) },
        { values: spacing, type: ["length", "number", "percentage"] }
      );

      // space-x-{n}  ->  column-gap: {n}
      matchUtilities(
        { "space-x": (value) => ({ columnGap: value }) },
        { values: spacing, type: ["length", "number", "percentage"] }
      );

      // space-y-{n}  ->  row-gap: {n}
      matchUtilities(
        { "space-y": (value) => ({ rowGap: value }) },
        { values: spacing, type: ["length", "number", "percentage"] }
      );
    }),
  ],
};

