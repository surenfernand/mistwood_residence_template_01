import { HighlandFooter, HighlandHeader, PageHero } from "./Highland.jsx";

/**
 * Privacy / terms pages using the Mistwood home (Highland) theme.
 */
export default function LegalDocumentLayout({
  eyebrow,
  title,
  titleEmphasis,
  lead,
  breadcrumbLabel,
  toc,
  children,
}) {
  const heroTitle = titleEmphasis ? `${title} ${titleEmphasis}` : title;

  return (
    <>
      <HighlandHeader />
      <main>
        <PageHero kicker={eyebrow} title={heroTitle} lede={lead} crumb={breadcrumbLabel} />
        <section className="legal-doc-section ab-story" aria-labelledby="legal-doc-title">
          <div className="mh-wrap legal-doc">
            <LegalToc toc={toc} />
            <article className="legal-doc-article" id="legal-doc-title" data-reveal="right">
              {children}
            </article>
          </div>
        </section>
      </main>
      <HighlandFooter />
    </>
  );
}

function LegalToc({ toc }) {
  return (
    <nav className="legal-toc" aria-label="On this page" data-reveal="left">
      <strong>On this page</strong>
      {toc.map((item) => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}