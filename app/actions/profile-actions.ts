'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { Profile } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('is_active', true)
    .order('role', { ascending: false }) // founder first
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  return data as Profile[];
}

export async function updateProfileEmail(profileId: string, email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ email: cleanEmail, updated_at: new Date().toISOString() })
    .eq('id', profileId);

  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath('/');
  revalidatePath('/daily-work');
  return { success: true };
}

export async function addMember(params: {
  fullName: string;
  role: 'founder' | 'member';
  leadTitle?: string;
  email?: string;
  avatarColor?: string;
}) {
  const name = params.fullName.trim();
  if (!name) return { success: false, error: 'Name is required' };

  // Generate unique slug
  let baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!baseSlug) baseSlug = 'member';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data } = await supabaseAdmin.from('profiles').select('id').eq('slug', slug).maybeSingle();
    if (!data) break;
    counter++;
    slug = `${baseSlug}${counter}`;
  }

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1'];
  const assignedColor = params.avatarColor || colors[Math.floor(Math.random() * colors.length)];

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      slug,
      full_name: name,
      role: params.role || 'member',
      lead_title: params.leadTitle?.trim() || 'Team Member',
      email: params.email?.trim().toLowerCase() || '',
      avatar_color: assignedColor,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/daily-work');
  return { success: true, profile: data as Profile };
}
