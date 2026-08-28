/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#ECE2CE',
        sand: '#E8D6C2',
        navy: '#0C1634',
        steel: '#40658A',
        slateblue: '#1A2545',
        powder: '#8CBCD0',
        terra: '#A43320',
        sienna: '#984A39',
        gold: '#E3A41A',
        ochre: '#B89343',
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36abf7',
          500: '#0c8fe9',
          600: '#0171c7',
          700: '#025aa1',
          800: '#064c84',
          900: '#0b406e',
          950: '#082849',
        },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        display: ['Dalek Pinpoint', 'serif'],
      },
      keyframes: {
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      },
      animation: {
        'scan-line': 'scan-line 3s linear infinite',
      }
    },
  },
  plugins: [],
};
