import type * as vscode from 'vscode';
import { createSpiderTarget, type SpiderTarget } from '../spider/SpiderTarget';

export interface DiagnosticsApi {
  getDiagnostics(): readonly (readonly [vscode.Uri, readonly vscode.Diagnostic[]])[];
  onDidChangeDiagnostics(
    listener: (event: vscode.DiagnosticChangeEvent) => void
  ): vscode.Disposable;
}

export class DiagnosticManager implements vscode.Disposable {
  private readonly diagnosticsByUri = new Map<string, readonly vscode.Diagnostic[]>();
  private readonly subscription: vscode.Disposable;
  private detectWarnings: boolean;
  private readonly changeListener: () => void;

  public constructor(
    api: DiagnosticsApi,
    detectWarnings: boolean,
    onChange: () => void
  ) {
    this.detectWarnings = detectWarnings;
    this.changeListener = onChange;
    this.replaceDiagnostics(api.getDiagnostics());
    this.subscription = api.onDidChangeDiagnostics((event) => {
      const diagnosticsByUri = new Map(
        api.getDiagnostics().map(([uri, diagnostics]) => [uri.toString(), diagnostics])
      );
      for (const uri of event.uris) {
        const diagnostics = diagnosticsByUri.get(uri.toString());
        if (diagnostics) {
          this.diagnosticsByUri.set(uri.toString(), diagnostics);
        } else {
          this.diagnosticsByUri.delete(uri.toString());
        }
      }
      this.changeListener();
    });
  }

  public setDetectWarnings(detectWarnings: boolean): void {
    if (this.detectWarnings !== detectWarnings) {
      this.detectWarnings = detectWarnings;
      this.changeListener();
    }
  }

  public getTargets(uri: vscode.Uri): SpiderTarget[] {
    const diagnostics = this.diagnosticsByUri.get(uri.toString()) ?? [];
    return diagnostics
      .filter(
        (diagnostic) =>
          diagnostic.severity === 0 ||
          (this.detectWarnings && diagnostic.severity === 1)
      )
      .map((diagnostic, index) => createSpiderTarget(uri, diagnostic, index));
  }

  public dispose(): void {
    this.subscription.dispose();
    this.diagnosticsByUri.clear();
  }

  private replaceDiagnostics(
    entries: readonly (readonly [vscode.Uri, readonly vscode.Diagnostic[]])[]
  ): void {
    this.diagnosticsByUri.clear();
    for (const [uri, diagnostics] of entries) {
      this.diagnosticsByUri.set(uri.toString(), diagnostics);
    }
  }
}
