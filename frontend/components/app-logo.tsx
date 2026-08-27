import localFont from 'next/font/local'

const nukuFont = localFont({
  src: '../fonts/nuku1.ttf',
})

export default function AppLogo({ className = '' }: { className?: string; }) {
  return (
    <div className={`${nukuFont.className} text-2xl ${className}`}>
      IngetAnime
    </div>
  )
}