import DOMPurify from "dompurify";
import { ShieldCheck } from "lucide-react";
import Button from "../components/common/Button";
import { Glow, Grain } from "../components/common/Decor";
import LoadError from "../components/common/LoadError";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Reveal from "../components/common/Reveal";
import { formatPolicyDate } from "../helpers/formatPolicyDate";
import { addHeadingIds, type PolicyHeading } from "../helpers/policyHeadings";
import { sanitizePolicyHtml } from "../helpers/sanitizeHtml";
import usePrivacyPageData from "../hooks/usePrivacyPageData";
import useScrollSpy from "../hooks/useScrollSpy";
import type { PrivacyPolicyFields } from "../type";

export const CAI_URL = "https://www.cai.gouv.qc.ca";

const OFFICER_ID = "responsable";
const OFFICER_HEADING = "Responsable de la protection des renseignements personnels";

// DOMPurify needs a DOM. During the build-time prerender there is none, and
// the content was already sanitized with a jsdom window (scripts/prerender.mjs)
const sanitize = (html: string) =>
  typeof window === "undefined" ? html : sanitizePolicyHtml(html, DOMPurify);

const pad = (n: number) => String(n).padStart(2, "0");

const OfficerCard = ({ fields }: { fields: PrivacyPolicyFields | null }) => {
  const email = fields?.officeremail?.trim();
  // Empty fields are left out rather than shown blank
  const details = [
    { label: "Nom", value: fields?.responsableNom },
    { label: "Fonction", value: fields?.responsableTitre },
    {
      label: "Courriel",
      value: email && (
        <a
          href={`mailto:${email}`}
          className="underline underline-offset-4 hover:text-secondary transition-colors"
        >
          {email}
        </a>
      ),
    },
    { label: "Adresse postale", value: fields?.officeraddress },
  ].filter((detail) => detail.value);

  return (
    <section
      id={OFFICER_ID}
      aria-labelledby={`${OFFICER_ID}-title`}
      className="mt-14 flex flex-col items-start gap-5 rounded-3xl border border-line bg-white/[0.02] p-6 md:p-10"
    >
      <span className="grid size-12 place-items-center rounded-full bg-secondary/10 text-secondary ring-1 ring-secondary/20">
        <ShieldCheck size={22} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h2 id={`${OFFICER_ID}-title`} className="display text-cream text-2xl md:text-3xl">
        {OFFICER_HEADING}
      </h2>
      <p className="text-muted leading-relaxed">
        Pour toute question sur cette politique ou pour exercer vos droits,
        écrivez-nous. Vous pouvez aussi joindre la{" "}
        <a
          href={CAI_URL}
          target="_blank"
          rel="noopener"
          className="text-cream underline underline-offset-4 hover:text-secondary transition-colors"
        >
          Commission d’accès à l’information du Québec
        </a>
        .
      </p>
      {details.length > 0 && (
        <dl className="w-full grid grid-cols-1 sm:grid-cols-2 border-t border-line">
          {details.map((detail) => (
            <div key={detail.label} className="py-5 sm:pr-4 border-b border-line">
              <dt className="text-xs uppercase tracking-[0.16em] text-cream/60">{detail.label}</dt>
              <dd className="mt-2 font-display text-lg text-cream break-words whitespace-pre-line">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <Button label="Nous écrire" variant="secondary" asLink to="/#contactForm" withArrow />
    </section>
  );
};

// "Sur cette page": follows the section being read, like the header's nav
const TableOfContents = ({ entries }: { entries: PolicyHeading[] }) => {
  const activeId = useScrollSpy(entries.map((entry) => entry.id));

  return (
    <nav aria-label="Sur cette page">
      <p className="text-xs uppercase tracking-[0.16em] text-cream/60 mb-4">
        Sur cette page
      </p>
      <ol className="flex flex-col gap-1 text-sm">
        {entries.map((entry, index) => {
          const isActive = entry.id === activeId;
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`flex gap-3 rounded-lg py-1.5 transition-colors ${
                  isActive ? "text-secondary" : "text-cream/70 hover:text-cream"
                }`}
              >
                <span className="text-secondary tabular-nums" aria-hidden="true">
                  {pad(index + 1)}
                </span>
                {entry.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const PrivacyPolicy = () => {
  const { page, isLoading, isError } = usePrivacyPageData();

  if (isLoading) return <LoadingSpinner />;
  if (isError || !page) return <LoadError />;

  const fields = page.politiqueDeConfidentialite;
  const updatedAt = formatPolicyDate(fields?.derniereMiseAJour);
  const { html, headings } = addHeadingIds(sanitize(page.content));
  // The table of contents lists every section, then the officer card
  const tocEntries = [...headings, { id: OFFICER_ID, title: "Nous joindre" }];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink pt-36 pb-16 md:pt-44 md:pb-24">
        <div className="absolute inset-0 -z-10">
          <Glow color="brand" className="left-[-12%] top-[-20%] size-[36rem]" />
          <Glow color="secondary" className="right-[-8%] bottom-[-30%] size-[28rem]" />
          <Grain />
        </div>
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <Reveal className="flex flex-col gap-6 max-w-3xl">
            <p className="eyebrow">Informations légales</p>
            <h1 className="display text-cream text-[clamp(2.5rem,5vw,4rem)]">{page.title}</h1>
            {fields?.intro && (
              <p className="text-lg leading-relaxed text-muted whitespace-pre-line">{fields.intro}</p>
            )}
            {updatedAt && (
              <p className="text-sm text-cream/60">Dernière mise à jour : {updatedAt}</p>
            )}
          </Reveal>
        </div>
      </section>

      {/* Section's classes without its overflow-hidden, which would trap the
          sticky table of contents (it has no decor to clip here) */}
      <section className="border-t border-line bg-ink-raised py-24 md:py-36">
        <div className="mx-auto max-w-6xl px-6 md:px-10 grid gap-14 lg:grid-cols-[16rem_1fr] lg:gap-20 items-start">
          <aside className="lg:sticky lg:top-28 rounded-3xl border border-line bg-white/[0.02] p-6 lg:border-0 lg:bg-transparent lg:p-0">
            <TableOfContents entries={tocEntries} />
          </aside>

          <article className="max-w-[68ch]">
            {/* WordPress editor content, sanitized; styled by .policy-body */}
            <div className="policy-body" dangerouslySetInnerHTML={{ __html: html }} />
            <OfficerCard fields={fields} />
          </article>
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicy;
