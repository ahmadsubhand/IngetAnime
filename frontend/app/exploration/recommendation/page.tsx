"use client";

import Image from "next/image";
import AppTitle from "../../../components/app-title";
import { ExplorationAnime, SkeletonAnime } from "../anime";
import { useInfiniteQuery } from "@tanstack/react-query";
import animeExplorationService from "../../../services/anime-exploration.service";
import { useEffect } from "react";
import { useIsMobile } from "../../../hooks/use-mobile";
import { useInView } from "react-intersection-observer";
import { useAuth } from "../../../providers/auth-provider";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { Button } from "../../../components/ui/button";
import AnimeEmpty from '../../../components/anime-empty';
import AnimeUpdate from '../../../components/anime-update';

export default function RecommendationPage() {
  const isMobile = useIsMobile();
  const limit = isMobile ? 5 : 12;

  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!user?.isVerified) {
      router.push("/auth");
    }
  }, [user, router]);

  const {
    data,
    fetchNextPage,
    status,
    isFetchingNextPage,
    hasNextPage,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["anime", "suggestions"],
    initialPageParam: {
      limit,
      offset: 0,
    },
    queryFn: async ({ pageParam }) => {
      const response = await animeExplorationService.getSuggestedAnime({
        ...pageParam,
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
  });

  const animes = data?.pages.flatMap((page) => page.anime) ?? [];

  const { ref, inView } = useInView({
    rootMargin: "400px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <>
      <AppTitle
        title="Rekomendasi Anime"
        subtitle="Dapatkan rekomendasi anime sesuai selera dan mood kamu tanpa perlu bingung memilih!"
      />

      {user?.malId ? (
        <div className="w-full flex sm:flex-wrap flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:justify-center">
          {animes.map((anime) => (
            <ExplorationAnime anime={anime} key={anime.id} />
          ))}
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
          className='sm:w-155 md:w-186'
          message='Hubungkan akun dengan MyAnimeList untuk mendapatkan rekomendasi anime'
          action={
            <Button>
              <Settings /> Pengaturan
            </Button>
          }
          imageWithDiv={
            <div className="w-full h-51 sm:h-40 md:h-51 relative mt-0 sm:mt-10 md:mt-0">
              <Image
                src={"/yui.png"}
                alt="Yui Hirasawa"
                fill
                className="object-contain"
                sizes="1280px"
                loading="eager"
              />
            </div>
          }
        />
      )}

      <AnimeUpdate isOpen={isRefetching} />

      <div className="hidden sm:block fixed w-84 h-205 -left-12 -bottom-50 -z-1">
        <Image
          src={"/gojo.png"}
          alt="Gojo Satoru"
          fill
          className="object-contain"
          sizes="856px"
          loading={"eager"}
        />
      </div>
      <div className="hidden sm:block fixed w-132 h-188 -right-50 -bottom-40 -z-1">
        <Image
          src={"/ayanakoji.png"}
          alt="Ayanakoji Kiyotaka"
          fill
          className="object-contain"
          sizes="1400px"
          loading={"eager"}
        />
      </div>
    </>
  );
}
