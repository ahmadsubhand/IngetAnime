"use client";

import {
  ChevronDown,
  LucideIcon,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { ReactNode } from "react";

export function FilterMenu({ children }: { children: ReactNode }) {
  return (
    <div className="fixed bottom-5 left-5 z-10">
      <Popover>
        <PopoverTrigger
          render={
            <Button size={"icon"}>
              <SlidersHorizontal />
            </Button>
          }
        />
        <PopoverContent align="start" className={"px-3 py-0 gap-0"}>
          {children}

          {/* <FilterMenuItem>
            <FilterMenuHeader icon={Key} label='Tipe Akses' />
            <FilterMenuContent>
              <FieldGroup className='py-1 gap-1'>
                {[
                  { id: "free", label: "Tersedia gratis", icon: Gift },
                  { id: "limited_time", label: "Waktu terbatas", icon: Hourglass },
                  { id: "subscription", label: "Wajib berlangganan", icon: DollarSign },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <Field orientation={"horizontal"} key={option.id}>
                      <Checkbox id={option.id} defaultChecked />
                      <FieldLabel htmlFor={option.id} className='text-xs'>
                        <Icon size={15}/>
                        {option.label}
                      </FieldLabel>
                    </Field>
                  )
                })}
              </FieldGroup>
            </FilterMenuContent>
          </FilterMenuItem>

          <FilterMenuItem>
            <FilterMenuHeader icon={BookText} label='List Saya' />
            <FilterMenuContent>
              <FieldGroup className='py-1 gap-1'>
                {[
                  { id: "watching", label: "Berjalan", icon: CalendarRange },
                  { id: "completed", label: "Selesai", icon: CalendarCheck },
                  { id: "on_hold", label: "Ditunda", icon: CalendarSync },
                  { id: "dropped", label: "Ditinggalkan", icon: CalendarX },
                  { id: "plan_to_watch", label: "Direncanakan", icon: CalendarClock },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <Field orientation={"horizontal"} key={option.id}>
                      <Checkbox id={option.id} defaultChecked />
                      <FieldLabel htmlFor={option.id} className='text-xs'>
                        <Icon size={15} />
                        {option.label}
                      </FieldLabel>
                    </Field>
                  )
                })}
              </FieldGroup>
            </FilterMenuContent>
          </FilterMenuItem>

          <FilterMenuItem>
            <FilterMenuHeader icon={TvMinimalPlay} label='Platform' />
            <FilterMenuContent>
              <FieldGroup className='pt-1 pb-3 gap-1'>
                {[
                  { id: 1, name: "Bstation", src: '/platform.png' },
                  { id: 2, name: "Bstation", src: '/platform.png' },
                  { id: 3, name: "Bstation", src: '/platform.png' },
                ].map((option) => (
                  <Field orientation={"horizontal"} key={option.id}>
                    <Checkbox id={option.id.toString()} defaultChecked />
                    <FieldLabel htmlFor={option.id.toString()} className='text-xs'>
                      <div className='h-4 w-4 relative'>
                        <Image src={option.src} alt='Gambar platform contoh' sizes="16px" className='object-contain' fill />
                      </div>
                      {option.name}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </FilterMenuContent>
          </FilterMenuItem> */}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function FilterMenuItem({ children }: { children: ReactNode }) {
  return <Collapsible className="group/collapsible">{children}</Collapsible>;
}

export function FilterMenuHeader({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <CollapsibleTrigger
      className={"w-full flex gap-2 items-center py-2 text-sm"}
    >
      <Icon size={16} />
      <span>{label}</span>
      <ChevronDown
        className="ml-auto transition-transform group-data-open/collapsible:rotate-180"
        size={16}
      />
    </CollapsibleTrigger>
  );
}

export function FilterMenuContent({ children }: { children: ReactNode }) {
  return <CollapsibleContent>{children}</CollapsibleContent>;
}
