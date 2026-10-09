import { ReactNode } from 'react';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-full py-5 px-5 flex items-center sm:justify-center">
      {children}
    </div>
  );
}
