"use client"

import Link from 'next/link';
import { cn } from '../lib/utils';
import { Button, buttonVariants } from './ui/button';
import { LogIn, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../providers/auth-provider';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Spinner } from './ui/spinner';

export default function AppProfile({ size }: { size: 'sm' | 'lg' }) {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  return isAuthenticated ? (
    <div className='flex justify-between items-center'>
      <div className="flex flex-col gap-2 md:hidden items-start">
        {user?.username}
        <div className="flex gap-2">
          <Link href={'/user/settings'} className={cn(buttonVariants({ variant: 'default', size: 'icon' }))}>
            <Settings />
          </Link>
          <Button size={'icon'} onClick={logout}>
            <LogOut />
          </Button>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full"><Avatar size={size}>
            <AvatarImage 
              src={user?.picture ?? undefined}
              alt='user profile'
            />
            <AvatarFallback>LR</AvatarFallback>
          </Avatar></Button>
        } />
        <DropdownMenuContent align='end'>
          <DropdownMenuItem render={<Link href={'/user/settings'}/>}>
            <Settings /> Pengaturan 
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>
            <LogOut /> Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : isLoading ? (
    <Button size={'icon'} disabled variant={'outline'}><Spinner /></Button>
  ) : (
    <Link href={`/auth`} className={cn(buttonVariants({ variant: 'default', size: 'default' }))}>
      <LogIn data-icon="inline-start" />
      Masuk
    </Link>
  )
}