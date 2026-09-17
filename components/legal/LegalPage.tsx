import type { ReactNode } from 'react';

type LegalSection = {
  title: string;
  body: ReactNode;
};

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
};

export function LegalPage({ eyebrow, title, intro, updated, sections }: Props) {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[var(--container-max)] flex-1 px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20 lg:px-16"
    >
      <article className="mx-auto max-w-4xl">
        <header className="border-b border-hairline pb-8 md:pb-12">
          <p className="label-caps mb-4 text-accent">{eyebrow}</p>
          <h1 className="headline-lg max-w-3xl text-balance text-text-hi">{title}</h1>
          <p className="body-lg mt-6 max-w-3xl text-text">{intro}</p>
          <p className="data-tabular mt-6 text-text-low">Last updated: {updated}</p>
        </header>

        <div className="mt-10 space-y-10 md:mt-14 md:space-y-14">
          {sections.map((section) => (
            <section key={section.title} className="max-w-3xl">
              <h2 className="headline-md text-text-hi">{section.title}</h2>
              <div className="body-md mt-4 space-y-4 text-text-mid">{section.body}</div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
