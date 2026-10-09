import type * as vscode from 'vscode';

export interface SpiderConfiguration {
  count: number;
  speed: number;
  detectWarnings: boolean;
  enabled: boolean;
  randomMovement: boolean;
}

export interface ConfigurationReader {
  get<T>(section: string, defaultValue: T): T;
}

export interface ConfigurationWorkspace {
  getConfiguration(section: string): ConfigurationReader;
  onDidChangeConfiguration(
    listener: (event: vscode.ConfigurationChangeEvent) => void
  ): vscode.Disposable;
}

export class Configuration {
  public static read(config: ConfigurationReader): SpiderConfiguration {
    return {
      count: config.get<number>('count', 3),
      speed: config.get<number>('speed', 1),
      detectWarnings: config.get<boolean>('detectWarnings', false),
      enabled: config.get<boolean>('enabled', true),
      randomMovement: config.get<boolean>('randomMovement', true)
    };
  }

  public static onDidChange(
    workspace: ConfigurationWorkspace,
    listener: (configuration: SpiderConfiguration) => void
  ): vscode.Disposable {
    return workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('spiderCode')) {
        listener(Configuration.read(workspace.getConfiguration('spiderCode')));
      }
    });
  }
}
