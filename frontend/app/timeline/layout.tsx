import { ReactNode } from 'react';

export default function TimelineLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-full pt-5 flex flex-col gap-5 relative items-center bg-[#ECFDF5] z-0">
      {children}
    </div>
  );
}
