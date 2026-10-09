import * as vscode from 'vscode';
import { Configuration, type SpiderConfiguration } from './config/Configuration';
import { DiagnosticManager } from './diagnostics/DiagnosticManager';
import { EditorOverlay } from './editor/EditorOverlay';
import { SpiderManager } from './spider/SpiderManager';
import type { SpiderTarget } from './spider/SpiderTarget';

const TICK_INTERVAL_MS = 100;

export function activate(context: vscode.ExtensionContext): void {
  let configuration = Configuration.read(vscode.workspace.getConfiguration('spiderCode'));
  const spiders = new SpiderManager(configuration.count, configuration.speed);
  const overlay = new EditorOverlay(context);
  let activeEditor = vscode.window.activeTextEditor;
  let diagnostics: DiagnosticManager;
  let interval: ReturnType<typeof setInterval> | undefined;
  let previousTick = Date.now();
  let currentTargets: SpiderTarget[] = [];

  const refreshTargets = (): void => {
    currentTargets =
      activeEditor && configuration.enabled
        ? diagnostics.getTargets(activeEditor.document.uri).filter((target) => {
            const visibleRange = activeEditor?.visibleRanges[0];
            return (
              visibleRange !== undefined &&
              target.position.line >= visibleRange.start.line &&
              target.position.line <= visibleRange.end.line
            );
          })
        : [];
  };

  const updateView = (): void => {
    if (!configuration.enabled || !activeEditor) {
      overlay.clear(activeEditor);
      return;
    }
    const visibleRange = activeEditor.visibleRanges[0];
    if (!visibleRange) {
      overlay.clear(activeEditor);
      return;
    }
    const bounds = {
      startLine: visibleRange.start.line,
      endLine: visibleRange.end.line,
      maxCharacter: (line: number): number =>
        activeEditor?.document.lineAt(line).text.length ?? 0
    };
    const now = Date.now();
    const deltaSeconds = Math.min((now - previousTick) / 1000, 0.25);
    previousTick = now;
    spiders.tick(
      currentTargets,
      bounds,
      deltaSeconds,
      configuration.randomMovement
    );
    overlay.render(activeEditor, spiders.getSpiders());
  };

  diagnostics = new DiagnosticManager(
    vscode.languages,
    configuration.detectWarnings,
    () => {
      refreshTargets();
      updateView();
    }
  );
  refreshTargets();

  const startAnimation = (): void => {
    if (!interval && configuration.enabled && activeEditor) {
      previousTick = Date.now();
      interval = setInterval(updateView, TICK_INTERVAL_MS);
    }
  };
  const stopAnimation = (): void => {
    if (interval) {
      clearInterval(interval);
      interval = undefined;
    }
    overlay.clear(activeEditor);
  };
  const applyConfiguration = (next: SpiderConfiguration): void => {
    configuration = next;
    spiders.setCount(next.count);
    spiders.setSpeed(next.speed);
    diagnostics.setDetectWarnings(next.detectWarnings);
    refreshTargets();
    if (next.enabled) {
      startAnimation();
    } else {
      stopAnimation();
    }
    updateView();
  };

  context.subscriptions.push(
    overlay,
    diagnostics,
    Configuration.onDidChange(vscode.workspace, applyConfiguration),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      overlay.clear(activeEditor);
      activeEditor = editor;
      previousTick = Date.now();
      refreshTargets();
      if (editor && configuration.enabled) {
        startAnimation();
      } else {
        stopAnimation();
      }
      updateView();
    }),
    vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
      if (event.textEditor === activeEditor) {
        refreshTargets();
        updateView();
      }
    }),
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (activeEditor && event.document.uri.toString() === activeEditor.document.uri.toString()) {
        updateView();
      }
    }),
    vscode.workspace.onDidChangeWorkspaceFolders(updateView),
    vscode.commands.registerCommand('spiderCode.enable', async () => {
      await vscode.workspace.getConfiguration('spiderCode').update('enabled', true, true);
    }),
    vscode.commands.registerCommand('spiderCode.disable', async () => {
      await vscode.workspace.getConfiguration('spiderCode').update('enabled', false, true);
    }),
    vscode.commands.registerCommand('spiderCode.toggle', async () => {
      await vscode.workspace
        .getConfiguration('spiderCode')
        .update('enabled', !configuration.enabled, true);
    }),
    vscode.commands.registerCommand('spiderCode.addSpider', async () => {
      const count = Math.min(50, configuration.count + 1);
      await vscode.workspace.getConfiguration('spiderCode').update('count', count, true);
    }),
    vscode.commands.registerCommand('spiderCode.removeSpider', async () => {
      const count = Math.max(1, configuration.count - 1);
      await vscode.workspace.getConfiguration('spiderCode').update('count', count, true);
    }),
    vscode.commands.registerCommand('spiderCode.resetSpiders', () => {
      spiders.reset(configuration.count);
      updateView();
    })
  );

  context.subscriptions.push({ dispose: stopAnimation });
  startAnimation();
  updateView();
}

export function deactivate(): void {
  // Extension subscriptions dispose the diagnostics listener and overlay.
}
