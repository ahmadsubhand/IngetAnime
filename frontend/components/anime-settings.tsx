'use client';

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CloudDownload,
  Settings,
  Trash,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AccessType, AnimeStatus } from '../enums';
import Image from 'next/image';
import { Field, FieldGroup, FieldLabel } from './ui/field';
import SelectField from './select-field';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Anime } from '../types/anime.model';
import { AnimePlatform } from '../types/anime-platform.model';
import getEpisodeAired from '../helper/get-episode-aired';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  SubmitEventHandler,
  useEffect,
  useState,
} from 'react';
import DateField from './date-field';
import axios, { HttpStatusCode } from 'axios';
import { ApiExpectedError, ApiValidationError } from '../types';
import { toast } from './ui/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import malService from '../services/mal.service';
import { Spinner } from './ui/spinner';
import { useAuth } from '../providers/auth-provider';
import InputField from '@/components/input-field';
import { AnimeValidation, UpdateAnime } from '@/validator/anime.validation';
import animeService from '@/services/anime.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import {
  AnimePlatformValidation,
  CreateOrUpdateAnimePlatform,
} from '@/validator/anime-platform.validation';
import animePlatformService from '@/services/anime-platform.service';
import SwitchField from '@/components/switch-field';
import DateTimeField from '@/components/date-time-field';
import { Platform } from '@/types/platform.model';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePlatforms } from '@/providers/platform-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import AnimeUnsaved from '@/components/anime-unsaved';

dayjs.extend(utc);

// Main Component

export default function AnimeSettings({
  anime,
}: {
  anime: Anime & {
    animePlatforms: AnimePlatform[];
  };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin, isLoading } = useAuth();

  const [dialogToPlatformOpen, setDialogToPlatformOpen] = useState(false);
  const [dialogToAnimeOpen, setDialogToAnimeOpen] = useState(false);
  const [onPlatformForm, setOnPlatformForm] = useState(false);

  const { platforms } = usePlatforms();
  const [selectedPlatformId, setSelectedPlatformId] = useState(
    anime.animePlatforms[0]?.platform.id || null,
  );
  const effectiveSelectedPlatformId =
    selectedPlatformId ?? platforms?.[0]?.id ?? null;

  const [dialogChangePlatformOpen, setDialogChangePlatformOpen] =
    useState(false);
  const [nextPlatformId, setNextPlatformId] = useState<number | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // NOT CLEAR YET
  useEffect(() => {
    function handleDialogState() {
      if (isOpen) {
        if (!isLoading && !isAdmin) {
          setIsOpen(false);
        } else {
          setOnPlatformForm(false);
          setSelectedPlatformId(anime.animePlatforms[0]?.platform.id || null);
        }
      }
    }

    handleDialogState();
  }, [isOpen, isLoading, isAdmin, anime.animePlatforms]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Button size={'xs'} variant={'blue'} onClick={() => setIsOpen(true)}>
          <Settings />
        </Button>

        <DialogContent
          className={
            'px-0 py-0 w-full h-full sm:h-fit sm:max-w-fit flex sm:gap-0 overflow-hidden'
          }
          showCloseButton={false}
        >
          <div className="hidden lg:block w-80 relative">
            <Image
              src={anime.picture}
              alt={anime.title}
              sizes="376px"
              loading={'lazy'}
              className="object-cover"
              fill
            />
          </div>

          {onPlatformForm ? (
            effectiveSelectedPlatformId && (
              <PlatformSettings
                key={effectiveSelectedPlatformId}
                anime={anime}
                animePlatform={anime.animePlatforms.find(
                  (value) => value.platform.id === effectiveSelectedPlatformId,
                )}

                // Platform Navigation
                platforms={platforms ?? []}
                selectedPlatformId={effectiveSelectedPlatformId}
                setSelectedPlatformId={setSelectedPlatformId}
                setNextPlatformId={setNextPlatformId}
                setIsDeleteDialogOpen={setIsDeleteDialogOpen}

                // Form Navigation
                setOnPlatformForm={setOnPlatformForm}
                setDialogToAnimeOpen={setDialogToAnimeOpen}
                setDialogChangePlatformOpen={setDialogChangePlatformOpen}
              />
            )
          ) : (
            <InformationSettings
              anime={anime}
              setDialogToPlatformOpen={setDialogToPlatformOpen}
              setOnPlatformForm={setOnPlatformForm}
            />
          )}
        </DialogContent>
      </Dialog>

      <AnimeUnsaved
        title="Tetap lanjut ke jadwal platform"
        isOpen={dialogToPlatformOpen}
        setIsOpen={setDialogToPlatformOpen}
        onClick={() => setOnPlatformForm(true)}
      />

      <AnimeUnsaved
        title="Tetap lanjut ke status anime?"
        isOpen={dialogToAnimeOpen}
        setIsOpen={setDialogToAnimeOpen}
        onClick={() => setOnPlatformForm(false)}
      />

      <AnimeUnsaved
        title="Tetap lanjut ke platform lain?"
        isOpen={dialogChangePlatformOpen}
        setIsOpen={setDialogChangePlatformOpen}
        onClick={() => setSelectedPlatformId(nextPlatformId)}
      />

      {effectiveSelectedPlatformId && (
        <PlatformDelete 
          animeId={anime.id}
          animeTitle={anime.title}
          platformId={effectiveSelectedPlatformId}
          platforms={platforms ?? []}
          isOpen={isDeleteDialogOpen}
          setIsOpen={setIsDeleteDialogOpen}
        />
      )}
    </>
  );
}

function FieldWrap({ children }: { children: ReactNode }) {
  return (
    <FieldGroup className="flex gap-4 flex-col sm:flex-row">
      {children}
    </FieldGroup>
  );
}

function HeaderSettings({
  anime,
}: {
  anime: Anime & {
    animePlatforms: AnimePlatform[];
  };
}) {
  const mainPlatform =
    anime.animePlatforms.find((platform) => platform.isMainPlatform) ||
    anime.animePlatforms[0];
  const episodeAired = getEpisodeAired(
    anime.status,
    anime.episodeTotal,
    mainPlatform,
  );
  return (
    <div className="flex flex-col gap-1 text-center">
      <Tooltip>
        <TooltipTrigger
          render={
            <p className="font-bold text-2xl line-clamp-1">{anime.title}</p>
          }
        />
        <TooltipContent>{anime.title}</TooltipContent>
      </Tooltip>

      <p>
        {anime.status === 'finished_airing'
          ? 'Selesai tayang'
          : anime.status === 'currently_airing'
            ? 'Sedang tayang'
            : 'Akan tayang'}
        {episodeAired && `, ${episodeAired} eps sudah rilis`}
      </p>
    </div>
  );
}

function FormSettings({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
}) {
  return (
    <form
      className="w-full sm:w-155 py-4 px-5 flex flex-col justify-between gap-4"
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
}

function OverflowSettings({ children }: { children: ReactNode }) {
  return (
    <div className="flex overflow-y-scroll sm:overflow-visible flex-col gap-4 no-scrollbar p-1 sm:p-0">
      {children}
    </div>
  );
}

// Form

function InformationSettings({
  anime,
  setDialogToPlatformOpen,
  setOnPlatformForm,
}: {
  anime: Anime & {
    animePlatforms: AnimePlatform[];
  };
  setDialogToPlatformOpen: Dispatch<SetStateAction<boolean>>;
  setOnPlatformForm: Dispatch<SetStateAction<boolean>>;
}) {
  const form = useForm<UpdateAnime>({
    resolver: zodResolver(AnimeValidation.UPDATE_ANIME),
    mode: 'onChange',
    defaultValues: {
      picture: anime.picture || '',
      title: anime.title,
      titleEN: anime.titleEN || '',
      titleID: anime.titleID || '',
      releaseAt: anime.releaseAt || '',
      episodeTotal: anime.episodeTotal || 0,
      status: anime.status || 'not_yet_aired',
    },
  });

  const { isDirty, isSubmitting } = form.formState;

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: UpdateAnime) => {
      const response = (await animeService.update(data, anime.id)).data;
      form.reset(
        {
          picture: response.picture || '',
          title: response.title,
          titleEN: response.titleEN || '',
          titleID: response.titleID || '',
          releaseAt: response.releaseAt || '',
          episodeTotal: response.episodeTotal || 0,
          status: response.status || 'not_yet_aired',
        },
        {
          keepDirty: false,
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anime'] });
      // setIsOpen(false);
      toast.add({
        type: 'success',
        description: `Berhasil memperbarui anime ${anime.title}`,
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.BadRequest) {
          const zodErrors = error.response.data as ApiValidationError;
          zodErrors.error.forEach((issue) => {
            const field = issue.path[0] as keyof UpdateAnime;
            form.setError(field, {
              message: issue.message,
            });
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

  const [isFetchDataFromMal, setIsFetchDataFromMal] = useState(false);
  async function getMyAnimeListStatus() {
    try {
      setIsFetchDataFromMal(true);
      const animeFromMal = (
        await malService.detail(
          {
            fields:
              'main_picture,title,alternative_titles,start_date,num_episodes,status',
          },
          anime.malId,
        )
      ).data;
      if (animeFromMal) {
        form.setValues(
          {
            picture: animeFromMal.main_picture.large || '',
            title: animeFromMal.title,
            titleEN: animeFromMal.alternative_titles?.en || '',
            releaseAt: animeFromMal.start_date
              ? dayjs.utc(animeFromMal.start_date).format('YYYY-MM-DD')
              : '',
            episodeTotal: animeFromMal.num_episodes || 0,
            status: animeFromMal.status || 'not_yet_aired',
          },
          {
            shouldDirty: true,
            shouldValidate: true,
          },
        );
        toast.add({
          type: 'success',
          description: 'Berhasil mendapatkan status dari MyAnimeList',
        });
      } else {
        throw Error('Anime tidak ditemukan');
      }
    } catch {
      toast.add({
        type: 'error',
        description:
          'Gagal terhubung dengan MyAnimeList. Status anime tidak ditemukan atau akun Anda belum terhubung dengan MyAnimeList.',
      });
    } finally {
      setIsFetchDataFromMal(false);
    }
  }

  const isDisable = isPending || isSubmitting || isFetchDataFromMal;

  return (
    <FormSettings
      onSubmit={form.handleSubmit((data: UpdateAnime) => mutate(data))}
    >
      <HeaderSettings anime={anime} />
      <OverflowSettings>
        <FieldWrap>
          <InputField
            form={form}
            inputName={'titleEN'}
            inputLabel={'Judul Inggris'}
            inputPlaceholder="Judul bahasa Inggris"
            isDisable={isDisable}
          />
          <InputField
            form={form}
            inputName={'titleID'}
            inputLabel={'Judul Indonesia'}
            inputPlaceholder="Judul bahasa Indonesia"
            isDisable={isDisable}
          />
        </FieldWrap>

        <FieldWrap>
          <InputField
            form={form}
            inputName={'picture'}
            inputLabel={'Link gambar'}
            inputPlaceholder="Link gambar sampul"
            isDisable={isDisable}
          />
          <DateField
            form={form}
            inputName={'releaseAt'}
            inputLabel={'Tanggal rilis'}
            isDisable={isDisable}
            inputPlaceholder="TTTT-BB-HH"
          />
        </FieldWrap>

        <FieldWrap>
          <InputField
            form={form}
            inputName={'episodeTotal'}
            inputLabel={'Total episode'}
            inputType="number"
            isDisable={isDisable}
            inputPlaceholder="Total episode"
          />
          <SelectField
            form={form}
            inputName={'status'}
            inputLabel={'Status'}
            isDisable={isDisable}
            options={[
              { label: 'Akan tayang', value: AnimeStatus.not_yet_aired },
              {
                label: 'Sedang tayang',
                value: AnimeStatus.currently_airing,
              },
              {
                label: 'Selesai tayang',
                value: AnimeStatus.finished_airing,
              },
            ]}
          />
        </FieldWrap>
      </OverflowSettings>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <Button
          variant={'blue'}
          onClick={getMyAnimeListStatus}
          disabled={isDisable}
        >
          {isFetchDataFromMal ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <CloudDownload />
          )}
          Cek status di MyAnimeList
        </Button>
        <Button
          disabled={isDisable}
          onClick={() => {
            if (isDirty) {
              setDialogToPlatformOpen(true);
            } else {
              setOnPlatformForm(true);
            }
          }}
        >
          Jadwal platform <ArrowRight />
        </Button>
      </div>

      <div className="flex justify-between items-center mt-1 sm:mt-0">
        <DialogClose
          render={
            <Button variant={'red'} disabled={isDisable}>
              <X /> Batal
            </Button>
          }
        />
        <Button type="submit" disabled={isDisable}>
          Simpan
          {isPending || isSubmitting ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Check />
          )}
        </Button>
      </div>
    </FormSettings>
  );
}

function PlatformSettings({
  anime,
  animePlatform,
  setDialogToAnimeOpen,
  setOnPlatformForm,
  platforms,
  selectedPlatformId,
  setSelectedPlatformId,
  setDialogChangePlatformOpen,
  setNextPlatformId,
  setIsDeleteDialogOpen,
}: {
  anime: Anime;
  animePlatform?: AnimePlatform;
  setDialogToAnimeOpen: Dispatch<SetStateAction<boolean>>;
  setOnPlatformForm: Dispatch<SetStateAction<boolean>>;
  platforms: Platform[];
  selectedPlatformId: number;
  setSelectedPlatformId: Dispatch<SetStateAction<number | null>>;
  setDialogChangePlatformOpen: Dispatch<SetStateAction<boolean>>;
  setNextPlatformId: Dispatch<SetStateAction<number | null>>;
  setIsDeleteDialogOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const isMobile = useIsMobile();

  const selectedPlatform = platforms.find(
    (value) => value.id === selectedPlatformId,
  );

  const form = useForm<CreateOrUpdateAnimePlatform>({
    resolver: zodResolver(
      AnimePlatformValidation.CREATE_OR_UPDATE_ANIME_PLATFORM,
    ),
    mode: 'onChange',
    defaultValues: {
      link: animePlatform?.link.url || '',
      accessType: animePlatform?.accessType || 'subscription',
      nextEpisodeAiringAt: animePlatform?.nextEpisodeAiringAt
        ? dayjs(animePlatform?.nextEpisodeAiringAt).format('YYYY-MM-DDTHH:mm')
        : '',
      lastEpisodeAiredAt: animePlatform?.lastEpisodeAiredAt
        ? dayjs(animePlatform?.lastEpisodeAiredAt).format('YYYY-MM-DDTHH:mm')
        : '',
      intervalInDays: animePlatform?.intervalInDays || 7,
      episodeAired: animePlatform?.episodeAired || 0,
      isMainPlatform: animePlatform?.isMainPlatform || false,
      isHiatus: animePlatform?.isHiatus || false,
    },
  });

  const { dirtyFields, isSubmitting, isDirty } = form.formState;

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: CreateOrUpdateAnimePlatform) => {
      const response = (
        await animePlatformService.createOrUpdate(
          data,
          anime.id,
          selectedPlatformId,
        )
      ).data;
      form.reset(
        {
          link: response.link.url || '',
          accessType: response.accessType || 'subscription',
          nextEpisodeAiringAt: response.nextEpisodeAiringAt
            ? dayjs(response.nextEpisodeAiringAt).format('YYYY-MM-DDTHH:mm')
            : '',
          lastEpisodeAiredAt: response.lastEpisodeAiredAt
            ? dayjs(response.lastEpisodeAiredAt).format('YYYY-MM-DDTHH:mm')
            : '',
          intervalInDays: response.intervalInDays || 7,
          episodeAired: response.episodeAired || 0,
          isMainPlatform: response.isMainPlatform || false,
          isHiatus: response.isHiatus || false,
        },
        {
          keepDirty: false,
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anime'] });
      // setIsOpen(false);
      toast.add({
        type: 'success',
        description: `Berhasil memperbarui platform ${selectedPlatform?.name || 'baru'}`,
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.BadRequest && (error.response.data.message as string).includes('match')) {
          form.setError('link', {
            message: 'Link tidak sesuai dengan platform',
          });
        } else if (error.status === HttpStatusCode.BadRequest) {
          const zodErrors = error.response.data as ApiValidationError;
          zodErrors.error.forEach((issue) => {
            const field = issue.path[0] as keyof CreateOrUpdateAnimePlatform;
            form.setError(field, {
              message: issue.message,
            });
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

  const isDisable = isPending || isSubmitting;

  function onSubmit(data: CreateOrUpdateAnimePlatform) {
    if (
      data.lastEpisodeAiredAt &&
      data.nextEpisodeAiringAt &&
      !dayjs(data.lastEpisodeAiredAt).isBefore(dayjs(data.nextEpisodeAiringAt))
    ) {
      toast.add({
        type: 'error',
        description:
          'Jadwal episode sebelumnya tidak boleh lewat dari jadwal episode berikutnya',
      });
    } else {
      mutate(data);
    }
  }

  const lastEpisodeAiredAt = useWatch({
    control: form.control,
    name: 'lastEpisodeAiredAt',
  });

  useEffect(() => {
    if (
      lastEpisodeAiredAt &&
      dirtyFields.lastEpisodeAiredAt &&
      AnimePlatformValidation.CREATE_OR_UPDATE_ANIME_PLATFORM.safeParse({
        lastEpisodeAiredAt,
        link: 'https://example.com',
      }).success
    ) {
      const nextEpisodeAiringAt = dayjs(lastEpisodeAiredAt).add(
        form.getValues('intervalInDays') || 7,
        'day',
      );
      form.setValue(
        'nextEpisodeAiringAt',
        nextEpisodeAiringAt.format('YYYY-MM-DDTHH:mm'),
        { shouldDirty: true, shouldValidate: true },
      );
    }
  }, [lastEpisodeAiredAt, dirtyFields.lastEpisodeAiredAt, form]);

  const nextEpisodeAiringAt = useWatch({
    control: form.control,
    name: 'nextEpisodeAiringAt',
  });

  useEffect(() => {
    if (dirtyFields.nextEpisodeAiringAt) {
      if (!nextEpisodeAiringAt)
        form.setValue('isHiatus', true, {
          shouldDirty: true,
          shouldValidate: true,
        });
      else
        form.setValue('isHiatus', false, {
          shouldDirty: true,
          shouldValidate: true,
        });
    }
  }, [dirtyFields.nextEpisodeAiringAt, form, nextEpisodeAiringAt]);

  const platformOptions = platforms.map((platform) => {
    return {
      label: platform.name,
      value: platform.id,
    };
  });

  return (
    <FormSettings onSubmit={form.handleSubmit(onSubmit)}>
      <HeaderSettings
        anime={{
          ...anime,
          animePlatforms: animePlatform ? [{ ...animePlatform }] : [],
        }}
      />

      <OverflowSettings>
        <FieldWrap>
          <Field>
            <FieldLabel htmlFor={`platformId-${selectedPlatformId}`}>
              Platform
            </FieldLabel>
            <Select
              items={platformOptions}
              value={selectedPlatformId}
              onValueChange={(value) => {
                if (isDirty) {
                  setDialogChangePlatformOpen(true);
                  setNextPlatformId(value);
                } else {
                  setSelectedPlatformId(value);
                }
              }}
              disabled={isDisable}
            >
              <SelectTrigger
                className={`bg-background w-full`}
                id={`platformId-${selectedPlatformId}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Platform</SelectLabel>
                  {platformOptions.map((option) => (
                    <SelectItem value={option.value} key={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <InputField
            form={form}
            inputName={'link'}
            inputLabel={'Link'}
            inputPlaceholder="Link platform"
            isDisable={isDisable}
          />
        </FieldWrap>

        <FieldWrap>
          <SelectField
            form={form}
            inputName="accessType"
            inputLabel="Tipe akses"
            isDisable={isDisable}
            options={[
              { label: 'Gratis', value: AccessType.free },
              { label: 'Waktu terbatas', value: AccessType.limited_time },
              { label: 'Langganan', value: AccessType.subscription },
            ]}
          />
          {anime.episodeTotal && anime.episodeTotal < 101 ? (
            <SelectField
              form={form}
              inputName={'episodeAired'}
              inputLabel={'Episode tayang'}
              isDisable={isDisable}
              options={Array.from({ length: anime.episodeTotal + 1 }).map(
                (_, i) => {
                  return { label: i.toString(), value: i };
                },
              )}
            />
          ) : (
            <InputField
              form={form}
              inputName={'episodeAired'}
              inputLabel={'Episode tayang'}
              inputType="number"
              inputPlaceholder="Jumlah episode yang sudah tayang"
              isDisable={isDisable}
            />
          )}
        </FieldWrap>

        <FieldWrap>
          <DateTimeField
            form={form}
            inputName={'lastEpisodeAiredAt'}
            inputLabel={'Episode sebelumnya'}
            isDisable={isDisable}
            inputPlaceholder="YYYY-MM-DDTHH:mm"
          />
          <DateTimeField
            form={form}
            inputName={'nextEpisodeAiringAt'}
            inputLabel={'Episode berikutnya'}
            isDisable={isDisable}
            inputPlaceholder="YYYY-MM-DDTHH:mm"
          />
        </FieldWrap>
      </OverflowSettings>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <Button
          disabled={isDisable}
          onClick={() => {
            if (isDirty) {
              setDialogToAnimeOpen(true);
            } else {
              setOnPlatformForm(false);
            }
          }}
        >
          <ArrowLeft /> Status anime
        </Button>
        <div className="flex flex-col w-full gap-2 items-center">
          <SwitchField
            form={form}
            inputName="isMainPlatform"
            inputLabel={'Jadikan sebagai platform utama'}
            labelPosition={isMobile ? 'right' : 'left'}
            isDisable={isDisable}
            className="w-fit sm:w-full"
          />
          <SwitchField
            form={form}
            inputName="isHiatus"
            inputLabel={'Update tidak berjalan'}
            labelPosition={isMobile ? 'right' : 'left'}
            isDisable={isDisable}
            className="w-fit sm:w-full"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-1 sm:mt-0">
        <Button
          variant={'red'}
          disabled={isDisable || !animePlatform}
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash /> <span className="hidden sm:inline">Hapus</span>
        </Button>
        <div className="flex gap-2 sm:gap-3">
          <DialogClose
            render={
              <Button variant={'red'} disabled={isDisable}>
                <X /> Batal
              </Button>
            }
          />
          <Button type="submit" disabled={isDisable}>
            Simpan
            {isPending || isSubmitting ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Check />
            )}
          </Button>
        </div>
      </div>      
    </FormSettings>
  );
}

function PlatformDelete({
  animeId,
  animeTitle,
  platformId,
  platforms,
  isOpen,
  setIsOpen,
}: {
  animeId: number;
  animeTitle: string;
  platformId: number;
  platforms: Platform[];
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const selectedPlatform = platforms.find(
    (value) => value.id === platformId,
  );
  const platformName = selectedPlatform?.name || ''

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await animePlatformService.delete(animeId, platformId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anime'] });
      setIsOpen(false);
      toast.add({
        type: 'success',
        description: `Berhasil menghapus platform ${platformName} untuk anime ${animeTitle}`,
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.NotFound) {
          toast.add({
            type: 'error',
            description:
              'Platform tidak ditemukan',
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className={'text-lg font-semibold'}>
            Hapus platform dari anime?
          </DialogTitle>
          <DialogDescription>
            Tindakan ini juga akan menghapus platform {platformName} dari pilihan pengguna pada list anime {animeTitle}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            disabled={isPending}
            render={
              <Button variant={'outline'}>
                <X /> Batal
              </Button>
            }
          />
          <Button
            variant={'red'}
            disabled={isPending}
            onClick={() => mutate()}
            className={'flex-row-reverse sm:flex-row'}
          >
            Hapus
            {isPending ? <Spinner data-icon="inline-start" /> : <Trash />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
