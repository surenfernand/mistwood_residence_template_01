import { Link } from "react-router-dom";
import LegalDocumentLayout from "../components/LegalDocumentLayout.jsx";
import { usePublicSettings } from "../hooks/usePublicSettings.js";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

const TOC = [
  { href: "#information", label: "Information we collect" },
  { href: "#use", label: "How we use it" },
  { href: "#sharing", label: "Sharing & security" },
  { href: "#rights", label: "Your choices" },
  { href: "#contact", label: "Contact us" },
];

const LAST_UPDATED = "November 21, 2026";

export default function PrivacyPolicy() {
  const pub = usePublicSettings();
  useSiteTitle("Privacy Policy");

  return (
    <LegalDocumentLayout
      eyebrow="Your privacy"
      title="Privacy, handled"
      titleEmphasis="with care."
      lead="How Mistwood Residence collects, uses, shares, and protects the information you give us when you enquire, book, or stay with us."
      breadcrumbLabel="Privacy Policy"
      toc={TOC}
    >
      <p>
        This Privacy Policy applies to the {pub.propertyName} website, booking process, guest accounts, and
        communications. Please replace any remaining placeholder details and have the final text reviewed before
        publishing.
      </p>
      <span className="legal-date">Last updated: {LAST_UPDATED}</span>

      <h2 id="information">Information we collect</h2>
      <p>
        We collect information you provide when you contact us, make a booking, create a guest account, or communicate
        with us. This may include your name, email address, telephone number, country code, stay dates, number of
        guests, booking notes, and messages.
      </p>
      <p>
        Our payment provider processes card and payment information. {pub.propertyName} does not store full card numbers
        or card security codes on this website.
      </p>

      <h2 id="use">How we use your information</h2>
      <p>
        We use your information to respond to enquiries, confirm and manage reservations, process payments, provide guest
        support, send essential booking communications, prevent fraud, and comply with legal obligations.
      </p>
      <p>
        With your permission where required, we may also send occasional information about stays or offers. You may opt
        out of promotional messages at any time.
      </p>

      <h2 id="sharing">Sharing, retention &amp; security</h2>
      <p>
        We share only the information needed with trusted service providers that help us run the property and website,
        such as our payment processor, email provider, booking tools, and professional advisers. We do not sell personal
        information.
      </p>
      <p>
        We retain booking and communication records for as long as reasonably necessary for guest service, accounting,
        legal, and operational purposes. We use reasonable technical and organisational measures to protect information,
        but no internet transmission or storage system is completely secure.
      </p>

      <h2 id="rights">Your choices</h2>
      <p>
        You may ask us to access, correct, update, or delete your personal information, subject to applicable law and
        legitimate record-keeping obligations. You may also ask questions about how we process your information.
      </p>

      <h2 id="contact">Contact us</h2>
      <p>
        For privacy questions or requests, contact{" "}
        <a href={`mailto:${pub.contactEmail}`}>{pub.contactEmail}</a> or write to: {pub.propertyName},{" "}
        {pub.publicAddress}, Sri Lanka.
      </p>

      <aside className="legal-notice">
        <strong>Publishing checklist.</strong> Replace all bracketed fields, confirm the business contact details and
        retention periods, and obtain legal review for the jurisdictions in which you market and accept bookings. See also{" "}
        <Link to="/policies">guest policies</Link> and <Link to="/terms-and-conditions">terms &amp; conditions</Link>.
      </aside>
    </LegalDocumentLayout>
  );
}