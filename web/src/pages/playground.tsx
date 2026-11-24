import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Instrument_Sans } from 'next/font/google';
import { MODELS } from '@/lib/playground/models';
import { TabularPanel } from '@/components/playground/TabularPanel';
import { XrayPanel } from '@/components/playground/XrayPanel';
import s from '@/components/playground/playground.module.css';

// next/font requires plain string literals here.
// eslint-disable-next-line @typescript-eslint/quotes
const font = Instrument_Sans({ subsets: ['latin'], display: 'swap' });

const REPO = `https://github.com/Axoloot/hub-health-ai-diagnosis`;

export default function Playground() {
  const [active, setActive] = useState(MODELS[0].id);

  // Deep links: /playground#xray opens the X-ray tab.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (MODELS.some((m) => m.id === id)) setActive(id);
    };
    fromHash();
    window.addEventListener(`hashchange`, fromHash);
    return () => window.removeEventListener(`hashchange`, fromHash);
  }, []);

  const select = (id: string) => {
    setActive(id);
    window.history.replaceState(null, ``, `#${id}`);
  };

  const info = MODELS.find((m) => m.id === active) ?? MODELS[0];

  return (
    <div className={`${s.page} ${font.className}`}>
      <Head>
        <title>HUB-Health model playground</title>
        <meta
          name="description"
          content="Four medical screening models trained with Keras, running in your browser with TensorFlow.js."
        />
      </Head>

      <div className={s.wrap}>
        <header className={s.header}>
          <h1 className={s.title}>HUB-Health model playground</h1>
          <p className={s.lede}>
            Four screening models from a 2023 team project, trained in Python
            with Keras and converted to TensorFlow.js. They run in your browser:
            nothing you enter leaves this page. Each model shows its real
            scores, flaws included.
          </p>
          <nav className={s.links} aria-label="Project links">
            <a href={REPO}>Source code on GitHub</a>
            <Link href="/login">Doctor app demo</Link>
          </nav>
        </header>

        <div className={s.tabs} role="tablist" aria-label="Models">
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={m.id === info.id}
              className={`${s.tab} ${m.id === info.id ? s.tabActive : ``}`}
              onClick={() => select(m.id)}
            >
              <span className={s.tabName}>{m.name}</span>
              <span className={s.tabInput}>{m.input}</span>
            </button>
          ))}
        </div>

        <main role="tabpanel" aria-label={info.name}>
          {info.kind === `tabular` ? (
            <TabularPanel key={info.id} info={info} />
          ) : (
            <XrayPanel key={info.id} info={info} />
          )}
        </main>

        <footer className={s.footer}>
          <p>
            For demonstration only: these models are not medical devices. Built
            by Cyril de Lajudie and Vincent Lemesle (models) with Antoine
            Famibelle (doctor app). Sample X-rays from Kermany et al. 2018,
            licensed CC BY 4.0.
          </p>
        </footer>
      </div>
    </div>
  );
}
