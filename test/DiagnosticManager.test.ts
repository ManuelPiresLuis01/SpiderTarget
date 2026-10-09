import { describe, expect, it, vi } from 'vitest';
import { DiagnosticManager, type DiagnosticsApi } from '../src/diagnostics/DiagnosticManager';

function createDiagnostic(severity: number, line: number): never {
  return {
    severity,
    message: 'diagnostic',
    range: { start: { line, character: 2 } }
  } as never;
}

describe('DiagnosticManager', () => {
  it('identifies errors and ignores warnings unless requested', () => {
    const uri = { toString: () => 'file:///a.ts' } as never;
    const diagnostics = [createDiagnostic(0, 2), createDiagnostic(1, 4)];
    const api: DiagnosticsApi = {
      getDiagnostics: () => [[uri, diagnostics]],
      onDidChangeDiagnostics: () => ({ dispose: () => undefined })
    };
    const manager = new DiagnosticManager(api, false, () => undefined);
    expect(manager.getTargets(uri)).toHaveLength(1);
    manager.setDetectWarnings(true);
    expect(manager.getTargets(uri)).toHaveLength(2);
    manager.dispose();
  });

  it('refreshes changed diagnostics and notifies its listener', () => {
    const uri = { toString: () => 'file:///a.ts' } as never;
    let entries: readonly (readonly [never, readonly never[]])[] = [];
    let listener: ((event: { uris: readonly never[] }) => void) | undefined;
    const api: DiagnosticsApi = {
      getDiagnostics: () => entries,
      onDidChangeDiagnostics: (callback) => {
        listener = callback as (event: { uris: readonly never[] }) => void;
        return { dispose: () => undefined };
      }
    };
    const changed = vi.fn();
    const manager = new DiagnosticManager(api, false, changed);
    entries = [[uri, [createDiagnostic(0, 5)]]];
    listener?.({ uris: [uri] });
    expect(manager.getTargets(uri)[0]?.position.line).toBe(5);
    expect(changed).toHaveBeenCalledOnce();
    manager.dispose();
  });
});
