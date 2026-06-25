/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#141414',
        'surface-raised': '#1c1c1c',
        hairline: '#262626',
        'text-hi': '#ffffff',
        'text-mid': '#9a9a9a',
        'text-low': '#666666',
        'apex-red': '#ff1801',
      },
      fontFamily: {
        'barlow-condensed': ['BarlowCondensed_700Bold'],
        'barlow-condensed-semibold': ['BarlowCondensed_600SemiBold'],
        inter: ['Inter_400Regular'],
        'jetbrains-mono': ['JetBrainsMono_500Medium'],
        'jetbrains-mono-bold': ['JetBrainsMono_700Bold'],
      },
    },
  },
};
