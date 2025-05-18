import { redirect } from 'next/navigation';

export default function FollowUsernamePage({ params }: { params: { username: string } }) {
  redirect(`/${params.username}`);
  return null;
} 