import useMedia from 'use-media'

export function useIsMobile() {
  const isMobile = useMedia({
    maxWidth: '768px',
  })

  return {
    isMobile,
  }
}
