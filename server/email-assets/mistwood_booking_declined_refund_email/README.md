# Mistwood Residence — Reservation Unavailable & Refund Initiated

This guest email is for a paid booking that an authorised admin cannot honour. It should be sent only after the refund has been successfully initiated with PayHere and the result has been recorded.

## Fields

- `{{guest_name}}`
- `{{reservation_reference}}`
- `{{check_in_date}}`, `{{check_out_date}}`
- `{{refund_amount}}` (for example, `LKR 12,500.00`)
- `{{refund_timeframe}}` (use the provider-confirmed timeframe; do not invent one)
- `{{contact_email}}`, `{{phone_e164}}`, `{{display_phone}}`

## Delivery safeguards

1. Escape every guest and booking field before inserting it into HTML.
2. Send this email only after a verified PayHere refund result is stored. If the refund request fails, retain the booking and show the admin an error instead.
3. Include the PayHere payment/refund reference in the audit log, but do not expose it to the guest unless needed.
4. Do not state that money has been returned immediately; the wording correctly says it has been *initiated* and explains that the bank/provider may take time.
