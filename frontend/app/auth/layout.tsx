import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-45 bg-black text-center">
      {children}
    </div>
  )
}