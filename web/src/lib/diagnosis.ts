import axios from 'axios';
import type { Prediction } from '@/lib/ai';
import type { IUser } from '@/lib/models/User';

type SaveDiagnosisParams = {
  name: string;
  prediction: Prediction;
  patientId: string;
  user: IUser | null;
};

/** Store an AI prediction in the patient's record. */
export async function saveDiagnosis({
  name,
  prediction,
  patientId,
  user,
}: SaveDiagnosisParams) {
  const percent = (prediction.score * 100).toFixed(1);
  await axios.post(`/api/sickness`, {
    name,
    description: `Score du modèle : ${percent} %`,
    doctor_supposition: `En attente de l'avis du médecin`,
    doctor_name: user?.pseudo ?? ``,
    doctor_email: user?.email ?? ``,
    ai_supposition: prediction.positive ? `POSITIVE` : `NEGATIVE`,
    date: new Date().toISOString(),
    result: prediction.score.toFixed(4),
    patientId,
  });
}
