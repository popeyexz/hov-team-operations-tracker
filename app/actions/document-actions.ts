'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { VentureDocument } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getVentureDocuments(ventureId: string): Promise<VentureDocument[]> {
  const { data, error } = await supabaseAdmin
    .from('venture_documents')
    .select('*, uploader:uploaded_by(*)')
    .eq('venture_id', ventureId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching venture documents:', error);
    return [];
  }
  return data as VentureDocument[];
}

export async function uploadVentureDocument(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const ventureId = formData.get('ventureId') as string;
    const profileId = formData.get('profileId') as string;

    if (!file || !ventureId) {
      return { success: false, error: 'File and venture are required' };
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${ventureId}/${Date.now()}_${sanitizedName}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
      .from('venture-documents')
      .upload(storagePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (uploadErr) {
      return { success: false, error: uploadErr.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('venture-documents')
      .getPublicUrl(storagePath);

    const fileUrl = publicUrlData.publicUrl;

    // Save record in venture_documents
    const { data: docRecord, error: insertErr } = await supabaseAdmin
      .from('venture_documents')
      .insert({
        venture_id: ventureId,
        name: file.name,
        file_url: fileUrl,
        file_type: file.type || 'unknown',
        file_size: file.size,
        uploaded_by: profileId || null,
      })
      .select('*, uploader:uploaded_by(*)')
      .single();

    if (insertErr) {
      return { success: false, error: insertErr.message };
    }

    revalidatePath('/daily-work');
    return { success: true, document: docRecord as VentureDocument };
  } catch (err: any) {
    console.error('uploadVentureDocument error:', err);
    return { success: false, error: err.message || 'Upload failed' };
  }
}

export async function deleteVentureDocument(documentId: string, fileUrl: string) {
  try {
    // Delete database record
    const { error: dbErr } = await supabaseAdmin
      .from('venture_documents')
      .delete()
      .eq('id', documentId);

    if (dbErr) return { success: false, error: dbErr.message };

    // Parse storage path from fileUrl
    const urlParts = fileUrl.split('/venture-documents/');
    if (urlParts.length > 1) {
      const storagePath = decodeURIComponent(urlParts[1]);
      await supabaseAdmin.storage.from('venture-documents').remove([storagePath]);
    }

    revalidatePath('/daily-work');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
