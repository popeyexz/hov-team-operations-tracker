interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmailNotification({ to, subject, html }: SendEmailParams) {
  if (!to || !to.includes('@')) {
    console.warn('[Email] Skipped: recipient email not provided or invalid.');
    return { success: false, reason: 'Invalid or missing email' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_DEV_EMAIL || 'houseofventures.dev@gmail.com';

  if (!apiKey) {
    console.log(`[Email Mock Dispatched] To: ${to} | Subject: ${subject}`);
    return { success: true, mocked: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `HOV Tracker <notifications@resend.dev>`,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (error) {
    console.error('[Email Notification Error]', error);
    return { success: false, error };
  }
}
