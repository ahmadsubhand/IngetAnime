import AppFooter from '@/components/app-footer';
import HeroHome from '@/app/hero';
import TimelineHome from '@/app/timeline';
import PlatformHome from '@/app/platform';
import { IntegrationHome } from '@/app/integration';
import AppHeader from '@/components/app-header';

export default function HomePage() {
  return (
    <div className='w-full h-full'>
      <AppHeader className='fixed top-0 left-0 w-full'/>

      <HeroHome />
      <TimelineHome />
      <PlatformHome />
      <IntegrationHome />

      <AppFooter />
    </div>
  );
}
