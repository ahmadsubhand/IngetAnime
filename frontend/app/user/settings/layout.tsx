import AppHeader from '@/components/app-header';
import { ReactNode } from 'react';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className='w-full min-h-svh flex flex-col'>
      <AppHeader className='sticky top-0 left-0' />
      <main className="py-5 px-5 flex items-center sm:justify-center flex-1">
        {children}
      </main>
    </div>
  );
}
