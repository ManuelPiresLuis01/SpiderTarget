import { Spider } from './Spider';
import { SpiderMovement, type MovementBounds } from './SpiderMovement';
import type { SpiderPosition, SpiderTarget } from './SpiderTarget';

const MAX_SPIDERS = 50;
const DEFAULT_VELOCITY = 5;

export class SpiderManager {
  private spiders: Spider[] = [];
  private nextId = 1;
  private readonly movement = new SpiderMovement();

  public constructor(count: number, private speed: number) {
    this.setCount(count);
  }

  public getSpiders(): readonly Spider[] {
    return this.spiders;
  }

  public setCount(count: number): void {
    const nextCount = this.clampCount(count);
    while (this.spiders.length < nextCount) {
      this.addSpider();
    }
    while (this.spiders.length > nextCount) {
      this.removeSpider();
    }
  }

  public addSpider(): void {
    if (this.spiders.length >= MAX_SPIDERS) {
      return;
    }
    const position: SpiderPosition = {
      line: Math.random() * 10,
      character: Math.random() * 30
    };
    this.spiders.push(new Spider(`spider-${this.nextId++}`, position, DEFAULT_VELOCITY));
  }

  public removeSpider(): void {
    this.spiders.pop();
  }

  public reset(count: number): void {
    this.spiders = [];
    this.setCount(count);
  }

  public setSpeed(speed: number): void {
    this.speed = speed;
  }

  public tick(
    targets: readonly SpiderTarget[],
    bounds: MovementBounds,
    deltaSeconds: number,
    randomMovement: boolean
  ): void {
    const assignments = this.assignTargets(targets);
    for (const spider of this.spiders) {
      this.movement.update(
        spider,
        assignments.get(spider.id) ?? [],
        bounds,
        deltaSeconds,
        this.speed,
        randomMovement
      );
    }
  }

  private assignTargets(targets: readonly SpiderTarget[]): Map<string, SpiderTarget[]> {
    const assignments = new Map<string, SpiderTarget[]>();
    const usedTargets = new Set<string>();
    const assignedSpiders = new Set<string>();

    for (const spider of this.spiders) {
      const existing = spider.target
        ? targets.find((target) => target.id === spider.target?.id)
        : undefined;
      if (existing && !usedTargets.has(existing.id)) {
        assignments.set(spider.id, [existing]);
        usedTargets.add(existing.id);
        assignedSpiders.add(spider.id);
      } else {
        spider.target = undefined;
      }
    }

    for (const target of targets) {
      if (usedTargets.has(target.id)) {
        continue;
      }
      const spider = this.spiders.find((candidate) => !assignedSpiders.has(candidate.id));
      if (!spider) {
        break;
      }
      assignments.set(spider.id, [target]);
      usedTargets.add(target.id);
      assignedSpiders.add(spider.id);
    }
    return assignments;
  }

  private clampCount(count: number): number {
    return Math.min(MAX_SPIDERS, Math.max(1, Math.floor(count)));
  }
}
