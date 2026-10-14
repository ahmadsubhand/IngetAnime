import AppTitle from '@/components/app-title';
import { Spinner } from '@/components/ui/spinner';

export default function HomeLoading() {
  return (
    <div className="w-full h-full flex">
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full flex flex-col justify-center gap-5 sm:px-10 px-5 py-3 md:w-105 xl:mr-30">
          <AppTitle
            title="Memuat Halaman"
            subtitle={<>Tunggu sebentar, kami sedang memuat halaman yang Anda cari ...</>}
          />
          <div className="w-full flex justify-center">
            <Spinner className="size-8" />
          </div>
        </div>
      </div>
    </div>
  )
}