/**
 * Portfolio demo mode.
 *
 * Visitors sign in with one click as a shared "demo doctor". The demo data is
 * fictional and is wiped and re-seeded every day by a Vercel cron job
 * (see /api/cron/reset-demo and vercel.json).
 */
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import UserModel from '@/lib/models/User';
import PatientModel from '@/lib/models/Patients';
import SicknessModel from '@/lib/models/Sickness';

export const DEMO_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE !== `false`;

export const DEMO_USER = {
  email: `demo@hub-health.app`,
  pseudo: `Dr Démo`,
};

/** Create the demo doctor if needed. Its password is random: only the demo provider can sign in as it. */
export async function ensureDemoUser() {
  const existing = await UserModel.findOne({ email: DEMO_USER.email });
  if (existing) return existing;
  return UserModel.create({
    ...DEMO_USER,
    password: await bcrypt.hash(randomBytes(32).toString(`hex`), 10),
  });
}

// Fictional patients. Scores below are real outputs of the models on rows of the training CSVs.
const SEED = [
  {
    patient: {
      firstname: `Camille`,
      lastname: `Martin`,
      email: `camille.martin@example.com`,
    },
    diagnoses: [{ name: `Heart Sickness`, score: 0.5982, daysAgo: 12 }],
  },
  {
    patient: {
      firstname: `Lucas`,
      lastname: `Bernard`,
      email: `lucas.bernard@example.com`,
    },
    diagnoses: [{ name: `Heart Sickness`, score: 0.1019, daysAgo: 30 }],
  },
  {
    patient: {
      firstname: `Inès`,
      lastname: `Dubois`,
      email: `ines.dubois@example.com`,
    },
    diagnoses: [
      { name: `Breast Sickness`, score: 0.5905, daysAgo: 3 },
      { name: `Breast Sickness`, score: 0.2485, daysAgo: 90 },
    ],
  },
  {
    patient: {
      firstname: `Hugo`,
      lastname: `Petit`,
      email: `hugo.petit@example.com`,
    },
    diagnoses: [],
  },
];

/** Delete every patient and diagnosis, then insert the fictional demo dataset. */
export async function resetDemoData() {
  await Promise.all([
    PatientModel.deleteMany({}),
    SicknessModel.deleteMany({}),
  ]);

  for (const { patient, diagnoses } of SEED) {
    const patientId = new mongoose.Types.ObjectId();
    const sicknesses = diagnoses.map((d) => ({
      _id: new mongoose.Types.ObjectId(),
      name: d.name,
      description: `Score du modèle : ${(d.score * 100).toFixed(1)} %`,
      doctor_supposition: `En attente de l'avis du médecin`,
      doctor_name: DEMO_USER.pseudo,
      doctor_email: DEMO_USER.email,
      ai_supposition: d.score >= 0.5 ? `POSITIVE` : `NEGATIVE`,
      date: new Date(Date.now() - d.daysAgo * 86_400_000).toISOString(),
      result: d.score.toFixed(4),
      patientId: String(patientId),
    }));
    if (sicknesses.length) await SicknessModel.insertMany(sicknesses);
    await PatientModel.create({
      _id: patientId,
      ...patient,
      sickness: sicknesses.map((s) => s._id),
    });
  }
}

/** Seed the demo data the first time someone opens the demo on an empty database. */
export async function seedDemoDataIfEmpty() {
  if ((await PatientModel.estimatedDocumentCount()) === 0)
    await resetDemoData();
}
