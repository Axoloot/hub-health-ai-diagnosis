import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/database';
import { requireSession } from '@/lib/auth';
import PatientModel from '@/lib/models/Patients';
import '@/lib/models/Sickness'; // registers the model used by populate()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== `GET`) {
    return res.status(405).json({ error: `Method Not Allowed` });
  }
  try {
    if (!(await requireSession(req, res))) return;
    await dbConnect();
    const patients = await PatientModel.find().populate(`sickness`);
    return res.status(200).json(patients);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: `Internal Server Error` });
  }
}
