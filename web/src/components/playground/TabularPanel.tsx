import { useEffect, useMemo, useState } from 'react';
import { predictTabular, warmUp } from '@/lib/ai';
import { TABULAR_DATA } from '@/lib/playground/data';
import type { TabularModelInfo } from '@/lib/playground/models';
import { ResultSheet, type RunState } from './ResultSheet';
import s from './playground.module.css';

type Feature = {
  key: string;
  label: string;
  min: number;
  max: number;
  hint?: string;
  integer?: boolean;
};

const fmt = (x: number) => String(Number(x.toFixed(6)));

export function TabularPanel({ info }: { info: TabularModelInfo }) {
  const data = TABULAR_DATA[info.model];
  const features = data.features as readonly Feature[];
  const [values, setValues] = useState<string[]>(() =>
    data.samples.positive.map(fmt),
  );
  const [state, setState] = useState<RunState>({ status: `loading` });

  const parsed = useMemo(
    () => values.map((v) => (v.trim() === `` ? NaN : Number(v))),
    [values],
  );
  const invalid = parsed.map((v) => !Number.isFinite(v));

  // Live inference: re-run the model shortly after every edit.
  useEffect(() => {
    if (invalid.some(Boolean)) {
      setState({
        status: `idle`,
        message: `Fill in every field to get a score.`,
      });
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setState((prev) =>
        prev.status === `done` ? prev : { status: `loading` },
      );
      try {
        await warmUp(info.model);
        const start = performance.now();
        const prediction = await predictTabular(info.model, parsed);
        const ms = performance.now() - start;
        if (!cancelled) setState({ status: `done`, prediction, ms });
      } catch (e) {
        if (!cancelled)
          setState({ status: `error`, message: (e as Error).message });
      }
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed, info.model]);

  const setValue = (i: number, v: string) =>
    setValues((prev) => prev.map((old, j) => (j === i ? v : old)));

  const input = (i: number, label: string) => {
    const f = features[i];
    return (
      <input
        className={`${s.input} ${invalid[i] ? s.inputInvalid : ``}`}
        type="number"
        inputMode="decimal"
        step={f.integer ? 1 : `any`}
        aria-label={label}
        aria-invalid={invalid[i]}
        title={`Dataset range: ${fmt(f.min)} to ${fmt(f.max)}`}
        value={values[i]}
        onChange={(e) => setValue(i, e.target.value)}
      />
    );
  };

  return (
    <div className={s.grid}>
      <section aria-label={`${info.name} inputs`}>
        <h2 className={s.question}>{info.question}</h2>
        <p className={s.hint}>
          Start from a real patient in the dataset, then change any value. The
          score updates as you type.
        </p>
        <div className={s.samples}>
          <button
            type="button"
            className={s.button}
            onClick={() => setValues(data.samples.positive.map(fmt))}
          >
            Load a sick patient
          </button>
          <button
            type="button"
            className={s.button}
            onClick={() => setValues(data.samples.negative.map(fmt))}
          >
            Load a healthy patient
          </button>
        </div>

        {info.layout === `breast-grid` ? (
          <BreastMatrix features={features} input={input} />
        ) : (
          <div className={s.fields}>
            {features.map((f, i) => (
              <label key={f.key} className={s.field}>
                <span className={s.fieldLabel}>
                  {f.label}
                  {f.hint && <span className={s.fieldHint}>{f.hint}</span>}
                </span>
                {input(i, f.label)}
              </label>
            ))}
          </div>
        )}
      </section>
      <ResultSheet info={info} state={state} />
    </div>
  );
}

/** The 30 breast features are 10 measurements × 3 statistics: show them as a table. */
function BreastMatrix({
  features,
  input,
}: {
  features: readonly Feature[];
  input: (i: number, label: string) => JSX.Element;
}) {
  const stats = [`mean`, `standard error`, `worst`];
  const rows = features.slice(0, 10).map((f) => f.label);
  return (
    <table className={s.matrix}>
      <thead>
        <tr>
          <th scope="col">Measurement</th>
          {stats.map((st) => (
            <th key={st} scope="col">
              {st[0].toUpperCase() + st.slice(1)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((name, r) => (
          <tr key={name}>
            <th scope="row">{name}</th>
            {stats.map((st, c) => (
              <td key={st}>{input(c * 10 + r, `${name}, ${st}`)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
