import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/database';
import { requireSession } from '@/lib/auth';
import PatientModel from '@/lib/models/Patients';
import '@/lib/models/Sickness'; // registers the model used by populate()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (!(await requireSession(req, res))) return;
    await dbConnect();

    switch (req.method) {
      case `GET`: {
        const { id } = req.query;
        if (!id) {
          const patients = await PatientModel.find().populate(`sickness`);
          return res.status(200).json(patients);
        }
        const patient = await PatientModel.findById(id).populate(`sickness`);
        if (!patient) return res.status(404).json({ error: `Not found` });
        return res.status(200).json(patient);
      }
      case `POST`: {
        const { firstname, lastname, email } = req.body ?? {};
        const patient = await PatientModel.create({
          firstname,
          lastname,
          email,
          sickness: [],
        });
        return res.status(201).json(patient);
      }
      case `PATCH`: {
        const { _id, firstname, lastname, email } = req.body ?? {};
        if (!_id) return res.status(400).json({ error: `Missing _id` });
        const patient = await PatientModel.findByIdAndUpdate(
          _id,
          { firstname, lastname, email },
          { new: true, runValidators: true, omitUndefined: true },
        );
        if (!patient) return res.status(404).json({ error: `Not found` });
        return res.status(200).json(patient);
      }
      default:
        return res.status(405).json({ error: `Method Not Allowed` });
    }
  } catch (e) {
    console.error(e);
    const status = (e as Error).name === `ValidationError` ? 400 : 500;
    return res.status(status).json({ error: (e as Error).message });
  }
}
