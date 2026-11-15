# On-site student applications

- All student recruitment links lead to `/apply`, a minimal announcement with a countdown and photograph. No application form is currently rendered. The form component and API are retained for a later launch.
- The displayed date, **15 January 2027**, is a rough estimate and may vary. The countdown currently targets 00:00 IST (`2027-01-14T18:30:00Z`). Update `src/lib/recruitment.ts` if the estimate changes. The dormant submission API rejects early submissions and requires recruitment to be enabled separately.
- Enable **Recruitment → Enable on-site applications** in Sanity when the society is ready. The date alone never enables submission or overrides a closed recruitment setting.
- Create a separate society-owned Formspree form, verify its notification recipients, and set `RECRUITMENT_FORMSPREE_ID` on the server. Keep application storage and access separate from company enquiries.
- Configure `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and the matching server-only `TURNSTILE_SECRET_KEY`, with the production domain allowed in Cloudflare.
- The server verifies Turnstile before forwarding to Formspree. Do not enable a second Formspree CAPTCHA on the recruitment form: Turnstile tokens are single-use and are verified by this website.
- Configure provider-side required fields and spam controls. Test a successful delivery to the recruitment inbox, invalid entries, expired CAPTCHA, rejection, and retry before publishing recruitment as open.
- Submissions are accepted only after provider confirmation. Errors retain entered answers. No CV uploads or personal information in analytics events.
- Review application access and retention with the recruitment team; remove records when no longer needed. Review `/privacy` before launch.
