import { ReactNode } from 'react';
import { ExplorationProviders } from './providers';

export default function ExplorationLayout({ children }: { children: ReactNode }) {
  return (
    <ExplorationProviders>
      <div className="w-full min-h-full py-5 px-5 flex flex-col gap-5 relative items-center bg-[#ECFDF5] z-0">
        {children}
      </div>
    </ExplorationProviders>
  )
}