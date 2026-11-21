import { DEFAULT_PHONE_DIAL_CODE, PHONE_DIAL_CODES, dialCodeLabel } from "../data/phoneDialCodes.js";

const phoneIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8.2 4.8h2.2l1 2.4-1.5 1a11 11 0 0 0 5.9 5.9l1-1.5 2.4 1v2.2c0 .7-.6 1.3-1.3 1.2A14.2 14.2 0 0 1 6.9 6.1c-.1-.7.5-1.3 1.3-1.3Z" />
  </svg>
);

/**
 * @param {"contact" | "booking"} variant
 */
export default function PhoneCountryField({
  variant = "contact",
  dialCode = DEFAULT_PHONE_DIAL_CODE,
  nationalNumber = "",
  onDialCodeChange,
  onNationalChange,
  required = false,
  dialId,
  nationalId,
  nationalName = "phone",
}) {
  const row = (
    <div className="phone-dial-row">
      <select
        id={dialId}
        name={`${nationalName}Dial`}
        className="phone-dial-country"
        aria-label="Country code"
        value={dialCode}
        onChange={(event) => onDialCodeChange(event.target.value)}
        required={required}
      >
        {PHONE_DIAL_CODES.map((item) => (
          <option key={`${item.name}-${item.dial}`} value={item.dial}>
            {dialCodeLabel(item)}
          </option>
        ))}
      </select>
      <input
        id={nationalId}
        name={nationalName}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        className="phone-dial-number"
        placeholder={variant === "contact" ? "76 590 0800" : "Mobile number without country code"}
        value={nationalNumber}
        onChange={(event) => onNationalChange(event.target.value)}
        required={required}
        aria-describedby={dialId ? `${dialId}-hint` : undefined}
      />
    </div>
  );

  if (variant === "booking") {
    return (
      <div className="field phone-country-field">
        <label htmlFor={nationalId}>Phone number</label>
        {row}
        <small className="phone-dial-hint" id={dialId ? `${dialId}-hint` : undefined}>
          Choose your country, then enter your mobile number.
        </small>
      </div>
    );
  }

  return (
    <label className="ct-field phone-country-field">
      <span>
        {phoneIcon}
        Phone Number
        {required ? <em>*</em> : null}
      </span>
      {row}
      <small className="phone-dial-hint">Choose your country code, then enter your mobile number.</small>
    </label>
  );
}