import AppLogo from '@/components/app-logo';

export default function AppFooter() {
  return (
    <footer className="flex flex-col md:flex-row gap-4 md:gap-10 justify-between items-center h-40 px-4 md:px-19 py-4 md:py-10 bg-primary text-primary-foreground">
      <div className="flex gap-5 md:gap-10 items-center justify-between md:justify-start w-full md:w-fit">
        <AppLogo className="text-3xl md:text-5xl xl:text-6xl" />
        <div className="flex md:hidden lg:flex flex-col items-end md:items-start gap-1 uppercase text-xs md:tex-lg font-bold tracking-[.25em] w-fit">
          <span className="w-fit">Eksplorasi</span>
          <span className="w-fit">Platform</span>
          <span className="w-fit">Anime</span>
        </div>
      </div>

      <div className="flex flex-col justify-between self-stretch gap-3 text-center md:text-right">
        <p className="text-xs md:text-base font-bold tracking-widest">
          Designed and coded by <br className="hidden md:block lg:hidden" />{' '}
          Ahmad Subhan D
        </p>
        <p className="text-xs md:text-base font-normal">
          © 2026. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
