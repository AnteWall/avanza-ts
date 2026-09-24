import { HomeLayout } from 'fumadocs-ui/layouts/home';
import Link from 'next/link';

import { baseOptions } from '@/lib/layout.shared';

export default function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="relative isolate flex flex-1 flex-col overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_10%,rgba(56,189,248,0.10),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_10%,rgba(56,189,248,0.07),transparent_55%)]"
        />
        <div className="mx-auto w-full max-w-6xl px-6 pt-24 pb-20 sm:pt-32 lg:pt-40">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Avanza Tools<span className="text-sky-500">.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fd-muted-foreground sm:text-xl">
              Build with Avanza data in TypeScript or explore it from your terminal. Pick the tool
              that fits how you work.
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2">
            <Link
              href="/docs/sdk"
              className="group relative flex min-h-100 flex-col overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-7 transition-all duration-200 hover:-translate-y-1 hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500 sm:p-9"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-sky-400 to-blue-600" />
              <div className="flex items-start justify-between">
                <span className="flex size-14 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-500/15">
                  {/* TypeScript mark from https://svgl.app/library/typescript.svg */}
                  <svg
                    viewBox="0 0 256 256"
                    className="size-8 rounded-sm"
                    role="img"
                    aria-label="TypeScript"
                  >
                    <path
                      d="M20 0h216c11.046 0 20 8.954 20 20v216c0 11.046-8.954 20-20 20H20C8.954 256 0 247.046 0 236V20C0 8.954 8.954 0 20 0Z"
                      fill="#3178C6"
                    />
                    <path
                      d="M150.518 200.475v27.62c4.492 2.302 9.805 4.028 15.938 5.179 6.133 1.151 12.597 1.726 19.393 1.726 6.622 0 12.914-.633 18.874-1.899 5.96-1.266 11.187-3.352 15.678-6.257 4.492-2.906 8.048-6.704 10.669-11.394 2.62-4.689 3.93-10.486 3.93-17.391 0-5.006-.749-9.394-2.246-13.163a30.748 30.748 0 0 0-6.479-10.055c-2.821-2.935-6.205-5.567-10.149-7.898-3.945-2.33-8.394-4.531-13.347-6.602-3.628-1.497-6.881-2.949-9.761-4.359-2.879-2.848-5.327-4.316-7.342-4.316-2.016-1.467-3.571-3.021-4.665-4.661-1.094-1.64-1.641-3.495-1.641-5.567 0-1.899.489-3.61 1.468-5.135s2.362-2.834 4.147-3.927c1.785-1.094 3.973-1.942 6.565-2.547 2.591-.604 5.471-.906 8.638-.906 2.304 0 4.737.173 7.299.518 2.563.345 5.14.877 7.732 1.597a53.669 53.669 0 0 1 7.558 2.719 41.7 41.7 0 0 1 6.781 3.797v-25.807c-4.204-1.611-8.797-2.805-13.778-3.582-4.981-.777-10.697-1.165-17.147-1.165-6.565 0-12.784.705-18.658 2.115-5.874 1.409-11.043 3.61-15.506 6.602-4.463 2.993-7.99 6.805-10.582 11.437-2.591 4.632-3.887 10.17-3.887 16.615 0 8.228 2.375 15.248 7.127 21.06 4.751 5.811 11.963 10.731 21.638 14.759a291.458 291.458 0 0 1 10.625 4.575c3.283 1.496 6.119 3.049 8.509 4.66 2.39 1.611 4.276 3.366 5.658 5.265 1.382 1.899 2.073 4.057 2.073 6.474a9.901 9.901 0 0 1-1.296 4.963c-.863 1.524-2.174 2.848-3.93 3.97-1.756 1.122-3.945 1.999-6.565 2.632-2.62.633-5.687.95-9.2.95-5.989 0-11.92-1.05-17.794-3.151-5.875-2.1-11.317-5.25-16.327-9.451Zm-46.036-68.733H140V109H41v22.742h35.345V233h28.137V131.742Z"
                      fill="#fff"
                    />
                  </svg>
                </span>
                <span
                  aria-hidden="true"
                  className="text-fd-muted-foreground text-2xl transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                >
                  ↗
                </span>
              </div>
              <div className="mt-9">
                <span className="text-xs font-semibold tracking-[0.18em] text-sky-700 uppercase dark:text-sky-300">
                  The SDK · TypeScript
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">avanza-ts</h2>
                <p className="mt-3 max-w-sm leading-relaxed text-fd-muted-foreground">
                  A typed client for building your own applications with Avanza data.
                </p>
              </div>
              <div className="mt-auto pt-8">
                <div className="rounded-lg border border-fd-border bg-fd-background px-4 py-3 font-mono text-xs text-fd-muted-foreground sm:text-sm">
                  <span className="text-sky-600 dark:text-sky-400">import</span>{' '}
                  {'{ AvanzaClient }'} <span className="text-sky-600 dark:text-sky-400">from</span>{' '}
                  'avanza-ts'
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 dark:text-sky-300">
                  Explore SDK docs{' '}
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </div>
            </Link>

            <Link
              href="/docs/cli"
              className="group relative flex min-h-100 flex-col overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-7 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500 sm:p-9"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-400 to-teal-600" />
              <div className="flex items-start justify-between">
                <span className="flex size-14 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/15 dark:text-emerald-300">
                  <svg viewBox="0 0 32 32" fill="none" className="size-8" aria-hidden="true">
                    <rect
                      x="2"
                      y="4"
                      width="28"
                      height="24"
                      rx="5"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="m9 12 5 4-5 4m9 0h5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span
                  aria-hidden="true"
                  className="text-fd-muted-foreground text-2xl transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                >
                  ↗
                </span>
              </div>
              <div className="mt-9">
                <span className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase dark:text-emerald-300">
                  The CLI · Terminal
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">avanza-tools (CLI)</h2>
                <p className="mt-3 max-w-sm leading-relaxed text-fd-muted-foreground">
                  Search markets and inspect your accounts, right from the command line.
                </p>
              </div>
              <div className="mt-auto pt-8">
                <div className="rounded-lg border border-fd-border bg-fd-background px-4 py-3 font-mono text-xs text-fd-muted-foreground sm:text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400">$</span> avanza market
                  search --query volvo
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Explore CLI docs{' '}
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </div>
            </Link>
          </div>
          <section
            aria-labelledby="disclaimer-title"
            className="mt-16 border-t border-fd-border pt-8 text-sm leading-relaxed text-fd-muted-foreground"
          >
            <h2 id="disclaimer-title" className="mb-3 font-semibold text-fd-foreground">
              Disclaimer
            </h2>
            <p>
              avanza-ts and avanza-tools are unofficial tools for Avanza&apos;s API. They are not
              affiliated with Avanza Bank AB. The underlying API can be taken down or changed
              without warning at any point in time.
            </p>
            <p className="mt-3">
              The author of this software is not responsible for any indirect damages (foreseeable
              or unforeseeable), such as, if necessary, loss or alteration of or fraudulent access
              to data, accidental transmission of viruses or of any other harmful element, loss of
              profits or opportunities, the cost of replacement goods and services or the attitude
              and behavior of a third party.
            </p>
          </section>
        </div>
      </main>
    </HomeLayout>
  );
}
