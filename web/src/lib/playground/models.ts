import { TABULAR_DATA } from './data';

export type Metrics = {
  n: number;
  accuracy: number;
  sensitivity: number;
  specificity: number;
  /** Accuracy of always predicting the most frequent class. */
  baseline: number;
};

type ModelInfoBase = {
  id: string;
  name: string;
  input: string;
  question: string;
  flagged: string;
  clear: string;
  architecture: string;
  dataset: string;
  evaluation: string;
  metrics: Metrics;
  note: string;
  /** Shown as a warning: the model has a known defect. */
  defect?: string;
};

export type TabularModelInfo = ModelInfoBase & {
  kind: `tabular`;
  model: keyof typeof TABULAR_DATA;
  layout: `list` | `breast-grid`;
};

export type ImageModelInfo = ModelInfoBase & { kind: `image` };

export type ModelInfo = TabularModelInfo | ImageModelInfo;

const FULL_CSV = `Full dataset, training rows included`;

export const MODELS: ModelInfo[] = [
  {
    id: `heart`,
    kind: `tabular`,
    model: `heart_disease`,
    layout: `list`,
    name: `Heart disease`,
    input: `13 clinical measurements`,
    question: `Does this patient have heart disease?`,
    flagged: `Heart disease flagged`,
    clear: `No heart disease flagged`,
    architecture: `Dense network, 13 → 25 → 15 → 1`,
    dataset: `UCI Heart Disease (Kaggle version), 1,025 patients`,
    evaluation: FULL_CSV,
    metrics: TABULAR_DATA.heart_disease.metrics,
    note: `The model has seen most of these patients during training, so expect lower accuracy on new ones.`,
  },
  {
    id: `breast`,
    kind: `tabular`,
    model: `breast_cancer`,
    layout: `breast-grid`,
    name: `Breast cancer`,
    input: `30 cell-nucleus measurements from a biopsy image`,
    question: `Is this tumour malignant?`,
    flagged: `Malignant`,
    clear: `Benign`,
    architecture: `Dense network, 30 → 45 → 20 → 1`,
    dataset: `Breast Cancer Wisconsin (Diagnostic), 569 biopsies`,
    evaluation: FULL_CSV,
    metrics: TABULAR_DATA.breast_cancer.metrics,
    note: `The strongest of the tabular models. Its scores stay below 60 %, because the network was trained as a regression on 0/1 labels instead of a classifier.`,
  },
  {
    id: `fetal`,
    kind: `tabular`,
    model: `fetal_health`,
    layout: `list`,
    name: `Fetal health`,
    input: `21 cardiotocography readings`,
    question: `Is this fetal heart trace suspect or pathological?`,
    flagged: `Suspect or pathological`,
    clear: `Normal`,
    architecture: `Dense network, 21 → 40 → 20 → 1`,
    dataset: `Fetal Health Classification (CTG), 2,126 exams`,
    evaluation: FULL_CSV,
    metrics: TABULAR_DATA.fetal_health.metrics,
    note: `Unscaled inputs and softmax hidden layers are the likely causes. Retraining it with standardised features and a proper classifier is the next step.`,
    defect: `This model collapsed during training. It returns 21.8 % for every input and never flags a case: its 77.8 % accuracy only matches the share of normal exams.`,
  },
  {
    id: `xray`,
    kind: `image`,
    name: `Pneumonia`,
    input: `Chest X-ray image`,
    question: `Does this chest X-ray show pneumonia?`,
    flagged: `Pneumonia flagged`,
    clear: `No pneumonia flagged`,
    architecture: `Convolutional network, 3 convolution layers on a 48 × 48 grayscale image`,
    dataset: `Chest X-Ray Images (Pneumonia), Kermany et al. 2018, CC BY 4.0`,
    evaluation: `Held-out test set, 624 images`,
    metrics: {
      n: 624,
      accuracy: 0.739,
      sensitivity: 0.995,
      specificity: 0.312,
      baseline: 0.625,
    },
    note: `It catches almost every pneumonia but also flags 69 % of healthy lungs. 48 × 48 pixels is a very small input for an X-ray.`,
  },
];
