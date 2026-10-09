import type { Spider } from './Spider';
import type { SpiderPosition, SpiderTarget } from './SpiderTarget';

export type MovementBounds = {
  startLine: number;
  endLine: number;
  maxCharacter: (line: number) => number;
};

const ARRIVAL_DISTANCE = 0.7;
const ROAM_DISTANCE = 1.2;

export class SpiderMovement {
  public update(
    spider: Spider,
    targets: readonly SpiderTarget[],
    bounds: MovementBounds,
    deltaSeconds: number,
    speed: number,
    randomMovement: boolean,
    random: () => number = Math.random
  ): void {
    this.setTarget(spider, targets);
    if (spider.target) {
      this.moveTowards(spider, spider.target.position, deltaSeconds, speed);
      if (this.distance(spider.position, spider.target.position) <= ARRIVAL_DISTANCE) {
        spider.position = { ...spider.target.position };
        spider.state = 'stopped-at-error';
      } else {
        spider.state = 'moving-to-error';
      }
      return;
    }

    spider.state = 'walking';
    if (!randomMovement) {
      return;
    }
    if (this.distance(spider.position, spider.roamTarget) <= ROAM_DISTANCE) {
      spider.roamTarget = this.randomPosition(bounds, random);
    }
    this.moveTowards(spider, spider.roamTarget, deltaSeconds, speed);
    spider.position.line = this.clamp(spider.position.line, bounds.startLine, bounds.endLine);
    spider.position.character = this.clamp(
      spider.position.character,
      0,
      bounds.maxCharacter(Math.round(spider.position.line))
    );
  }

  private setTarget(spider: Spider, targets: readonly SpiderTarget[]): void {
    spider.target =
      spider.target && targets.some((target) => target.id === spider.target?.id)
        ? spider.target
        : targets[0];
  }

  private moveTowards(
    spider: Spider,
    target: SpiderPosition,
    deltaSeconds: number,
    speed: number
  ): void {
    const lineDifference = target.line - spider.position.line;
    const characterDifference = target.character - spider.position.character;
    const distance = Math.hypot(lineDifference, characterDifference);
    if (distance === 0) {
      return;
    }
    spider.direction = Math.atan2(lineDifference, characterDifference);
    const step = Math.min(distance, spider.velocity * speed * deltaSeconds);
    spider.position.line += (lineDifference / distance) * step;
    spider.position.character += (characterDifference / distance) * step;
  }

  private randomPosition(bounds: MovementBounds, random: () => number): SpiderPosition {
    const lineSpan = Math.max(0, bounds.endLine - bounds.startLine);
    const line = bounds.startLine + random() * lineSpan;
    const maxCharacter = bounds.maxCharacter(Math.round(line));
    return {
      line,
      character: random() * Math.max(0, maxCharacter)
    };
  }

  private distance(first: SpiderPosition, second: SpiderPosition): number {
    return Math.hypot(first.line - second.line, first.character - second.character);
  }

  private clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), maximum);
  }
}
