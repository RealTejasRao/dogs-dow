import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultSettings } from '@/lib/defaults';
const mocks = vi.hoisted(() => ({ content: vi.fn() }));
vi.mock('@/lib/content', () => ({ getContent: mocks.content }));
vi.mock('@/app/fonts', () => ({ garet: { className: 'garet' } }));
import PrivacyPage from '@/app/privacy/page';
const base = { settings: defaultSettings };
beforeEach(() => { mocks.content.mockResolvedValue(base); });
describe('published page rendering', () => {
  it('publishes the privacy contact and accurately describes closed recruitment', async () => { const html = renderToStaticMarkup(await PrivacyPage()); expect(html).toContain('mailto:dogsdow.official@gmail.com'); expect(html).toContain('does not currently collect student applications'); expect(html).toContain('2026-11-15'); expect(html).not.toContain('[Privacy Contact Email]'); expect(html.match(/<h2 /g)).toHaveLength(9); });
});
