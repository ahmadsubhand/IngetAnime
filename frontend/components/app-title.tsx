import { ReactNode } from 'react';

export default function AppTitle({ 
  title, subtitle 
}: {
  title: string;
  subtitle: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p>{subtitle}</p>
    </div>
  )
}