// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
      extend: {
        colors: {
          primary:   '#B22222',  // vermelho escuro
          secondary: '#1A1A1A',  // mantém o preto profundo
          accent:    '#F5F5F5',  // mantém o prata/cinza claro
          background:'#FFFFFF',
        },
        boxShadow: {
          card: '0 4px 12px rgba(0,0,0,0.06)',
        },
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        },
      },
    },
    plugins: [require('@tailwindcss/forms')],
  };
  