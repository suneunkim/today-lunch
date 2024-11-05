import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ['var(--font-pretendard)'],
        paperlogy: ['var(--font-paperlogy)'],
      },
      fontSize: {
        display: ['48px', { lineHeight: '120%', fontWeight: '400' }], // Pretendard Regular
        heading1: ['20px', { lineHeight: '130%', fontWeight: '600' }], // Paperlogy SemiBold
        heading2: ['20px', { lineHeight: '130%', fontWeight: '600' }], // Pretendard SemiBold
        heading3: ['18px', { lineHeight: '130%', fontWeight: '700' }], // Paperlogy Bold
        headline1: ['18px', { lineHeight: '130%', fontWeight: '600' }], // Pretendard SemiBold
        headline2: ['16px', { lineHeight: '130%', fontWeight: '700' }], // Paperlogy Bold
        headline3: ['16px', { lineHeight: '130%', fontWeight: '600' }], // Paperlogy SemiBold
        body1Normal: ['16px', { lineHeight: '130%', fontWeight: '600' }], // Pretendard SemiBold
        body1Reading: ['16px', { lineHeight: '150%', fontWeight: '600' }], // Pretendard SemiBold
        body2: ['16px', { lineHeight: '130%', fontWeight: '400' }], // Pretendard Regular
        label1: ['14px', { lineHeight: '130%', fontWeight: '600' }], // Paperlogy-6, Semi bold
        label2: ['14px', { lineHeight: '150%', fontWeight: '400' }], // Pretendard, Regular
        label3: ['14px', { lineHeight: '150%', fontWeight: '600' }], // Paperlogy-6, Semi bold
        caption1: ['12px', { lineHeight: '130%', fontWeight: '400' }], // Pretendard, Regular
        caption2: ['12px', { lineHeight: '130%', fontWeight: '700' }], // Paperlogy-7, Bold
      },
      colors: {
        customs: {
          green: {
            '70': '#65fc7c',
          },
          yellow: {
            '70': '#fbf658',
          },
          orange: {
            '50': '#fe5f01',
            '55': '#fe6f1a',
            '95-bg': '#ffefe6',
          },
          gray: {
            '10': '#19181b',
            '25': '#3e3c44',
            '50': '#7d7887',
            '75': '#bebbc3',
            '90': '#e5e4e7',
            '95': '#f2f1f3',
            '100': '#fff',
          },
          beige: {
            '75': '#cdc8b8',
            '85': '#e0dcd0',
          },
        },
      },
      screens: {
        tablet: '480px',
      },
    },
  },
  plugins: [],
}
export default config
