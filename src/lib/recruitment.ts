export const RECRUITMENT_OPENS_AT = '2027-01-15T00:00:00+05:30';
export const RECRUITMENT_OPENING_LABEL = '15 January 2027';
export const recruitmentOpeningTime = Date.parse(RECRUITMENT_OPENS_AT);

export function countdownParts(now: number) {
  const seconds = Math.max(0, Math.floor((recruitmentOpeningTime - now) / 1000));
  return { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 };
}

export function recruitmentIsOpen(enabled: boolean, now = Date.now()) {
  return enabled && now >= recruitmentOpeningTime;
}
