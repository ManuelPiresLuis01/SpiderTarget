import { describe, expect, it } from 'vitest';
import { SpiderManager } from '../src/spider/SpiderManager';

const bounds = {
  startLine: 0,
  endLine: 20,
  maxCharacter: () => 80
};

describe('SpiderManager', () => {
  it('creates the configured number of spiders', () => {
    expect(new SpiderManager(4, 1).getSpiders()).toHaveLength(4);
  });

  it('adds and removes spiders', () => {
    const manager = new SpiderManager(2, 1);
    manager.addSpider();
    expect(manager.getSpiders()).toHaveLength(3);
    manager.removeSpider();
    expect(manager.getSpiders()).toHaveLength(2);
  });

  it('resets and updates the count', () => {
    const manager = new SpiderManager(2, 1);
    manager.setCount(5);
    expect(manager.getSpiders()).toHaveLength(5);
    manager.reset(3);
    expect(manager.getSpiders()).toHaveLength(3);
  });

  it('assigns different diagnostics to separate spiders and leaves extras wandering', () => {
    const manager = new SpiderManager(3, 1);
    const targets = [
      { id: 'one', uri: {} as never, position: { line: 4, character: 2 }, severity: 0 },
      { id: 'two', uri: {} as never, position: { line: 8, character: 5 }, severity: 0 },
      { id: 'three', uri: {} as never, position: { line: 10, character: 3 }, severity: 0 },
      { id: 'four', uri: {} as never, position: { line: 12, character: 3 }, severity: 0 }
    ];
    manager.tick(targets, bounds, 0.1, true);
    const assigned = manager.getSpiders().map((spider) => spider.target?.id);
    expect(assigned.filter(Boolean)).toHaveLength(3);
    expect(new Set(assigned.filter(Boolean)).size).toBe(3);
  });

  it('releases a spider when its diagnostic disappears', () => {
    const manager = new SpiderManager(1, 1);
    const target = {
      id: 'removed-error',
      uri: {} as never,
      position: { line: 4, character: 2 },
      severity: 0
    };
    manager.tick([target], bounds, 0.1, true);
    expect(manager.getSpiders()[0]?.target?.id).toBe(target.id);
    manager.tick([], bounds, 0.1, true);
    expect(manager.getSpiders()[0]?.target).toBeUndefined();
    expect(manager.getSpiders()[0]?.state).toBe('walking');
  });

  it('keeps spiders without a distinct error free to wander', () => {
    const manager = new SpiderManager(4, 1);
    const target = {
      id: 'single-error',
      uri: {} as never,
      position: { line: 4, character: 2 },
      severity: 0
    };
    manager.tick([target], bounds, 0.1, true);
    expect(manager.getSpiders().filter((spider) => spider.target)).toHaveLength(1);
    expect(manager.getSpiders().filter((spider) => spider.state === 'walking')).toHaveLength(3);
  });
});
