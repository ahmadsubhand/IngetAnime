'use client';

import InputField from '@/components/input-field';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import UseFileInput from '@/hooks/use-file-input';
import platformService from '@/services/platform.service';
import { ApiExpectedError } from '@/types';
import {
  PlatformName,
  PlatformValidation,
} from '@/validator/platform.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { HttpStatusCode } from 'axios';
import { ImageIcon, Plus, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function AddPlatform() {
  const PREVIEW_SIZE = 85;
  const {
      iconFile,
      iconPreview,
      fileInputRef,
      handleIconChange,
      handleIconReset,
      onIconSuccess,
    } = UseFileInput();

  const form = useForm<PlatformName>({
    resolver: zodResolver(PlatformValidation.PLATFORM_NAME),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      name: '',
    },
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: PlatformName) => {
      await platformService.createPlatform(data, iconFile);
    },
    onSuccess: () => {
      form.reset({ name: '' });
      onIconSuccess();
      queryClient.invalidateQueries({
        queryKey: ['anime'],
      });
      toast.add({
        type: 'success',
        description: 'Berhasil menambahkan platform baru',
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.BadRequest) {
          toast.add({
            type: 'error',
            description: 'Icon platform wajib diunggah',
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

  const isDisable = mutation.isPending || form.formState.isSubmitting;

  return (
    <form
      className="w-full"
      onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
    >
      <FieldGroup className="sm:flex-row justify-center items-center sm:items-end gap-4">
        {/* Image Preview */}
        <div className="flex flex-col gap-3">
          <div
            className="relative flex shrink-0 items-center justify-center rounded-md border bg-muted"
            style={{
              width: PREVIEW_SIZE,
              height: PREVIEW_SIZE,
            }}
          >
            {iconPreview ? (
              <>
                <Image
                  src={iconPreview}
                  alt="Preview icon platform"
                  fill
                  className="object-contain p-1"
                  sizes={`${PREVIEW_SIZE}px`}
                  unoptimized
                />

                {!isDisable && (
                  <Button
                    size={'xs'}
                    className={
                      'absolute -right-2 -top-2 rounded-full h-fit p-1'
                    }
                    onClick={handleIconReset}
                    variant={'red'}
                  >
                    <X />
                  </Button>
                )}
              </>
            ) : (
              <ImageIcon className="size-7 text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-col gap-3 w-full sm:w-fit">
          <Controller
            control={form.control}
            name={'name'}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                orientation={'vertical'}
                className="flex-col-reverse sm:flex-col"
              >
                {fieldState.invalid && (
                  <FieldDescription
                    className={fieldState.invalid ? 'text-destructive' : ''}
                  >
                    {fieldState.error?.message}
                  </FieldDescription>
                )}
                <Input
                  className="bg-background"
                  disabled={isDisable}
                  {...field}
                  id={'add-platform'}
                  placeholder={'Nama platform'}
                  aria-invalid={fieldState.invalid}
                  onChange={(e) => {
                    field.onChange(e);
                    form.clearErrors('name');
                  }}
                />
              </Field>
            )}
          />

          {/* Upload */}
          <Button
            type="button"
            variant="gray"
            disabled={isDisable}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload />
            {iconFile ? 'Ganti Icon' : 'Upload Icon'}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleIconChange}
          disabled={isDisable}
        />

        {/* Submit */}
        <Button
          type="submit"
          disabled={isDisable}
          className={'sm:flex-col w-full sm:w-fit sm:h-21 px-5'}
        >
          <Plus />
          Tambah
        </Button>
      </FieldGroup>
    </form>
  );
}
