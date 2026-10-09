import type * as vscode from 'vscode';

export type SpiderPosition = {
  line: number;
  character: number;
};

export type SpiderTarget = {
  id: string;
  uri: vscode.Uri;
  position: SpiderPosition;
  severity: vscode.DiagnosticSeverity;
};

export function createSpiderTarget(
  uri: vscode.Uri,
  diagnostic: vscode.Diagnostic,
  index: number
): SpiderTarget {
  return {
    id: `${uri.toString()}:${diagnostic.range.start.line}:${diagnostic.range.start.character}:${diagnostic.message}:${index}`,
    uri,
    position: {
      line: diagnostic.range.start.line,
      character: diagnostic.range.start.character
    },
    severity: diagnostic.severity
  };
}
