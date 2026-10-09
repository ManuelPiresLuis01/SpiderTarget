import { describe, expect, it } from 'vitest';
import { Configuration, type ConfigurationReader } from '../src/config/Configuration';

describe('Configuration', () => {
  it('reads the expected default values', () => {
    const config: ConfigurationReader = {
      get: <T>(_section: string, defaultValue: T): T => defaultValue
    };
    expect(Configuration.read(config)).toEqual({
      count: 3,
      speed: 1,
      detectWarnings: false,
      enabled: true,
      randomMovement: true
    });
  });

  it('reads changed values from the VS Code configuration', () => {
    const values: Record<string, unknown> = {
      count: 7,
      speed: 2,
      detectWarnings: true,
      enabled: false,
      randomMovement: false
    };
    const config: ConfigurationReader = {
      get: <T>(section: string, defaultValue: T): T =>
        (values[section] as T | undefined) ?? defaultValue
    };
    expect(Configuration.read(config)).toEqual({
      count: 7,
      speed: 2,
      detectWarnings: true,
      enabled: false,
      randomMovement: false
    });
  });

  it('notifies listeners when Spider Code settings change', () => {
    const values: Record<string, unknown> = { count: 6 };
    let configurationListener:
      | ((event: { affectsConfiguration: (section: string) => boolean }) => void)
      | undefined;
    const workspace = {
      getConfiguration: () => ({
        get: <T>(section: string, defaultValue: T): T =>
          (values[section] as T | undefined) ?? defaultValue
      }),
      onDidChangeConfiguration: (listener: typeof configurationListener) => {
        configurationListener = listener;
        return { dispose: () => undefined };
      }
    };
    let changedCount = 0;
    Configuration.onDidChange(workspace, (configuration) => {
      changedCount = configuration.count;
    });
    configurationListener?.({ affectsConfiguration: () => true });
    expect(changedCount).toBe(6);
  });
});
