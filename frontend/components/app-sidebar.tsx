import {
  BookText,
  CalendarDays,
  ChevronDown,
  Compass,
  Lightbulb,
  LucideIcon,
  Trophy,
} from 'lucide-react';
import AppLogo from './app-logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from './ui/sidebar';
import Link from 'next/link';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { Separator } from './ui/separator';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu';
import AppProfile from './app-profile';
import { ReactNode } from 'react';

export function AppSidebar({ animeSearch }: { animeSearch: ReactNode }) {
  type MenuItem = {
    title: string;
    href?: string;
    icon: LucideIcon;
    children?: MenuItem[];
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Timeline',
      href: '/anime/timeline',
      icon: CalendarDays,
    },
    {
      title: 'Eksplorasi',
      icon: Compass,
      children: [
        {
          title: 'Terbaik',
          href: '/anime/exploration/best',
          icon: Trophy,
        },
        {
          title: 'Musiman',
          href: '/anime/exploration/seasonal',
          icon: CalendarDays,
        },
        {
          title: 'Rekomendasi',
          href: '/anime/exploration/recommendation',
          icon: Lightbulb,
        },
      ],
    },
    {
      title: 'List',
      href: '/anime/list',
      icon: BookText,
    },
  ];

  return (
    <>
      {/* Mobile */}
      <Sidebar>
        <SidebarHeader className="p-4">
          <AppLogo />
          {animeSearch}
        </SidebarHeader>

        <Separator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;

                if (item.children) {
                  return (
                    <Collapsible key={item.title} className="group/collapsible">
                      <SidebarMenuItem>
                        <SidebarMenuButton render={<CollapsibleTrigger />}>
                          <Icon />
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto transition-transform group-data-open/collapsible:rotate-180" />
                        </SidebarMenuButton>

                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;

                              return (
                                <SidebarMenuSubItem key={child.title}>
                                  <SidebarMenuSubButton
                                    render={<Link href={child.href ?? '#'} />}
                                  >
                                    <ChildIcon />
                                    <span>{child.title}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.href ?? '#'} />}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <Separator />

        <SidebarFooter className="p-4">
          <AppProfile size="lg" />
        </SidebarFooter>
      </Sidebar>

      {/* Dekstop */}
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          {menuItems.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              return (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuTrigger className="flex items-center gap-1.5 [&_svg:not([class*='size-'])]:size-4">
                    <Icon />
                    {item.title}
                  </NavigationMenuTrigger>

                  <NavigationMenuContent>
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;

                      return (
                        <NavigationMenuLink
                          key={child.title}
                          render={<Link href={child.href ?? '#'} />}
                        >
                          <ChildIcon />
                          {child.title}
                        </NavigationMenuLink>
                      );
                    })}
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            }

            return (
              <NavigationMenuItem key={item.title}>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  render={<Link href={item.href ?? '#'} />}
                >
                  <Icon />
                  {item.title}
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
}
