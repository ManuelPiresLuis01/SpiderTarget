import type { SpiderPosition, SpiderTarget } from './SpiderTarget';

export type SpiderState = 'walking' | 'moving-to-error' | 'stopped-at-error';

export class Spider {
  public state: SpiderState = 'walking';
  public target: SpiderTarget | undefined;
  public roamTarget: SpiderPosition;
  public direction = 0;
  public velocity: number;

  public constructor(
    public readonly id: string,
    public position: SpiderPosition,
    velocity: number
  ) {
    this.velocity = velocity;
    this.roamTarget = { ...position };
  }
}
