import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile_id, subscription } = body;

    if (!profile_id || !subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Missing subscription parameters' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('push_subscriptions').upsert(
      {
        profile_id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      { onConflict: 'endpoint' }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
