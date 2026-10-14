import AppHeader from '@/components/app-header';
import { ReactNode } from 'react';

export default function HomeSection({
  children,
  id,
  className = '',
}: {
  children: ReactNode;
  id: string;
  className?: string;
}) {
  return (
    <section className={`min-h-dvh w-full flex flex-col`} id={id}>
      <AppHeader className="opacity-0" />
      <div className={`flex-1 py-15 md:py-25 px-5 md:px-19 ${className}`}>
        {children}
      </div>
    </section>
  );
}
