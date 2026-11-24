import { DragEvent, useEffect, useRef, useState } from 'react';
import {
  preprocessXray,
  predictXrayPixels,
  warmUp,
  XRAY_INPUT_SIZE,
} from '@/lib/ai';
import type { ImageModelInfo } from '@/lib/playground/models';
import { ResultSheet, type RunState } from './ResultSheet';
import s from './playground.module.css';

const SAMPLES = {
  pneumonia: `/playground/xray-pneumonia.jpg`,
  normal: `/playground/xray-normal.jpg`,
};

export function XrayPanel({ info }: { info: ImageModelInfo }) {
  const [src, setSrc] = useState(SAMPLES.pneumonia);
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState<RunState>({ status: `loading` });
  const imgRef = useRef<HTMLImageElement>(null);
  const seenRef = useRef<HTMLCanvasElement>(null);

  // Revoke uploaded object URLs when they are replaced.
  useEffect(
    () => () => {
      if (src.startsWith(`blob:`)) URL.revokeObjectURL(src);
    },
    [src],
  );

  const analyse = async () => {
    const img = imgRef.current;
    if (!img) return;
    setState({ status: `loading` });
    try {
      const gray = await preprocessXray(img);
      drawSeen(seenRef.current, gray);
      await warmUp(`chest_xray`);
      const start = performance.now();
      const prediction = await predictXrayPixels(gray);
      setState({ status: `done`, prediction, ms: performance.now() - start });
    } catch {
      setState({
        status: `error`,
        message: `This file could not be read as an image. Try a JPEG or PNG.`,
      });
    }
  };

  const pickFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith(`image/`)) {
      setState({
        status: `error`,
        message: `Drop an image file (JPEG or PNG).`,
      });
      return;
    }
    setSrc(URL.createObjectURL(file));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className={s.grid}>
      <section aria-label="Chest X-ray input">
        <h2 className={s.question}>{info.question}</h2>
        <p className={s.hint}>
          Try a test image the model never trained on, or drop your own chest
          X-ray. The image stays on your device.
        </p>
        <div className={s.samples}>
          <button
            type="button"
            className={s.button}
            onClick={() => setSrc(SAMPLES.pneumonia)}
          >
            Load a pneumonia X-ray
          </button>
          <button
            type="button"
            className={s.button}
            onClick={() => setSrc(SAMPLES.normal)}
          >
            Load a healthy X-ray
          </button>
          <label className={s.upload}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <span className={s.button}>Upload an image</span>
          </label>
        </div>

        <div className={s.dropzone}>
          <div
            className={`${s.lightbox} ${dragging ? s.lightboxActive : ``}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt="Chest X-ray being analysed"
              onLoad={analyse}
              onError={() =>
                setState({
                  status: `error`,
                  message: `This file could not be read as an image. Try a JPEG or PNG.`,
                })
              }
            />
          </div>
          <figure className={s.seen} style={{ margin: 0 }}>
            <canvas
              ref={seenRef}
              width={XRAY_INPUT_SIZE}
              height={XRAY_INPUT_SIZE}
              aria-label="The 48 by 48 grayscale image the model receives"
            />
            <figcaption className={s.seenCaption}>
              What the model sees: the same image reduced to 48 × 48 grayscale
              pixels, as in training.
            </figcaption>
          </figure>
        </div>
      </section>
      <ResultSheet info={info} state={state} />
    </div>
  );
}

function drawSeen(canvas: HTMLCanvasElement | null, gray: Float32Array) {
  const ctx = canvas?.getContext(`2d`);
  if (!ctx) return;
  const image = ctx.createImageData(XRAY_INPUT_SIZE, XRAY_INPUT_SIZE);
  gray.forEach((v, i) => {
    image.data.set([v, v, v, 255], i * 4);
  });
  ctx.putImageData(image, 0, 0);
}
