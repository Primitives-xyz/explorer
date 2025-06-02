export interface Profile {
  username?: string
}

export const SPECIAL_USERNAMES = [
  'nehemiah',
  'nemoblackburn',
  'cedrick',
  'cedrick33',
  'johncenapt',
  'poloqweqwe',
  'marcusmth',
  'polo2',
  'polomain',
]

export type SpecialUsername = (typeof SPECIAL_USERNAMES)[number]

export function isSpecialUser(profile?: Profile | null): boolean {
  if (!profile?.username) return false
  return SPECIAL_USERNAMES.includes(profile.username as SpecialUsername)
}
