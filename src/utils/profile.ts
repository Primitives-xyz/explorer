/**
 * Gets the profile image URL for a given username
 */
export async function getProfileImage(
  username: string,
): Promise<string | null> {
  try {
    const response = await fetch(`/api/profiles/${username}`)
    const data = await response.json()
    return data.image || null
  } catch (error) {
    console.error('Error fetching profile image:', error)
    return null
  }
}
