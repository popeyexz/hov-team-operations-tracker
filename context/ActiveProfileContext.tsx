'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { InAppNotification, Profile } from '@/lib/types';
import { getProfiles } from '@/app/actions/profile-actions';
import { createClient } from '@/lib/supabase/client';

interface ActiveProfileContextType {
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile | null) => void;
  impersonatedMember: Profile | null;
  setImpersonatedMember: (profile: Profile | null) => void;
  effectiveProfile: Profile | null;
  profiles: Profile[];
  refreshProfiles: () => Promise<void>;
  isLoading: boolean;
  notifications: InAppNotification[];
  unreadCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  isEmailModalOpen: boolean;
  setIsEmailModalOpen: (open: boolean) => void;
  isAddMemberModalOpen: boolean;
  setIsAddMemberModalOpen: (open: boolean) => void;
}

const ActiveProfileContext = createContext<ActiveProfileContextType | undefined>(undefined);

export function ActiveProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);
  const [impersonatedMember, setImpersonatedMember] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load profiles on mount
  const refreshProfiles = async () => {
    try {
      const list = await getProfiles();
      setProfiles(list);
      // Restore cached profile
      const storedSlug = typeof window !== 'undefined' ? localStorage.getItem('hov_active_slug') : null;
      if (storedSlug) {
        const found = list.find((p) => p.slug === storedSlug);
        if (found) {
          setActiveProfileState(found);
        }
      }
    } catch (e) {
      console.error('Failed to load profiles:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfiles();
  }, []);

  const setActiveProfile = (profile: Profile | null) => {
    setActiveProfileState(profile);
    setImpersonatedMember(null);
    if (typeof window !== 'undefined') {
      if (profile) {
        localStorage.setItem('hov_active_slug', profile.slug);
        document.cookie = `hov_active_slug=${profile.slug}; path=/; max-age=2592000; SameSite=Lax`;
      } else {
        localStorage.removeItem('hov_active_slug');
        document.cookie = 'hov_active_slug=; path=/; max-age=0; SameSite=Lax';
      }
    }
  };

  const effectiveProfile = impersonatedMember || activeProfile;

  // Fetch in-app notifications whenever active profile changes
  useEffect(() => {
    if (!activeProfile) {
      setNotifications([]);
      return;
    }

    const fetchNotifs = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('in_app_notifications')
          .select('*, actor:actor_id(*)')
          .eq('recipient_id', activeProfile.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          setNotifications(data as InAppNotification[]);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [activeProfile?.id]);

  const markNotificationRead = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from('in_app_notifications').update({ is_read: true }).eq('id', id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <ActiveProfileContext.Provider
      value={{
        activeProfile,
        setActiveProfile,
        impersonatedMember,
        setImpersonatedMember,
        effectiveProfile,
        profiles,
        refreshProfiles,
        isLoading,
        notifications,
        unreadCount,
        markNotificationRead,
        isEmailModalOpen,
        setIsEmailModalOpen,
        isAddMemberModalOpen,
        setIsAddMemberModalOpen,
      }}
    >
      {children}
    </ActiveProfileContext.Provider>
  );
}

export function useActiveProfile() {
  const context = useContext(ActiveProfileContext);
  if (!context) {
    throw new Error('useActiveProfile must be used within ActiveProfileProvider');
  }
  return context;
}
