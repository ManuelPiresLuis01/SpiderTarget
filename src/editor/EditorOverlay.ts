import * as vscode from 'vscode';
import type { Spider } from '../spider/Spider';

export class EditorOverlay implements vscode.Disposable {
  private readonly decoration: vscode.TextEditorDecorationType;

  public constructor(context: vscode.ExtensionContext) {
    this.decoration = vscode.window.createTextEditorDecorationType({
      before: {
        contentIconPath: vscode.Uri.joinPath(context.extensionUri, 'media', 'spider.svg'),
        width: '16px',
        height: '16px',
        margin: '0 0 0 -16px'
      },
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
    });
  }

  public render(editor: vscode.TextEditor | undefined, spiders: readonly Spider[]): void {
    if (!editor) {
      return;
    }
    const decorations: vscode.DecorationOptions[] = [];
    for (const spider of spiders) {
      const line = Math.max(0, Math.min(editor.document.lineCount - 1, Math.round(spider.position.line)));
      const lineLength = editor.document.lineAt(line).text.length;
      const character = Math.max(0, Math.min(lineLength, Math.round(spider.position.character)));
      decorations.push({
        range: new vscode.Range(line, character, line, character),
        hoverMessage:
          spider.state === 'stopped-at-error'
            ? 'Spider Code found a diagnostic'
            : 'Spider Code'
      });
    }
    editor.setDecorations(this.decoration, decorations);
  }

  public clear(editor: vscode.TextEditor | undefined): void {
    editor?.setDecorations(this.decoration, []);
  }

  public dispose(): void {
    this.decoration.dispose();
  }
}
