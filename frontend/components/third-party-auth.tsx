import Image from 'next/image';
import { Button } from './ui/button';
import authService from '../services/auth.service';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { Spinner } from './ui/spinner';

export default function ThirdPartyAuth({
  isLoading = false,
  setIsLoading,
}: {
  isLoading?: boolean;
  setIsLoading?: (isLoading: boolean) => void;
}) {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingMal, setIsLoadingMal] = useState(false);

  async function onClickGoogle() {
    try {
      setIsLoadingGoogle(true);
      setIsLoading?.(true);
      const { data } = await authService.getGoogleAuthUrl({ mode: 'login' });
      redirect(data.url);
    } finally {
      setIsLoadingGoogle(false);
      setIsLoading?.(false);
    }
  }

  async function onClickMal() {
    try {
      setIsLoadingMal(true);
      setIsLoading?.(true);
      const { data } = await authService.getMalAuthUrl({ mode: 'login' });
      redirect(data.url);
    } finally {
      setIsLoadingMal(false);
      setIsLoading?.(false);
    }
  }
  return (
    <div className="flex gap-5 w-full">
      <Button
        variant={'outline'}
        className={'flex-1'}
        onClick={onClickGoogle}
        disabled={isLoading || isLoadingGoogle || isLoadingMal}
      >
        {isLoadingGoogle ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <Image src={'/google.png'} alt="google logo" width={16} height={16} />
        )}
        Google
      </Button>
      <Button
        variant={'ghost'}
        onClick={onClickMal}
        disabled={isLoading || isLoadingGoogle || isLoadingMal}
        className={`flex-1 bg-app-blue hover:text-white hover:bg-app-blue text-white [&_svg:not([class*='size-'])]:size-6`}
      >
        {isLoadingMal ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <Image src={'/mal.png'} alt="google logo" width={24} height={24} />
        )}
        MyAnimeList
      </Button>
    </div>
  );
}
