import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

/**
 * Returns the current session, or answers 401 and returns null.
 * Usage: `const session = await requireSession(req, res); if (!session) return;`
 */
export async function requireSession(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<Session | null> {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    res.status(401).json({ error: `You must be logged in.` });
    return null;
  }
  return session;
}
