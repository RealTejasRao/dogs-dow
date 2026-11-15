# Company enquiries

The `/contact` form submits to Formspree. The local configuration is in the ignored `.env.local` file.

- Form: `dogs & dow — Company enquiries`, ID `xeagewbz`.
- Dashboard: https://formspree.io/forms/xeagewbz/submissions
- Notifications: the Email action in Workflow sends every accepted submission to the verified recipient configured there. The recipient is not published in website code.
- Required provider-side fields: name, email, company, service, brief, and privacy acknowledgement. Minimum and maximum text lengths mirror the website where supported. Personal email addresses are accepted.
- Formshield spam filtering and the hidden `_gotcha` field protect submissions. Turnstile is optional; when a site key is supplied, its matching secret must be configured in Formspree and CAPTCHA enabled there.
- Submission archiving is enabled. The account currently uses the free plan; confirm current submission and retention limits in Formspree before launch.
- A clearly labelled live connection test was accepted, stored, marked delivered by Formspree, and found in the recipient’s Gmail inbox.

## Deployment

Set `NEXT_PUBLIC_FORMSPREE_ID=xeagewbz` in the production hosting environment **before building/deploying**. `.env.local` is intentionally not committed or uploaded. Keep the same form ID to retain the configured notification workflow and validation rules. Do not add the notification recipient as `NEXT_PUBLIC_CONTACT_EMAIL` unless the society explicitly wants it displayed publicly.

After setting the real domain, configure Formspree’s domain restriction, check a live submission from that domain, and verify the inbox. If Turnstile is later added, allow the production domain in its widget configuration too.
