'use client'

import { useTwitterOAuth } from '@/components/profile/hooks/use-twitter-o-auth'
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
import { useGetProfileExternalNamespaces } from '../hooks/use-get-profile-external-namespace'
import { ProfileExternalProfile } from './profile-external-profile'

interface Props {
  walletAddress: string
}

export function ProfileSocial({ walletAddress }: Props) {
  const { namespaces, hasXIdentity, explorerProfile, loading } =
    useGetProfileExternalNamespaces({
      walletAddress,
    })
  const { initiateTwitterLogin } = useTwitterOAuth()
  const { mainProfile } = useCurrentWallet()

  const defaultTabValue =
    hasXIdentity && namespaces?.[0]?.namespace
      ? namespaces?.[0]?.namespace?.name
      : 'x-default-tab'

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

        {!!namespaces?.length && (
          <Tabs defaultValue={defaultTabValue}>
            <div className="overflow-auto w-full">
              <TabsList>
                <TabsTrigger
                  key="x-tab"
                  variant={TabVariant.SOCIAL}
                  value={
                    hasXIdentity
                      ? namespaces[0].namespace.name
                      : 'x-default-tab'
                  }
                  className="flex-1 gap-1.5"
                >
                  <div className="w-5 h-5 shrink-0">
                    <Image
                      src={
                        hasXIdentity
                          ? namespaces[0]?.namespace?.faviconURL
                          : '/images/x.png'
                      }
                      alt="x logo"
                      width={16}
                      height={16}
                      className="w-full h-full"
                    />
                  </div>{' '}
                  {/* <span>
                    {hasXIdentity ? namespaces[0].namespace.readableName : ''}
                  </span> */}
                </TabsTrigger>

                {namespaces
                  .filter((_, index) => !hasXIdentity || index > 0)
                  .map((identity) => (
                    <TabsTrigger
                      key={identity.namespace.name}
                      variant={TabVariant.SOCIAL}
                      value={identity.namespace.name}
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
                hasXIdentity ? namespaces[0].namespace.name : 'x-default-tab'
              }
              value={
                hasXIdentity ? namespaces[0].namespace.name : 'x-default-tab'
              }
            >
              {hasXIdentity ? (
                <ProfileExternalProfile
                  profile={namespaces[0]?.profiles?.[0]}
                />
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

            {namespaces
              .filter((_, index) => !hasXIdentity || index > 0)
              .map((identity) => (
                <TabsContent
                  key={identity.namespace.name}
                  value={identity.namespace.name}
                  className="space-y-4"
                >
                  {identity.profiles.map((profile) => (
                    <ProfileExternalProfile
                      key={profile.profile.id}
                      profile={profile}
                    />
                  ))}
                </TabsContent>
              ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
