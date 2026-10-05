import { ReactNode } from 'react';
import { Card } from './ui/card';

export default function AnimeEmpty({
  message,
  action,
  imageWithDiv,
  className = '',
}: {
  message: string;
  action: ReactNode;
  imageWithDiv: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`w-full sm:py-0 px-8 mt-5 sm:mt-15 flex-row items-center ${className}`}
    >
      <div className="flex flex-col items-center gap-8 w-full">
        <div className="text-5xl font-black text-app-red">!</div>
        <p className="text-center">{message}</p>
        {action}
      </div>
      <div className="fixed bottom-0 left-0 flex justify-center sm:static pt-8 w-full -z-10 sm:z-0">
        {imageWithDiv}
      </div>
    </Card>
  );
}
