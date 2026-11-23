import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Input, Button } from '@/components';
import { useUserContext } from '@/providers/userProvider';
import { predictTabular } from '@/lib/ai';
import { saveDiagnosis } from '@/lib/diagnosis';
import { ROUTER } from '@/lib/utils';

// Columns of ai/heart_disease/heart_disease.csv, in the order the model expects.
const FIELDS = [
  { key: `age`, label: `Âge` },
  { key: `sex`, label: `Sexe (1 = homme, 0 = femme)` },
  { key: `cp`, label: `Type de douleur thoracique (0 à 3)` },
  { key: `trestbps`, label: `Pression artérielle au repos (mm Hg)` },
  { key: `chol`, label: `Cholestérol sérique (mg/dl)` },
  { key: `fbs`, label: `Glycémie à jeun > 120 mg/dl (1 = oui, 0 = non)` },
  {
    key: `restecg`,
    label: `ECG au repos (0 = normal, 1 = anomalie ST-T, 2 = hypertrophie)`,
  },
  { key: `thalach`, label: `Fréquence cardiaque maximale atteinte` },
  { key: `exang`, label: `Angine induite par l'effort (1 = oui, 0 = non)` },
  { key: `oldpeak`, label: `Dépression ST induite par l'effort` },
  { key: `slope`, label: `Pente du segment ST à l'effort (0 à 2)` },
  { key: `ca`, label: `Nombre de vaisseaux majeurs colorés (0 à 3)` },
  { key: `thal`, label: `Thalassémie (0 à 3)` },
] as const;

type FieldKey = (typeof FIELDS)[number][`key`];

// First row of heart_disease.csv (no heart disease).
const SAMPLE: Record<FieldKey, string> = {
  age: `52`,
  sex: `1`,
  cp: `0`,
  trestbps: `125`,
  chol: `212`,
  fbs: `0`,
  restecg: `1`,
  thalach: `168`,
  exang: `0`,
  oldpeak: `1`,
  slope: `2`,
  ca: `2`,
  thal: `3`,
};

const EMPTY = Object.fromEntries(FIELDS.map((f) => [f.key, ``])) as Record<
  FieldKey,
  string
>;

const HeartForm = () => {
  const router = useRouter();
  const { user } = useUserContext();
  const patientId = String(router.query.id ?? ``);
  const [values, setValues] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const analyse = async () => {
    const features = FIELDS.map((f) => Number(values[f.key]));
    const missing = FIELDS.find(
      (f, i) => values[f.key].trim() === `` || !Number.isFinite(features[i]),
    );
    if (missing) {
      toast.error(`Valeur invalide : ${missing.label}`);
      return;
    }
    setLoading(true);
    try {
      const prediction = await predictTabular(`heart_disease`, features);
      await saveDiagnosis({
        name: `Heart Sickness`,
        prediction,
        patientId,
        user,
      });
      toast.success(
        `Résultat IA : ${prediction.positive ? `POSITIF` : `NÉGATIF`} (${(
          prediction.score * 100
        ).toFixed(1)} %)`,
      );
      router.push(`${ROUTER.patientDetails}${patientId}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-bg1">
      <div className="w-full max-w-xl m-auto bg-white rounded-lg border border-primaryBorder shadow-default py-10 px-8 mt-16">
        <h1 className="text-2xl font-medium text-primary mt-4 mb-12 text-center">
          Dépistage des maladies cardiaques
        </h1>
        <div className="flex flex-col justify-center items-center">
          {FIELDS.map((field) => (
            <Input
              key={field.key}
              placeholder={field.label}
              type="number"
              value={values[field.key]}
              onChange={(value) =>
                setValues((prev) => ({ ...prev, [field.key]: value }))
              }
              required
            />
          ))}
          <div className="mt-4">
            <Button
              label="Remplir avec des valeurs de test"
              onClick={() => setValues(SAMPLE)}
            />
          </div>
          <div className="p-4">
            <Button
              label={loading ? `Analyse…` : `Analyser les résultats`}
              onClick={() => !loading && analyse()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeartForm;
