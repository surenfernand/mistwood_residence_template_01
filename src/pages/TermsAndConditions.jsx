import LegalDocumentLayout from "../components/LegalDocumentLayout.jsx";
import { usePublicSettings } from "../hooks/usePublicSettings.js";
import { useSiteTitle } from "../hooks/useSiteTitle.js";
import { formatSettingsTime } from "../utils/formatSettingsTime.js";

const TOC = [
  { href: "#booking", label: "Bookings & payment" },
  { href: "#stay", label: "Your stay" },
  { href: "#changes", label: "Changes & cancellation" },
  { href: "#liability", label: "Liability" },
  { href: "#contact", label: "Contact" },
];

const LAST_UPDATED = "November 21, 2026";

export default function TermsAndConditions() {
  const pub = usePublicSettings();
  useSiteTitle("Terms & Conditions");

  const checkIn = formatSettingsTime(pub.checkInTime || "14:00");
  const checkOut = formatSettingsTime(pub.checkOutTime || "11:00");
  const balanceNote = pub.requireDeposit === false
    ? "in full at the time of booking."
    : `with the remaining balance due at check-in (a ${pub.depositPercent}% deposit is collected when the booking is confirmed).`;

  return (
    <LegalDocumentLayout
      eyebrow="Guest terms"
      title="Stay well."
      titleEmphasis="Know the details."
      lead="These Terms & Conditions set out the basis on which stays at Mistwood Residence are offered and booked."
      breadcrumbLabel="Terms & Conditions"
      toc={TOC}
    >
      <p>
        These are editable template terms, not final legal advice. Set your actual cancellation and house rules, and
        obtain a legal review before publishing.
      </p>
      <span className="legal-date">Last updated: {LAST_UPDATED}</span>

      <h2 id="booking">Bookings &amp; payment</h2>
      <p>
        A booking is confirmed when we accept it and receive the required deposit or full payment. Prices are shown in
        Sri Lankan Rupees (LKR) unless stated otherwise. The balance, if any, is due {balanceNote}
      </p>
      <p>
        You must provide accurate contact, guest, and stay information. The person making the reservation must be at
        least 18 years old and is responsible for all guests in the party.
      </p>

      <h2 id="stay">Arrival, departure &amp; house rules</h2>
      <p>
        Check-in is available from {checkIn} on the arrival date. Check-out is by {checkOut} on the departure date.
        Early arrival or late departure is subject to availability and may incur an additional charge.
      </p>
      <p>
        Guests must treat the apartment, furnishings, and neighbouring properties with care and follow reasonable staff
        instructions. Smoking, parties, unregistered visitors, pets, and commercial activity are not permitted unless
        agreed in writing in advance. Damage, missing items, excessive cleaning, or breaches of house rules may result
        in additional charges.
      </p>

      <h2 id="changes">Changes, cancellation &amp; refunds</h2>
      <p>
        To request a change or cancellation, contact us at{" "}
        <a href={`mailto:${pub.contactEmail}`}>{pub.contactEmail}</a>
        {pub.contactPhone ? (
          <>
            {" "}
            or <a href={`tel:${pub.contactPhone.replace(/\s/g, "")}`}>{pub.contactPhone}</a>
          </>
        ) : null}
        . Our cancellation policy is: {pub.cancellationPolicy} Any approved refund is returned using the original payment
        method where possible.
      </p>

      <h2 id="liability">Liability &amp; force majeure</h2>
      <p>
        To the fullest extent permitted by law, {pub.propertyName} is not liable for loss, damage, delay, or expense
        caused by events beyond our reasonable control, including severe weather, natural disasters, transport
        disruption, utility failure, government action, or public-health events.
      </p>
      <p>
        Nothing in these terms excludes liability that cannot legally be excluded. Guests remain responsible for their
        personal belongings and for loss or damage caused by them or anyone in their party.
      </p>

      <h2 id="contact">Contact &amp; governing law</h2>
      <p>
        Questions about a reservation should be sent to{" "}
        <a href={`mailto:${pub.contactEmail}`}>{pub.contactEmail}</a>
        {pub.contactPhone ? (
          <>
            {" "}
            or <a href={`tel:${pub.contactPhone.replace(/\s/g, "")}`}>{pub.contactPhone}</a>
          </>
        ) : null}
        . These terms are governed by the laws of Sri Lanka, unless applicable law requires otherwise.
      </p>

    </LegalDocumentLayout>
  );
}