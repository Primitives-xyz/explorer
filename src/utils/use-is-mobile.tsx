import useMedia from 'use-media'

export function useIsMobile() {
  const isMobile = useMedia({
    maxWidth: '1024px',
  })

  return {
    isMobile,
  }
}
