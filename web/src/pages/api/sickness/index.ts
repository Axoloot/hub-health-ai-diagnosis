import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/database';
import { requireSession } from '@/lib/auth';
import PatientModel from '@/lib/models/Patients';
import SicknessModel from '@/lib/models/Sickness';

const EDITABLE_FIELDS = [
  `description`,
  `doctor_supposition`,
  `result`,
] as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (!(await requireSession(req, res))) return;
    await dbConnect();

    switch (req.method) {
      case `GET`: {
        const sickness = await SicknessModel.find();
        return res.status(200).json(sickness);
      }
      case `POST`: {
        const { patientId } = req.body ?? {};
        if (
          !mongoose.isValidObjectId(patientId) ||
          !(await PatientModel.exists({ _id: patientId }))
        ) {
          return res.status(404).json({ error: `Patient not found` });
        }
        const sickness = await SicknessModel.create({
          ...req.body,
          _id: new mongoose.Types.ObjectId(),
        });
        await PatientModel.findByIdAndUpdate(patientId, {
          $push: { sickness: sickness._id },
        });
        return res.status(201).json(sickness);
      }
      case `PATCH`: {
        const { _id } = req.body ?? {};
        if (!_id) return res.status(400).json({ error: `Missing _id` });
        const update = Object.fromEntries(
          EDITABLE_FIELDS.filter((f) => req.body[f] !== undefined).map((f) => [
            f,
            req.body[f],
          ]),
        );
        const sickness = await SicknessModel.findByIdAndUpdate(_id, update, {
          new: true,
          runValidators: true,
        });
        if (!sickness) return res.status(404).json({ error: `Not found` });
        return res.status(200).json(sickness);
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
