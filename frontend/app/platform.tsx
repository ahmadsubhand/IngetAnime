import { ExplorationAnime } from '@/app/anime/exploration/anime';
import { dailyTimelineDummy, PlatformList } from '@/app/list';
import HomeSection from '@/app/section';
import { Card } from '@/components/ui/card';
import { AnimePlatform } from '@/types/anime-platform.model';
import { Anime } from '@/types/anime.model';
import { MalAnime } from '@/types/my-anime-list.model';
import { Check, DollarSign, Gift, Hourglass, Key } from 'lucide-react';
import Image from 'next/image';

const animeDummyWithMalInfo: MalAnime &
  Anime & { animePlatforms: AnimePlatform[] } = {
  ...dailyTimelineDummy.timelines[0].anime[0],
  main_picture: {
    large: '',
    medium: '',
  },
  mean: 8.21,
  synopsis:
    "Class 3-Z of Gintama High School—led by teacher Ginpachi Sakata—is known for its eccentric students who have a difficult time with their studies. Moreover, Ginpachi and his students often run into trouble with the school's demanding principal and the class' feared delinquents, who have returned from a suspension. Despite all the chaos and Ginpachi's idle attitude toward teaching, his students still dearly respect him. Although constantly derailed from their studies, Ginpachi and his zany class always find a way to keep their school days entertaining. [Written by MAL Rewrite",
  average_episode_duration: 1440,
  genres: [
    { id: 4, name: 'Comedy' },
    { id: 57, name: 'Gag Humor' },
    { id: 20, name: 'Parody' },
    { id: 23, name: 'School' },
    { id: 27, name: 'Shounen' },
  ],
};
export default function PlatformHome() {
  return (
    <HomeSection
      id="platform-section"
      className="flex flex-col md:flex-row justify-center items-center gap-10 md:gap-20"
    >
      <div className="flex md:hidden xl:flex flex-col justify-center items-center md:items-start gap-15">
        <Card className="px-5 py-2 w-fit gap-0">
          <div className="py-2 flex items-center gap-2 w-60">
            <Key /> Tipe Akses
          </div>
          <ul className="flex flex-col py-2 gap-1">
            {[
              { icon: Gift, label: 'Tersedia gratis' },
              { icon: Hourglass, label: 'Waktu terbatas' },
              { icon: DollarSign, label: 'Wajib berlangganan' },
            ].map((item, index) => (
              <li className="flex items-center gap-3" key={index}>
                <div className="bg-primary rounded-xs overflow-hidden p-px">
                  <Check
                    className="bg-primary text-primary-foreground"
                    size={12}
                  />
                </div>
                <item.icon />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </Card>

        <p className="text-center md:text-left text-base md:text-2xl max-w-90">
          Cari tahu apa saja anime yang tersedia gratis atau hanya tersedia di
          platform berlangganan!
        </p>
      </div>

      <div className="flex flex-col gap-10 justify-between items-center xl:items-end self-stretch w-full xl:w-fit">
        <div className="flex gap-10">
          <div inert className="hidden md:block pointer-events-none">
            <ExplorationAnime anime={animeDummyWithMalInfo} isDisplay />
          </div>

          <div className="flex flex-col gap-10 items-center">
            <Card className="hidden md:flex px-2 py-2 max-w-58">
              <p className="text-sm xl:text-base text-center">
                Atur strategi langganan dengan mudah, hemat waktu, hemat biaya,
                dan tetap bisa menikmati semua anime favoritmu!
              </p>
            </Card>
            <div className="relative w-29 h-38 shrink-0">
              <Image
                src={'/chibi-gojo.png'}
                alt="Gojo Satoru"
                fill
                className="object-contain"
                sizes="1200px"
                loading={'eager'}
              />
            </div>
          </div>
        </div>

        <div className="md:scale-150 md:-translate-y-1/4 xl:-translate-x-1/4">
          <PlatformList />
        </div>
      </div>
    </HomeSection>
  );
}
