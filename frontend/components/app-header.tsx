import { Search } from 'lucide-react';
import AppInput from './app-input';
import AppLogo from './app-logo';
import AppNavigation from './app-navigation';
import { Button } from './ui/button';
import AppButton from './app-button';

export default function AppHeader() {
  return (
    <header className='flex px-16 py-3 justify-between items-center'>
      <AppLogo />
      <div className="w-80">
        <AppInput size='sm' rightIcon={<Search />} placeholder='Cari anime ...' />
      </div>
      <AppNavigation />
      <AppButton />
    </header>
  )
}