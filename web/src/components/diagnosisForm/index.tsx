import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Button } from '@/components/button';
import { useUserContext } from '@/providers/userProvider';
import { FEATURE_COUNT, parseFeatures, predictTabular } from '@/lib/ai';
import { saveDiagnosis } from '@/lib/diagnosis';
import { ROUTER } from '@/lib/utils';

type DiagnosisFormProps = {
  title: string;
  /** Label stored with the diagnosis, e.g. "Breast Sickness". */
  diagnosisName: string;
  model: keyof typeof FEATURE_COUNT;
  /** Feature names, in the order the model expects them. */
  featureNames: string[];
  /** A real row from the training CSV, used by the "test values" button. */
  sample: number[];
};

/**
 * Generic form for the tabular models: the doctor pastes the measurements
 * as a comma-separated list, the model runs in the browser and the result
 * is saved to the patient's record.
 */
export const DiagnosisForm = ({
  title,
  diagnosisName,
  model,
  featureNames,
  sample,
}: DiagnosisFormProps) => {
  const router = useRouter();
  const { user } = useUserContext();
  const patientId = String(router.query.id ?? ``);
  const [input, setInput] = useState(``);
  const [loading, setLoading] = useState(false);

  const analyse = async () => {
    setLoading(true);
    try {
      const features = parseFeatures(input, FEATURE_COUNT[model]);
      const prediction = await predictTabular(model, features);
      await saveDiagnosis({ name: diagnosisName, prediction, patientId, user });
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
        <h1 className="text-2xl font-medium text-primary mt-4 mb-8 text-center">
          {title}
        </h1>
        <p className="mb-4 text-sm">
          Saisissez les {featureNames.length} valeurs suivantes, séparées par
          des virgules, dans cet ordre :
        </p>
        <p className="mb-6 text-xs text-gray-600 break-words">
          {featureNames.join(`, `)}
        </p>
        <div className="flex flex-col justify-center items-center">
          <textarea
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 mb-4"
            rows={4}
            placeholder={`${featureNames.length} valeurs séparées par des virgules`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            label="Remplir avec des valeurs de test"
            onClick={() => setInput(sample.join(`, `))}
          />
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
