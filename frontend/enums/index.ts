export const Role = {
  admin: 'admin',
  user: 'user'
} as const

export type Role = (typeof Role)[keyof typeof Role]


export const ListStatus = {
  watching: 'watching',
  completed: 'completed',
  plan_to_watch: 'plan_to_watch',
  on_hold: 'on_hold',
  dropped: 'dropped'
} as const

export type ListStatus = (typeof ListStatus)[keyof typeof ListStatus]


export const AnimeStatus = {
  currently_airing: 'currently_airing',
  finished_airing: 'finished_airing',
  not_yet_aired: 'not_yet_aired'
} as const

export type AnimeStatus = (typeof AnimeStatus)[keyof typeof AnimeStatus]


export const AccessType = {
  limited_time: 'limited_time',
  subscription: 'subscription',
  free: 'free'
} as const

export type AccessType = (typeof AccessType)[keyof typeof AccessType]