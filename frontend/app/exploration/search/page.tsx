"use client";

import Image from "next/image";
import AppTitle from "../../../components/app-title";
import { ExplorationAnime, SkeletonAnime } from "../anime";
import { useInfiniteQuery } from "@tanstack/react-query";
import animeExplorationService from "../../../services/anime-exploration.service";
import { useEffect, useState } from "react";
import { useIsMobile } from "../../../hooks/use-mobile";
import { useInView } from "react-intersection-observer";
import { Controller, useForm } from "react-hook-form";
import { AnimeExplorationValidation } from "../../../validator/anime-exploration.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "../../../components/ui/field";
import { ChevronUp, Search } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button, buttonVariants } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import AnimeEmpty from "../../../components/anime-empty";
import AnimeUpdate from '../../../components/anime-update';

export default function SearchPage() {
  const isMobile = useIsMobile();
  const limit = isMobile ? 5 : 12;

  const form = useForm({
    resolver: zodResolver(AnimeExplorationValidation.GET_ANIME_LIST),
    mode: "onChange",
    defaultValues: {
      q: "",
    },
  });
  const [submittedQuery, setSubmittedQuery] = useState("");
  const canSearch = submittedQuery.length > 3;

  const {
    data,
    fetchNextPage,
    status,
    isFetchingNextPage,
    hasNextPage,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["anime", "search", { q: submittedQuery }],
    initialPageParam: {
      limit,
      offset: 0,
    },
    queryFn: async ({ pageParam }) => {
      const response = await animeExplorationService.getAnimeList({
        ...pageParam,
        q: submittedQuery,
        fields: "synopsis,genres,average_episode_duration,mean",
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.paging?.next) {
        return undefined;
      }

      const url = new URL(lastPage.paging.next);

      return {
        limit,
        offset: Number(url.searchParams.get("offset")),
      };
    },
    staleTime: Infinity,
    enabled: canSearch,
  });

  // !!! Unstable pagination on MyAnimeList anime search
  const animes = Array.from(
    new Map(
      (data?.pages.flatMap((page) => page.anime) ?? []).map((anime) => [
        anime.id,
        anime,
      ]),
    ).values(),
  );

  const { ref, inView } = useInView({
    rootMargin: "400px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <>
      <AppTitle
        title="Pencarian Anime"
        subtitle="Temukan informasi lengkap anime berdasarkan judul, termasuk sinopsis, genre, dan platform untuk menontonnya!"
      />

      <form
        onSubmit={form.handleSubmit((data) => setSubmittedQuery(data.q))}
        className="w-full"
      >
        <Controller
          name={"q"}
          control={form.control}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-3">
              <Field
                data-invalid={fieldState.invalid}
                orientation={"horizontal"}
              >
                <Input
                  className="bg-background"
                  disabled={
                    form.formState.isSubmitting ||
                    (status === "pending" && canSearch)
                  }
                  {...field}
                  id={"query"}
                  type={"search"}
                  placeholder={"Cari anime ..."}
                  aria-invalid={fieldState.invalid}
                />
                <Button
                  type="submit"
                  size={"icon"}
                  disabled={
                    form.formState.isSubmitting ||
                    (status === "pending" && canSearch)
                  }
                >
                  <Search />
                </Button>
              </Field>
              {fieldState.invalid && (
                <FieldDescription
                  className={fieldState.invalid ? "text-destructive" : ""}
                >
                  {fieldState.error?.message}
                </FieldDescription>
              )}
            </div>
          )}
        />
      </form>

      {canSearch ? (
        <div
          className={`w-full flex sm:flex-wrap flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:justify-center ${(animes.length < 1 && status === 'success') ? 'min-h-full' : ''}`}
        >
          {animes.map((anime) => (
            <ExplorationAnime anime={anime} key={anime.id} />
          ))}
          {animes.length < 1 && status === "success" && (
            <AnimeEmpty
              className="md:w-145"
              message="Anime tidak ditemukan, silakan gunakan kata kunci lainnya"
              action={
                <FieldLabel className={cn(buttonVariants())} htmlFor="query">
                  <ChevronUp /> Isi Kata Kunci
                </FieldLabel>
              }
              imageWithDiv={
                <div className="w-50 h-56 relative">
                  <Image
                    src={"/cocoa-shock.png"}
                    alt="Cocoa Hoto"
                    fill
                    className="object-contain"
                    sizes="620px"
                    loading="eager"
                  />
                </div>
              }
            />
          )}
          <div
            ref={ref}
            className="w-full flex sm:flex-wrap flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:justify-center"
          >
            {(status === "pending" || isFetchingNextPage) &&
              Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
                <SkeletonAnime key={i} />
              ))}
          </div>
        </div>
      ) : (
        <AnimeEmpty
          className="sm:w-150"
          message="Masukkan kata kunci di kolom pencarian untuk mendapatkan informasi anime"
          action={
            <FieldLabel className={cn(buttonVariants())} htmlFor="query">
              <ChevronUp /> Isi Kata Kunci
            </FieldLabel>
          }
          imageWithDiv={
            <div className="w-50 h-55 sm:h-63 relative">
              <Image
                src={"/cocoa-confused.png"}
                alt="Cocoa Hoto"
                fill
                className="object-contain"
                sizes="541px"
                loading="eager"
              />
            </div>
          }
        />
      )}

      <AnimeUpdate isOpen={isRefetching} />

      <div className="hidden sm:block fixed w-77 h-110 -left-10 -bottom-5 -z-1">
        <Image
          src={"/conan.png"}
          alt="Edogawa Conan"
          fill
          className="object-contain"
          sizes="424px"
          loading={"eager"}
        />
      </div>
      <div className="hidden sm:block fixed w-70 h-84 -right-20 -bottom-5 -z-1">
        <Image
          src={"/haibara.png"}
          alt="Haibara Ai"
          fill
          className="object-contain"
          sizes="560px"
          loading={"eager"}
        />
      </div>
    </>
  );
}
