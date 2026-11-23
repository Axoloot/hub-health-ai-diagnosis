import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Button } from '@/components';
import { useUserContext } from '@/providers/userProvider';
import { predictChestXray } from '@/lib/ai';
import { saveDiagnosis } from '@/lib/diagnosis';
import { ROUTER } from '@/lib/utils';

const ChestForm = () => {
  const router = useRouter();
  const { user } = useUserContext();
  const patientId = String(router.query.id ?? ``);
  const imageRef = useRef<HTMLImageElement>(null);
  const [file, setFile] = useState(``);
  const [loading, setLoading] = useState(false);

  // Release the object URL when the image changes or the page unmounts.
  useEffect(
    () => () => {
      if (file) URL.revokeObjectURL(file);
    },
    [file],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(URL.createObjectURL(selected));
  };

  const analyse = async () => {
    if (!imageRef.current) return;
    setLoading(true);
    try {
      const prediction = await predictChestXray(imageRef.current);
      await saveDiagnosis({
        name: `Chest Sickness`,
        prediction,
        patientId,
        user,
      });
      toast.success(
        `Pneumonie : ${prediction.positive ? `POSITIF` : `NÉGATIF`} (${(
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
      <div className="w-full max-w-md m-auto bg-white rounded-lg border border-primaryBorder shadow-default py-10 px-16">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-2xl font-medium text-primary mb-6 text-center">
            Détection de pneumonie sur radiographie thoracique
          </h1>
          <input type="file" accept="image/*" onChange={handleChange} />
          {file && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imageRef}
              src={file}
              alt="Radiographie à analyser"
              style={{ padding: `1em 0` }}
            />
          )}
          {file && (
            <Button
              label={loading ? `Analyse…` : `Analyser`}
              onClick={() => !loading && analyse()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChestForm;
