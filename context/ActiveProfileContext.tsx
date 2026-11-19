'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { InAppNotification, Profile } from '@/lib/types';
import { getProfiles } from '@/app/actions/profile-actions';
import { markAllNotificationsRead, sendTestNotification } from '@/app/actions/work-actions';
import { createClient } from '@/lib/supabase/client';
import { EXCEL_SEED_DATA } from '@/lib/data/excel-seed-data';

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
  markAllRead: () => Promise<void>;
  triggerTestNotification: () => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
  isEmailModalOpen: boolean;
  setIsEmailModalOpen: (open: boolean) => void;
  isAddMemberModalOpen: boolean;
  setIsAddMemberModalOpen: (open: boolean) => void;
}

const ActiveProfileContext = createContext<ActiveProfileContextType | undefined>(undefined);

const defaultFounder = (EXCEL_SEED_DATA.profiles.find((p) => p.role === 'founder') || EXCEL_SEED_DATA.profiles[0]) as unknown as Profile;

export function ActiveProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(EXCEL_SEED_DATA.profiles as unknown as Profile[]);
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(defaultFounder);
  const [impersonatedMember, setImpersonatedMember] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    const interval = setInterval(fetchNotifs, 5000);
    return () => clearInterval(interval);
  }, [activeProfile?.id]);

  const refreshNotifications = useCallback(async () => {
    if (!activeProfile) return;
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
      console.error('Error refreshing notifications:', err);
    }
  }, [activeProfile]);

  const markNotificationRead = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from('in_app_notifications').update({ is_read: true }).eq('id', id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    if (!activeProfile) return;
    try {
      await markAllNotificationsRead(activeProfile.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const triggerTestNotification = async (): Promise<boolean> => {
    if (!activeProfile) return false;
    try {
      const res = await sendTestNotification({
        recipientId: activeProfile.id,
        actorId: activeProfile.id,
        title: 'HOV Operations Alert',
        message: `Notification system operational for ${activeProfile.full_name} (${activeProfile.email || 'in-app'}).`,
      });
      if (res.success) {
        await refreshNotifications();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
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
        markAllRead,
        triggerTestNotification,
        refreshNotifications,
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
