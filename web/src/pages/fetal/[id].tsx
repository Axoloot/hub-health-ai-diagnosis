import { DiagnosisForm } from '@/components';

// Cardiotocography features, in CSV order (ai/fetal_health).
const FEATURES = [
  `baseline value`,
  `accelerations`,
  `fetal_movement`,
  `uterine_contractions`,
  `light_decelerations`,
  `severe_decelerations`,
  `prolongued_decelerations`,
  `abnormal_short_term_variability`,
  `mean_value_of_short_term_variability`,
  `percentage_of_time_with_abnormal_long_term_variability`,
  `mean_value_of_long_term_variability`,
  `histogram_width`,
  `histogram_min`,
  `histogram_max`,
  `histogram_number_of_peaks`,
  `histogram_number_of_zeroes`,
  `histogram_mode`,
  `histogram_mean`,
  `histogram_median`,
  `histogram_variance`,
  `histogram_tendency`,
];

// First row of fetal_health.csv (label: suspect).
const SAMPLE = [
  120, 0, 0, 0, 0, 0, 0, 73, 0.5, 43, 2.4, 64, 62, 126, 2, 0, 120, 137, 121, 73,
  1,
];

const FetalForm = () => (
  <DiagnosisForm
    title="Analyse de la santé fœtale (cardiotocographie)"
    diagnosisName="Fetal Sickness"
    model="fetal_health"
    featureNames={FEATURES}
    sample={SAMPLE}
  />
);

export default FetalForm;
