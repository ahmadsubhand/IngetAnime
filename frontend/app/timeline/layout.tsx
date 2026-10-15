import AppHeader from '@/components/app-header';
import { ReactNode } from 'react';

export default function TimelineLayout({ children }: { children: ReactNode }) {
  return (
    <div className='w-full min-h-svh flex flex-col'>
      <AppHeader className='sticky top-0 left-0' />
      <main className="pt-5 sm:pb-5 flex flex-col gap-5 flex-1 items-center bg-[#ECFDF5]">
        {children}
      </main>
    </div>
  );
}
