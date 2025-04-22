'use client'
import { useGetIdentities } from '@/components/tapestry/hooks/use-get-identities'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabVariant,
} from '@/components/ui'
import { Button, ButtonVariant } from '@/components/ui/button'
import { EXPLORER_NAMESPACE, TWITTER_REDIRECT_URL } from '@/utils/constants'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { ProfileExternalProfile } from './profile-external-profile'

interface Props {
  walletAddress: string
}

export function ProfileSocial({ walletAddress }: Props) {
  const { mainProfile } = useCurrentWallet()
  const router = useRouter()

  const { identities: originalIdentities, loading } = useGetIdentities({
    walletAddress,
  })

  // const { identities, hasXIdentity, explorerProfile } =
  //   useProcessedIdentities(originalIdentities)

  const { identities, hasXIdentity, explorerProfile } = useMemo(() => {
    if (!originalIdentities) {
      return { identities: undefined, hasXIdentity: false }
    }

    // Check if there's an identity with namespace.name === 'x'
    const xIdentityIndex = originalIdentities.findIndex(
      (identity) => identity.namespace.name === 'x'
    )

    const explorerIdentityIndex = originalIdentities.findIndex(
      (identity) => identity.namespace.name === EXPLORER_NAMESPACE
    )

    const hasXIdentity = xIdentityIndex !== -1
    const explorerProfile =
      explorerIdentityIndex !== -1
        ? originalIdentities[explorerIdentityIndex]
        : null

    // If there's no X identity, return the original array
    if (!hasXIdentity) {
      return {
        identities: originalIdentities,
        hasXIdentity,
        explorerProfile: explorerProfile,
      }
    }

    // Create a new array with the X identity first, followed by the rest
    const xIdentity = originalIdentities[xIdentityIndex]
    const otherIdentities = originalIdentities.filter(
      (_, index) => index !== xIdentityIndex
    )

    return {
      identities: [xIdentity, ...otherIdentities],
      hasXIdentity,
      explorerProfile: explorerProfile,
    }
  }, [originalIdentities])

  const defaultTabValue =
    hasXIdentity && identities?.[0]?.namespace
      ? identities?.[0]?.namespace?.name + identities?.[0]?.profile?.id
      : 'x-default-tab'

  //const { initiateTwitterLogin } = useTwitterOAuth()

  const handleTwitterLogin = async () => {
    try {
      // Generate a random state value for security
      const state = Math.random().toString(36).substring(2, 15)

      if (!explorerProfile?.profile) {
        throw new Error(
          'Explorer profile not found! You must create an explorer profile before adding a twitter profile'
        )
      }

      // Store state in localStorage for verification after redirect
      localStorage.setItem('twitter_oauth_state', state)
      localStorage.setItem('profileId', explorerProfile.profile.id)
      // Construct the Twitter OAuth URL
      const authUrl = new URL('https://twitter.com/i/oauth2/authorize')
      // Set required OAuth parameters
      authUrl.searchParams.append('response_type', 'code')
      authUrl.searchParams.append(
        'client_id',
        'WVBrRlBhVHQxNWEwNUpwb1loUUI6MTpjaQ'
      )
      authUrl.searchParams.append(
        'redirect_uri',
        `${window.location.origin}${TWITTER_REDIRECT_URL}`
      )
      authUrl.searchParams.append(
        'scope',
        'tweet.read users.read offline.access'
      )
      authUrl.searchParams.append('state', state)
      authUrl.searchParams.append('code_challenge', 'challenge') // Should generate a proper PKCE challenge
      authUrl.searchParams.append('code_challenge_method', 'plain')

      // Redirect to Twitter authorization page
      router.push(authUrl.toString())
    } catch (error) {
      console.error('Twitter login error:', error)
      // if (onError) onError(error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="h-20 flex items-center justify-center">
            <Spinner />
          </div>
        )}

        {!loading && !!identities?.length && (
          <Tabs defaultValue={defaultTabValue}>
            <div className="overflow-auto w-full">
              <TabsList>
                <TabsTrigger
                  key="x-tab"
                  variant={TabVariant.SOCIAL}
                  value={
                    hasXIdentity
                      ? identities[0].namespace.name + identities[0].profile.id
                      : 'x-default-tab'
                  }
                  className="flex-1 gap-1.5"
                >
                  <Image
                    src={
                      hasXIdentity
                        ? identities[0]?.namespace?.faviconURL
                        : '/images/x.png'
                    }
                    alt="x logo"
                    width={22}
                    height={22}
                    className="w-full h-full object-contain"
                  />

                  <span>
                    {hasXIdentity ? identities[0].namespace.readableName : 'X'}
                  </span>
                </TabsTrigger>

                {identities
                  .filter((_, index) => !hasXIdentity || index > 0)
                  .map((identity) => (
                    <TabsTrigger
                      key={identity.namespace.name + identity.profile.id}
                      variant={TabVariant.SOCIAL}
                      value={identity.namespace.name + identity.profile.id}
                      className="flex-1 gap-1.5"
                    >
                      <div className="w-5 h-5 shrink-0">
                        <Image
                          src={identity.namespace.faviconURL}
                          alt="favicon"
                          width={16}
                          height={16}
                          className="w-full h-full"
                        />
                      </div>{' '}
                      <span>{identity.namespace.readableName}</span>
                    </TabsTrigger>
                  ))}
              </TabsList>
            </div>

            <TabsContent
              key={
                hasXIdentity
                  ? identities[0].namespace.name + identities[0].profile.id
                  : 'x-default-tab'
              }
              value={
                hasXIdentity
                  ? identities[0].namespace.name + identities[0].profile.id
                  : 'x-default-tab'
              }
            >
              {hasXIdentity ? (
                <ProfileExternalProfile identity={identities[0]} />
              ) : (
                mainProfile?.username === explorerProfile?.profile.username && (
                  <Card>
                    <CardContent>
                      <h3>Oops! No linked X</h3>
                      <br />
                      <p>Connect your X to let others know what you're up to</p>
                      <br />
                      <Button
                        variant={ButtonVariant.OUTLINE_WHITE}
                        className="w-full"
                        onClick={async () => await handleTwitterLogin()}
                      >
                        Connect
                        <div>
                          <Image
                            src="/images/x.png"
                            alt="x"
                            width={16}
                            height={16}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                )
              )}
            </TabsContent>

            {identities
              .filter((_, index) => !hasXIdentity || index > 0)
              .map((identity) => (
                <TabsContent
                  key={identity.namespace.name + identity.profile.id}
                  value={identity.namespace.name + identity.profile.id}
                >
                  <ProfileExternalProfile identity={identity} />
                </TabsContent>
              ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
