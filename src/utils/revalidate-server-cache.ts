'use server'

import { revalidatePath } from 'next/cache'

export const revalidateServerCache = async (
  path: string,
  type?: 'layout' | 'page'
) => {
  revalidatePath(path, type)
}
