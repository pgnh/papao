import type { Metadata, Viewport } from 'next';
import { Averia_Libre, Sedgwick_Ave, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

const averia = Averia_Libre({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-averia',
  display: 'swap',
});

const sedgwick = Sedgwick_Ave({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-sedgwick',
  display: 'swap',
});

const beVietnam = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-be-vietnam',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pao - Sới Pao Dân Gian',
  description: 'Web Game PWA Đối Kháng Tọa Độ & Gắn Kết Văn Hóa Dân Gian Việt Nam',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/pao-icon.svg',
    apple: '/icons/pao-icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Pao Game',
  },
};

export const viewport: Viewport = {
  themeColor: '#C73E3A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${averia.variable} ${sedgwick.variable} ${beVietnam.variable}`}
    >
      <body className="bg-giay-diep font-sans text-than select-none overflow-hidden h-screen w-screen">
        {children}
      </body>
    </html>
  );
}
