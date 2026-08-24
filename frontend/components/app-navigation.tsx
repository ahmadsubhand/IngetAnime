import { BookText, CalendarDays, Compass, Lightbulb, LucideIcon, Trophy } from 'lucide-react'
import React from 'react'

export default function AppNavigation() {
  return (
    <nav>
    <ul className='h-12 flex gap-3 items-center'>
      <NavigationWrap>
        <Navigation label='Timeline' hasChild={false} icon={CalendarDays} />
      </NavigationWrap>
      <NavigationWrap>
        <Navigation label='Ekplorasi' hasChild={true} icon={Compass}>
          <NavigationChild label='Terbaik' icon={Trophy} />
          <NavigationChild label='Musiman' icon={CalendarDays} />
          <NavigationChild label='Rekomendasi' icon={Lightbulb} />
        </Navigation>
      </NavigationWrap>
      <NavigationWrap>
        <Navigation label='List' hasChild={false} icon={BookText} />
      </NavigationWrap>
    </ul>

    </nav>
  )
}

function NavigationWrap({ children }: { children: React.ReactNode }) {
  return (
    <li className='h-9'>
      {children}
    </li>
  )
}

type NavigationProps =
  | {
      label: string
      icon: LucideIcon
      hasChild: true
      children: React.ReactNode
    }
  | {
      label: string
      icon: LucideIcon
      hasChild: false
      children?: never
    }

function Navigation({
  label, icon: Icon, hasChild, children
}: NavigationProps) {
  return hasChild ? (
      <div className='flex flex-col gap-3 items-center group relative'>
        <div className='text-base flex gap-2 py-2 px-2 justify-center items-center group-hover:text-emerald-500 border-b border-transparent group-hover:border-b group-hover:border-emerald-500'>
          <Icon width={20} height={20} />
          {label}
        </div>
        <ul className='group-hover:flex flex-col gap-2 items-center hidden'>
          {children}
        </ul>
      </div>
     ) : (
      <a className='text-base flex gap-2 py-2 px-2 justify-center items-center hover:text-emerald-500 border-b border-transparent hover:border-b hover:border-emerald-500'>
        <Icon width={20} height={20} />
        {label}
      </a>
     )
}

function NavigationChild({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <li>
      <a className='text-sm flex gap-2 py-1 px-2 justify-center items-center hover:text-emerald-500 border-b border-transparent hover:border-b hover:border-emerald-500'>
        <Icon width={16} height={16} /> 
        {label}
      </a>
    </li>
  )
}