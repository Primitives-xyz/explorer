'use client'
import { useMemo } from 'react';
import { useGetIdentities } from '@/components/tapestry/hooks/use-get-identities'
import { Button, ButtonVariant } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { TWITTER_REDIRECT_URL } from '@/utils/constants'

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
import Image from 'next/image'
import { ProfileExternalProfile } from './profile-external-profile'
import { EXPLORER_NAMESPACE } from '@/utils/constants';

interface Props {
  walletAddress: string
}

export function ProfileSocial({ walletAddress }: Props) {
  const router = useRouter();

  const { identities: originalIdentities, loading } = useGetIdentities({
    walletAddress,
  });

  const { identities, hasXIdentity, explorerProfile } = useMemo(() => {
    if (!originalIdentities) {
      return { identities: undefined, hasXIdentity: false };
    }
  
    // Check if there's an identity with namespace.name === 'x'
    const xIdentityIndex = originalIdentities.findIndex(
      (identity) => identity.namespace.name === 'x'
    );

    const explorerIdentityIndex = originalIdentities.findIndex(
      (identity) => identity.namespace.name === EXPLORER_NAMESPACE
    );
    
    const hasXIdentity = xIdentityIndex !== -1;
    const explorerProfile = explorerIdentityIndex !== -1 ? originalIdentities[explorerIdentityIndex] : null
    
    // If there's no X identity, return the original array
    if (!hasXIdentity) {
      return { 
        identities: originalIdentities,
        hasXIdentity,
        explorerProfile: explorerProfile,
      };
    }
    
    // Create a new array with the X identity first, followed by the rest
    const xIdentity = originalIdentities[xIdentityIndex];
    const otherIdentities = originalIdentities.filter((_, index) => index !== xIdentityIndex);
    
    return {
      identities: [xIdentity, ...otherIdentities],
      hasXIdentity,
      explorerProfile: explorerProfile,
    };
  }, [originalIdentities]);

// Define a default value for the tabs
const defaultTabValue = hasXIdentity &&  identities?.[0]?.namespace
  ? identities?.[0]?.namespace?.name + identities?.[0]?.profile?.id
  : "x-default-tab"; // Special ID for our X tab when no X identity exists


const handleTwitterLogin = async () => {
  try {
    // Generate a random state value for security
    const state = Math.random().toString(36).substring(2, 15);

    if(!explorerProfile?.profile) {
      throw new Error('Explorer profile not found! You must create an explorer profile before adding a twitter profile'); 
    }

    // Store state in localStorage for verification after redirect
    localStorage.setItem('twitter_oauth_state', state);
    localStorage.setItem('profileId', explorerProfile.profile.id);
    // Construct the Twitter OAuth URL
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    // Set required OAuth parameters
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', 'WVBrRlBhVHQxNWEwNUpwb1loUUI6MTpjaQ');
    authUrl.searchParams.append('redirect_uri', `${window.location.origin}${TWITTER_REDIRECT_URL}`);
    authUrl.searchParams.append('scope', 'tweet.read users.read offline.access');
    console.log("🚀 ~ handleTwitterLogin ~ `${window.location.origin}${TWITTER_REDIRECT_URL}`:", `${window.location.origin}${TWITTER_REDIRECT_URL}`)
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge', 'challenge'); // Should generate a proper PKCE challenge
    authUrl.searchParams.append('code_challenge_method', 'plain');
    
    // Redirect to Twitter authorization page
    router.push(authUrl.toString());
  } catch (error) {
    console.error('Twitter login error:', error);
    // if (onError) onError(error);
  }
};

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
              {/* Always include the X tab first */}
              <TabsTrigger
                key="x-tab"
                variant={TabVariant.SOCIAL}
                value={hasXIdentity 
                  ? identities[0].namespace.name + identities[0].profile.id
                  : "x-default-tab"}
                className="flex-1 gap-1.5"
              >
                <div className="w-5 h-5 shrink-0">
                  <Image
                    src={hasXIdentity 
                      ? identities[0].namespace.faviconURL
                      : "/x-logo.png"} // You'll need an X logo image for the default case
                    alt=""
                    width={16}
                    height={16}
                    className="w-full h-full"
                  />
                </div>{' '}
                <span>{hasXIdentity 
                  ? identities[0].namespace.readableName
                  : "X"}
                </span>
              </TabsTrigger>
              
              {/* Show the rest of the tabs (excluding X if it exists since we already added it) */}
              {identities
                .filter((identity, index) => !hasXIdentity || index > 0)
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
                        alt=""
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
          
          {/* Always add the X tab content */}
          <TabsContent
            key={hasXIdentity 
              ? identities[0].namespace.name + identities[0].profile.id
              : "x-default-tab"}
            value={hasXIdentity 
              ? identities[0].namespace.name + identities[0].profile.id
              : "x-default-tab"}
          >
            {hasXIdentity 
              ? <ProfileExternalProfile identity={identities[0]} />
              : <div style={{"padding": "40px"}} className="rounded-card border text-card-foreground shadow-card overflow-hidden backdrop-blur-xl bg-secondary/10 border-foreground/20">
                <h3>Oops! No linked X</h3>
                <br/>
                <p>Connect your X to let others know what you're up to</p>
                <br/>
                <Button
                  variant={ButtonVariant.OUTLINE_WHITE}
                  className="w-full"
                  onClick={async () => await handleTwitterLogin()}>
                  Connect <svg  width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.6419 11.2186L20.9272 2.75H19.2009L12.875 10.1032L7.82253 2.75H1.99512L9.63542 13.8693L1.99512 22.75H3.72161L10.4019 14.9848L15.7377 22.75H21.5651L13.6415 11.2186H13.6419ZM11.2772 13.9673L10.5031 12.8601L4.34369 4.04968H6.99548L11.9662 11.1599L12.7403 12.2672L19.2017 21.5094H16.5499L11.2772 13.9677V13.9673Z" fill="#F5F8FD"/>
                  </svg>
                </Button>
                </div>}
          </TabsContent>
          
          {/* Add content for the rest of the tabs */}
          {identities
            .filter((identity, index) => !hasXIdentity || index > 0)
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
);
}
