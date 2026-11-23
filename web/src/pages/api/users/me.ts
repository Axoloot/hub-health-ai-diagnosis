import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/database';
import { requireSession } from '@/lib/auth';
import User from '@/lib/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== `GET`) {
    return res.status(405).json({ error: `Method Not Allowed` });
  }
  try {
    const session = await requireSession(req, res);
    if (!session) return;
    await dbConnect();
    const user = await User.findOne({ email: session.user?.email }).select(
      `-password`,
    );
    if (!user) return res.status(401).json({ error: `You must be logged in.` });
    return res.status(200).json(user);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: `Internal Server Error` });
  }
}
