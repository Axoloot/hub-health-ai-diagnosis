/**
 * In-browser inference for the HUB-IA models.
 *
 * The Keras models trained in /ai are converted to TF.js graph models
 * (see ai/convert_to_tfjs.sh) and served as static files from
 * /public/models. Inference runs entirely in the user's browser:
 * no patient measurement is sent to a server to get a prediction.
 */
import type { GraphModel, Tensor } from '@tensorflow/tfjs';

export type ModelName =
  | `heart_disease`
  | `breast_cancer`
  | `fetal_health`
  | `chest_xray`;

export type Prediction = {
  /** Model score in [0, 1] for the "sick" class (clamped for regression models). */
  score: number;
  positive: boolean;
};

/** Decision threshold: every model scores the "sick" class as 1, "healthy" as 0. */
const THRESHOLD = 0.5;

/** Number of input features expected by each tabular model (same order as the CSV columns). */
export const FEATURE_COUNT = {
  heart_disease: 13,
  breast_cancer: 30,
  fetal_health: 21,
} as const;

/** Image size the chest X-ray CNN was trained on (grayscale). */
const XRAY_SIZE = 48;

// TF.js is ~1 MB: load it lazily so it only ships on the diagnosis pages.
const loadTf = () => import(`@tensorflow/tfjs`);

const modelCache = new Map<ModelName, Promise<GraphModel>>();

export function loadModel(name: ModelName): Promise<GraphModel> {
  let model = modelCache.get(name);
  if (!model) {
    model = loadTf().then((tf) =>
      tf.loadGraphModel(`/models/${name}/model.json`),
    );
    model.catch(() => modelCache.delete(name));
    modelCache.set(name, model);
  }
  return model;
}

const INPUT_SHAPE: Record<ModelName, number[]> = {
  heart_disease: [1, 13],
  breast_cancer: [1, 30],
  fetal_health: [1, 21],
  chest_xray: [1, XRAY_SIZE, XRAY_SIZE, 1],
};

const warmed = new Map<ModelName, Promise<void>>();

/**
 * Downloads the model and runs it once on zeros, so the first real
 * prediction doesn't pay for TF.js setup and kernel compilation.
 */
export function warmUp(name: ModelName): Promise<void> {
  let done = warmed.get(name);
  if (!done) {
    done = Promise.all([loadTf(), loadModel(name)]).then(([tf, model]) => {
      tf.tidy(() => {
        (model.predict(tf.zeros(INPUT_SHAPE[name])) as Tensor).dataSync();
      });
    });
    done.catch(() => warmed.delete(name));
    warmed.set(name, done);
  }
  return done;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const toPrediction = (score: number): Prediction => ({
  score,
  positive: score >= THRESHOLD,
});

/**
 * Parse a comma-separated list of numbers ("1.2, 3, 4e-2").
 * Throws a user-readable error if a value is not a number or the count is wrong.
 */
export function parseFeatures(raw: string, expected: number): number[] {
  const values = raw
    .split(`,`)
    .map((v) => v.trim())
    .filter((v) => v !== ``)
    .map(Number);
  if (values.some((v) => !Number.isFinite(v)))
    throw new Error(`Toutes les valeurs doivent être des nombres`);
  if (values.length !== expected)
    throw new Error(`${expected} valeurs attendues, ${values.length} reçues`);
  return values;
}

/**
 * Tabular models (heart, breast, fetal) are regressors trained with MSE on
 * 0/1 labels, so the single output is an unbounded score around [0, 1].
 */
export async function predictTabular(
  name: keyof typeof FEATURE_COUNT,
  features: number[],
): Promise<Prediction> {
  if (features.length !== FEATURE_COUNT[name])
    throw new Error(`${name} expects ${FEATURE_COUNT[name]} features`);
  const [tf, model] = await Promise.all([loadTf(), loadModel(name)]);
  const score = tf.tidy(() => {
    const output = model.predict(tf.tensor2d([features])) as Tensor;
    return output.dataSync()[0];
  });
  return toPrediction(clamp01(score));
}

export const XRAY_INPUT_SIZE = XRAY_SIZE;

/**
 * Reproduces the training preprocessing in ai/chest_xray/load_dataset.py:
 * PIL grayscale (ITU-R 601-2 luma) -> resize to 48x48 -> raw 0-255 values.
 * Returns the exact 48x48 pixels the model receives.
 */
export async function preprocessXray(
  image: HTMLImageElement,
): Promise<Float32Array> {
  await image.decode(); // make sure the pixels are available
  // Downscale with the browser's high-quality resampler, which averages
  // pixels like PIL's resize instead of skipping them.
  const canvas = document.createElement(`canvas`);
  canvas.width = XRAY_SIZE;
  canvas.height = XRAY_SIZE;
  const ctx = canvas.getContext(`2d`);
  if (!ctx) throw new Error(`Canvas 2D context unavailable`);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = `high`;
  ctx.drawImage(image, 0, 0, XRAY_SIZE, XRAY_SIZE);
  const { data } = ctx.getImageData(0, 0, XRAY_SIZE, XRAY_SIZE);

  const gray = new Float32Array(XRAY_SIZE * XRAY_SIZE);
  for (let i = 0; i < gray.length; i++) {
    const [r, g, b] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
    gray[i] = Math.round((r * 299 + g * 587 + b * 114) / 1000);
  }
  return gray;
}

/** The CNN outputs 2 logits [NORMAL, PNEUMONIA]; softmax gives P(PNEUMONIA). */
export async function predictXrayPixels(
  gray: Float32Array,
): Promise<Prediction> {
  const [tf, model] = await Promise.all([loadTf(), loadModel(`chest_xray`)]);
  const score = tf.tidy(() => {
    const input = tf.tensor4d(gray, [1, XRAY_SIZE, XRAY_SIZE, 1]);
    const logits = model.predict(input) as Tensor;
    return tf.softmax(logits).dataSync()[1];
  });
  return toPrediction(score);
}

export async function predictChestXray(
  image: HTMLImageElement,
): Promise<Prediction> {
  return predictXrayPixels(await preprocessXray(image));
}
