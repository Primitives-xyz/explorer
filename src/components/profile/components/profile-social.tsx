'use client'

import { TwitterFeed } from '@/components/profile/components/twitter-feed'
import { useTwitterOAuth } from '@/components/profile/hooks/use-twitter-o-auth'
import { IProfile } from '@/components/tapestry/models/profiles.models'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardVariant,
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
  profile: IProfile
}

export function ProfileSocial({ walletAddress, profile }: Props) {
  const { namespaces, hasXIdentity, explorerProfile, loading } =
    useGetProfileExternalNamespaces({ walletAddress })

  const { initiateTwitterLogin } = useTwitterOAuth()
  const { mainProfile } = useCurrentWallet()

  const isSameUsername =
    mainProfile?.username &&
    explorerProfile?.profile?.username &&
    mainProfile.username === explorerProfile.profile.username

  const showXTab = isSameUsername || hasXIdentity
  const xTabValue = hasXIdentity
    ? namespaces?.[0]?.namespace?.name
    : 'x-default-tab'

  const fallbackTab = namespaces?.[hasXIdentity ? 1 : 0]?.namespace?.name ?? ''

  const defaultTabValue = showXTab ? xTabValue : fallbackTab

  const xTabProfile = namespaces?.[0]?.profiles?.[0]

  const isPudgy = !!profile?.pudgy_profile_date

  return (
    <Card variant={isPudgy ? CardVariant.PUDGY : CardVariant.DEFAULT}>
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
                {showXTab && (
                  <TabsTrigger
                    key="x-tab"
                    variant={TabVariant.SOCIAL}
                    value={xTabValue}
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
                    </div>
                  </TabsTrigger>
                )}

                {namespaces
                  .filter((_, index) => !hasXIdentity || index > 0)
                  .map((identity) => (
                    <TabsTrigger
                      key={identity.namespace.name}
                      variant={TabVariant.SOCIAL}
                      value={identity.namespace.name}
                      className="flex-1 gap-1.5"
                    >
                      {!!identity.namespace.faviconURL && (
                        <div className="w-5 h-5 shrink-0">
                          <Image
                            src={identity.namespace.faviconURL}
                            alt="favicon"
                            width={16}
                            height={16}
                            className="w-full h-full"
                          />
                        </div>
                      )}
                      <span>{identity.namespace.readableName}</span>
                    </TabsTrigger>
                  ))}
              </TabsList>
            </div>

            {showXTab && (
              <TabsContent key={xTabValue} value={xTabValue}>
                {hasXIdentity ? (
                  <>
                    <ProfileExternalProfile profile={xTabProfile} />
                    {explorerProfile && <TwitterFeed profile={xTabProfile} />}
                  </>
                ) : (
                  isSameUsername && (
                    <Card>
                      <CardContent>
                        <p>
                          Connect your X to let others know what you're up to...
                        </p>
                        <br />
                        <Button
                          variant={ButtonVariant.OUTLINE_WHITE}
                          className="w-full"
                          onClick={() =>
                            initiateTwitterLogin(explorerProfile.profile.id)
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
            )}

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
