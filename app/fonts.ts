import { Orbitron, Barlow } from 'next/font/google';

/** Retro-futuristic display font — space-age headings */
export const orbitron = Orbitron({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-orbitron',
});

/** Mid-century inspired body font — warm, readable */
export const barlow = Barlow({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
}); 