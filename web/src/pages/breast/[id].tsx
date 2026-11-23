import { DiagnosisForm } from '@/components';

// Wisconsin Breast Cancer dataset features, in CSV order (ai/breast_cancer).
const FEATURES = [`mean`, `se`, `worst`].flatMap((stat) =>
  [
    `radius`,
    `texture`,
    `perimeter`,
    `area`,
    `smoothness`,
    `compactness`,
    `concavity`,
    `concave points`,
    `symmetry`,
    `fractal_dimension`,
  ].map((f) => `${f}_${stat}`),
);

// First row of breast_cancer.csv (diagnosis: malignant).
const SAMPLE = [
  17.99, 10.38, 122.8, 1001, 0.1184, 0.2776, 0.3001, 0.1471, 0.2419, 0.07871,
  1.095, 0.9053, 8.589, 153.4, 0.006399, 0.04904, 0.05373, 0.01587, 0.03003,
  0.006193, 25.38, 17.33, 184.6, 2019, 0.1622, 0.6656, 0.7119, 0.2654, 0.4601,
  0.1189,
];

const BreastForm = () => (
  <DiagnosisForm
    title="Dépistage du cancer du sein"
    diagnosisName="Breast Sickness"
    model="breast_cancer"
    featureNames={FEATURES}
    sample={SAMPLE}
  />
);

export default BreastForm;
