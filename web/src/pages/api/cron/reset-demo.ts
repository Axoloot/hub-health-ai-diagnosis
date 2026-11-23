import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/database';
import { DEMO_ENABLED, ensureDemoUser, resetDemoData } from '@/lib/demo';

/**
 * Daily reset of the public demo, triggered by Vercel Cron (vercel.json).
 * Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: `Unauthorized` });
  }
  if (!DEMO_ENABLED) return res.status(404).json({ error: `Demo disabled` });
  try {
    await dbConnect();
    await ensureDemoUser();
    await resetDemoData();
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: `Reset failed` });
  }
}
