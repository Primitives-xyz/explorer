export const share = ({
  title = 'Check this out!',
  url,
}: {
  title: string
  url: string
}) => {
  if (navigator.share) {
    navigator
      .share({
        title,
        url,
      })
      .catch(console.error)
  } else {
    console.log('Share not supported on this browser')
  }
}
