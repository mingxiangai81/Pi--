import type { Config } from 'tailwindcss';

// Cyber-Chinese / 高科技暗黑风 主题 token
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 深色基调
        ink: {
          950: '#0B1120',
          900: '#0F172A', // 主背景
          850: '#141B2D',
          800: '#18181B', // 卡片背景（zinc-900 近似）
          700: '#1E293B',
          600: '#334155',
        },
        // 暗金（强调 / 主行动）
        gold: {
          DEFAULT: '#C6A15B',
          light: '#E3C88A',
          dark: '#9A7B3F',
        },
        // 朱红（点睛 / 火 / 警示）
        cinnabar: {
          DEFAULT: '#B91C1C',
          light: '#DC2626',
          dark: '#7F1212',
        },
        // 五行色板
        wuxing: {
          wood: '#4ADE80',
          fire: '#F87171',
          earth: '#D6B26B',
          metal: '#E5E7EB',
          water: '#38BDF8',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        serif: ['"Noto Serif SC"', 'ui-serif', 'serif'],
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(198,161,91,0.35)',
        'glow-red': '0 0 24px -6px rgba(185,28,28,0.45)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(rgba(198,161,91,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(198,161,91,0.05) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};

export default config;
