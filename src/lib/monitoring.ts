const sensitive = /email|name|company|brief|message|authorization|cookie|token|password|form|body|user/i;
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 8) return '[truncated]';
  if (typeof value === 'string') return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]').replace(/(https?:\/\/[^\s?#]+)[?#][^\s]*/g, '$1');
  if (Array.isArray(value)) return value.map(item => redact(item, depth + 1));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key]) => !sensitive.test(key)).map(([key, item]) => [key, redact(item, depth + 1)]));
  return value;
}
