import webpush from 'web-push';
import { supabaseAdmin } from '@/lib/supabase/admin';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:houseofventures.dev@gmail.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export async function sendWebPushToProfile(
  profileId: string,
  payload: { title: string; body: string; url?: string }
) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('[WebPush] VAPID keys not configured. Skipping push notification.');
    return;
  }

  try {
    const { data: subs, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('profile_id', profileId);

    if (error || !subs || subs.length === 0) {
      return;
    }

    const payloadString = JSON.stringify(payload);

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: sub.keys,
          };
          await webpush.sendNotification(pushSubscription, payloadString);
        } catch (err: any) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            // Subscription expired or invalid
            await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
          }
        }
      })
    );
  } catch (err) {
    console.error('[WebPush Error]', err);
  }
}
