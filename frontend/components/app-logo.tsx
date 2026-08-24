import localFont from 'next/font/local'

const nukuFont = localFont({
  src: '../fonts/nuku1.ttf',
})

export default function AppLogo() {
  return (
    <div className={`${nukuFont.className} text-xl`}>
      IngetAnime
    </div>
  )
}