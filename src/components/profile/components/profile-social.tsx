'use client'
import { useProcessedIdentities } from '@/components/profile/hooks/use-processed-identities'
import { useTwitterOAuth } from '@/components/profile/hooks/use-twitter-o-auth'
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
import { useCurrentWallet } from '@/utils/use-current-wallet'
import Image from 'next/image'
import { ProfileExternalProfile } from './profile-external-profile'

interface Props {
  walletAddress: string
}

export function ProfileSocial({ walletAddress }: Props) {
  const { mainProfile } = useCurrentWallet()

  const { identities: originalIdentities, loading } = useGetIdentities({
    walletAddress,
  })

  const { identities, hasXIdentity, explorerProfile } =
    useProcessedIdentities(originalIdentities)

  const defaultTabValue =
    hasXIdentity && identities?.[0]?.namespace
      ? identities?.[0]?.namespace?.name + identities?.[0]?.profile?.id
      : 'x-default-tab'

  const { initiateTwitterLogin } = useTwitterOAuth()

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
                        onClick={() =>
                          initiateTwitterLogin(explorerProfile?.profile?.id)
                        }
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
