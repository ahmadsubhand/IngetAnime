import localFont from 'next/font/local';
import Link from 'next/link';

const nukuFont = localFont({
  src: '../fonts/nuku1.ttf',
});

export default function AppLogo({ className = '' }: { className?: string }) {
  return (
    <Link className={`${nukuFont.className} text-2xl ${className}`} href={'/'}>
      IngetAnime
    </Link>
  );
}
