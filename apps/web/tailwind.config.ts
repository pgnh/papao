import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Màu Điệp (Vỏ sò điệp nghiền mịn, ánh xà cừ làm giấy nền)
        diep: {
          light: '#FFFDF8',
          DEFAULT: '#F7F2E7',
          dark: '#EADFC9',
        },
        // Màu Son (Đỏ sỏi núi, mái đình, con dấu triện đỏ)
        son: {
          light: '#E05A56',
          DEFAULT: '#C73E3A',
          dark: '#982824',
        },
        // Màu Chàm (Lá chàm ngâm vôi, áo tứ thân, rặng núi biếc)
        cham: {
          light: '#4A7299',
          DEFAULT: '#2E4E6B',
          dark: '#1C3247',
        },
        // Màu Vàng Hòe (Hoa hòe phơi khô, dải mây, quả pao)
        vang: {
          light: '#F5C75D',
          DEFAULT: '#E5A823',
          dark: '#B88114',
        },
        // Màu Than Tre (Viền mộc bản khắc gỗ đen, chữ nét khắc)
        than: {
          light: '#383632',
          DEFAULT: '#1F1E1B',
        },
        // Màu Trúc Xanh (Lũy tre làng)
        truc: {
          DEFAULT: '#4A6B45',
        },
      },
      fontFamily: {
        dongho: ['var(--font-averia)', 'serif'],
        thuphap: ['var(--font-sedgwick)', 'cursive', 'serif'],
        sans: ['var(--font-be-vietnam)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'moc-ban': '2px 2px 0px 0px #1F1E1B',
        'trien-do': '0 0 12px rgba(199, 62, 58, 0.45)',
      },
    },
  },
  plugins: [],
};

export default config;
