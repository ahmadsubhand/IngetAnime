'use client';

import InputField from '@/components/input-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import UseFileInput from '@/hooks/use-file-input';
import { useIsMobile } from '@/hooks/use-mobile';
import platformService from '@/services/platform.service';
import { ApiExpectedError, ApiValidationError } from '@/types';
import type { Platform } from '@/types/platform.model';
import {
  PlatformName,
  PlatformValidation,
} from '@/validator/platform.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { HttpStatusCode } from 'axios';
import { Check, RefreshCw, Upload } from 'lucide-react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';

export default function ListPlatform({ 
  platform
}: { 
  platform: Platform & { _count: { animePlatforms: number } };
}) {
  const {
    iconFile,
    iconPreview,
    fileInputRef,
    handleIconChange,
    handleIconReset,
    onIconSuccess,
  } = UseFileInput();

  const form = useForm({
    resolver: zodResolver(PlatformValidation.PLATFORM_NAME),
    mode: 'onChange',
    defaultValues: {
      name: platform.name,
    },
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: PlatformName) => {
      await platformService.updatePlatform(data, platform.id, iconFile);
    },
    onSuccess: () => {
      onIconSuccess();
      queryClient.invalidateQueries({ queryKey: ['anime'] });
      toast.add({
        type: 'success',
        description: `Berhasil memperbarui platform ${platform.name}`,
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.BadRequest) {
          const zodErrors = error.response.data as ApiValidationError;
          zodErrors.error.forEach((issue) => {
            const field = issue.path[0] as keyof PlatformName;
            form.setError(field, {
              message: issue.message,
            });
          });
        } else if (error.status === HttpStatusCode.Conflict) {
          toast.add({
            type: 'error',
            description: 'Nama platform sudah ada',
          });
        } else {
          const expectedError = error.response.data as ApiExpectedError;
          toast.add({
            type: 'error',
            description: expectedError.message,
          });
        }
      } else {
        toast.add({
          type: 'error',
          description:
            'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
        });
      }
    },
  });

  function handleReset() {
    form.reset({ name: platform.name });
    handleIconReset();
  }

  const isDisable = mutation.isPending || form.formState.isSubmitting;

  const isMobile = useIsMobile();
  const height = isMobile ? 40 : 80;
  const width = Math.ceil(platform.ratio * height);

  return (
    <Card className="relative items-center py-5 px-6 gap-3">
      <div className="w-fit flex-wrap sm:flex-nowrap flex justify-center items-center gap-3">
        <div
          className="relative"
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          <Image
            src={
              iconPreview ??
              `${process.env.NEXT_PUBLIC_API_BASE_URL}${platform.icon}`
            }
            alt={platform.name}
            sizes={`${width}px`}
            className="object-contain"
            loading="eager"
            fill
          />
        </div>
        <p className="max-w-36 sm:max-w-27">
          {platform._count.animePlatforms || 0} platform anime telah terhubung
        </p>
      </div>

      {iconPreview && (
        <Badge className="absolute top-0 left-0">Pratinjau</Badge>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleIconChange}
      />

      <div className="w-full flex gap-3 items-center justify-center">
        <Button variant={'red'} onClick={handleReset} disabled={isDisable}>
          <RefreshCw />
        </Button>
        <Button
          type="button"
          variant="gray"
          className="flex-1"
          disabled={isDisable}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload />
          Ganti Gambar
        </Button>
      </div>

      <form
        className="w-full flex gap-3 items-start justify-center"
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
      >
        <InputField
          form={form}
          inputName="name"
          inputPlaceholder="Nama platform"
          className="flex-1"
          isDisable={isDisable}
        />
        <Button type="submit" disabled={isDisable}>
          <Check />
        </Button>
      </form>
    </Card>
  );
}

export function PlatformSkeleton({ className = '' }: { className?: string }) {
  return (
    <Card className={`relative items-center py-5 px-6 gap-3 ${className}`}>
      <div className="w-fit flex-wrap sm:flex-nowrap flex justify-center items-center gap-3">
        <Skeleton className="w-10 sm:w-20 h-10 sm:h-20" />
        <div className="flex flex-col gap-2 max-w-36 sm:max-w-27">
          <Skeleton className="w-32 sm:w-25 h-4" />
          <Skeleton className="w-25 h-4" />
          <Skeleton className="hidden sm:block w-20 h-4" />
        </div>
      </div>

      <div className="w-full flex gap-4 items-center justify-center">
        <Skeleton className="w-9 h-9" />
        <Skeleton className="w-53 h-9" />
      </div>
      <div className="w-full flex gap-3 items-start justify-center">
        <Skeleton className="w-53 h-9" />
        <Skeleton className="w-9 h-9" />
      </div>
    </Card>
  );
}
