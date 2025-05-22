export interface Profile {
  username?: string
}

export const SPECIAL_USERNAMES = [
  'nehemiah',
  'nemoblackburn',
  'cedrick',
  'cedrick33',
] as const

export type SpecialUsername = (typeof SPECIAL_USERNAMES)[number]

export function isSpecialUser(profile?: Profile | null): boolean {
  if (!profile?.username) return false
  return SPECIAL_USERNAMES.includes(profile.username as SpecialUsername)
}

export function isSpecialUsername(username?: string): boolean {
  if (!username) return false
  return SPECIAL_USERNAMES.includes(username as SpecialUsername)
}

export function isLoggedInSpecialUser(
  isLoggedIn: boolean,
  profile?: Profile | null
): boolean {
  return isLoggedIn && isSpecialUser(profile)
}
