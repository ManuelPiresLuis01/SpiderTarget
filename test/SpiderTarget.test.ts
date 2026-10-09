import { describe, expect, it } from 'vitest';
import { createSpiderTarget } from '../src/spider/SpiderTarget';

describe('SpiderTarget', () => {
  it('uses the diagnostic start position and source identity', () => {
    const uri = { toString: () => 'file:///sample.ts' } as never;
    const diagnostic = {
      range: { start: { line: 6, character: 12 } },
      message: 'Unknown name',
      severity: 0
    } as never;
    const target = createSpiderTarget(uri, diagnostic, 0);
    expect(target.position).toEqual({ line: 6, character: 12 });
    expect(target.uri).toBe(uri);
    expect(target.id).toContain('file:///sample.ts:6:12');
  });
});
