import type { Prediction } from '@/lib/ai';
import type { ModelInfo } from '@/lib/playground/models';
import s from './playground.module.css';

export type RunState =
  | { status: `idle`; message: string }
  | { status: `loading` }
  | { status: `done`; prediction: Prediction; ms: number }
  | { status: `error`; message: string };

const pct = (x: number, digits = 1) => `${(x * 100).toFixed(digits)} %`;

const TICKS = Array.from({ length: 51 }, (_, i) => i * 2);

function Scale({ score }: { score: number | null }) {
  const left = `${(score ?? 0) * 100}%`;
  const color =
    score === null ? `transparent` : score >= 0.5 ? `#b8432f` : `#2e7a68`;
  return (
    <>
      <div
        className={s.scale}
        role="img"
        aria-label={
          score === null
            ? `No score yet`
            : `Score ${pct(score)} on a 0 to 100 % scale, threshold 50 %`
        }
      >
        <div
          className={s.scaleFill}
          style={{ width: left, background: color }}
        />
        <div className={s.scaleTrack}>
          {TICKS.map((t) => (
            <span
              key={t}
              className={`${s.tick} ${t % 10 === 0 ? s.tickMajor : ``}`}
              style={{ left: `${t}%` }}
            />
          ))}
        </div>
        <div className={s.scaleThreshold} />
        {score !== null && <div className={s.scaleMarker} style={{ left }} />}
      </div>
      <div className={s.scaleLegend}>
        <span>0 %</span>
        <span>Threshold 50 %</span>
        <span>100 %</span>
      </div>
    </>
  );
}

export function ResultSheet({
  info,
  state,
}: {
  info: ModelInfo;
  state: RunState;
}) {
  const done = state.status === `done` ? state : null;
  const score = done?.prediction.score ?? null;
  const { metrics } = info;

  return (
    <aside className={s.sheet} aria-live="polite">
      {info.defect && <p className={s.defect}>{info.defect}</p>}

      <p className={s.scoreLabel}>Model score</p>
      <p className={`${s.score} ${score === null ? s.scorePending : ``}`}>
        {score === null ? `– %` : pct(score)}
      </p>
      {done ? (
        <p
          className={`${s.verdict} ${
            done.prediction.positive ? s.verdictFlagged : s.verdictClear
          }`}
        >
          {done.prediction.positive ? info.flagged : info.clear}
        </p>
      ) : (
        <p className={`${s.verdict} ${s.verdictIdle}`}>
          {state.status === `loading`
            ? `Running the model…`
            : state.status === `idle` || state.status === `error`
            ? state.message
            : ``}
        </p>
      )}

      <Scale score={score} />

      <p className={s.timing}>
        {done
          ? `Computed in your browser in ${done.ms.toFixed(1)} ms.`
          : `Runs in your browser with TensorFlow.js.`}
      </p>

      <h2 className={s.aboutTitle}>About this model</h2>
      <table className={s.metrics}>
        <tbody>
          <tr>
            <td>
              Accuracy
              <span className={s.metricsSub}>
                vs {pct(metrics.baseline)} by always guessing the majority class
              </span>
            </td>
            <td>{pct(metrics.accuracy)}</td>
          </tr>
          <tr>
            <td>
              Sensitivity
              <span className={s.metricsSub}>sick cases it catches</span>
            </td>
            <td>{pct(metrics.sensitivity)}</td>
          </tr>
          <tr>
            <td>
              Specificity
              <span className={s.metricsSub}>healthy cases it clears</span>
            </td>
            <td>{pct(metrics.specificity)}</td>
          </tr>
        </tbody>
      </table>
      <dl className={s.facts}>
        <dt>Measured on</dt>
        <dd>{info.evaluation}</dd>
        <dt>Architecture</dt>
        <dd>{info.architecture}</dd>
        <dt>Dataset</dt>
        <dd>{info.dataset}</dd>
      </dl>
      <p className={s.note}>{info.note}</p>
    </aside>
  );
}
