import { ProfileGrid } from '@/components/auth/ProfileGrid';

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-[#141414]">
      <ProfileGrid />
    </div>
  );
}
