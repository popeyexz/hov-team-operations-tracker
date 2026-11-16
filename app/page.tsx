import { ProfileGrid } from '@/components/auth/ProfileGrid';

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <ProfileGrid />
    </div>
  );
}
