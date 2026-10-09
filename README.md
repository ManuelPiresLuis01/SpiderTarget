# Spider Code 🕷️

Tiny spiders walk through your code and stop when they find errors.

Spider Code reads VS Code diagnostics from any language provider. It never edits the document. Spiders are rendered using native text-editor decorations so they follow the editor's scrolling and layout without a webview.

## Features

- Small spiders wander through the visible code.
- Errors are picked up automatically from the VS Code diagnostics API.
- A spider travels to an error and stays while the diagnostic remains.
- Configure the number and speed of spiders.
- Optionally target warning diagnostics.
- Enable, disable, and toggle the animation.

## Installation and development

1. Install Node.js and npm.
2. Run `npm install`.
3. Run `npm run compile`.
4. Open this folder in VS Code and press **F5** to launch the Extension Development Host.
5. Open a file with diagnostics (for example, a TypeScript file with a type error) to see spiders find it.

Run `npm run watch` during development to compile changes continuously.

## Testing and packaging

- `npm test` runs the unit tests.
- `npm run lint` runs ESLint.
- `npm run format:check` checks formatting.
- `npm run package` creates a Marketplace-ready `.vsix` (after compilation).

Before publishing, replace the placeholder publisher in `package.json`, add the public repository URL, review the Marketplace listing metadata, and follow the publisher account's verification requirements. The local package command allows a missing repository while bootstrapping this project.

## Configuration

Settings can be changed in VS Code Settings or `settings.json`:

```json
{
  "spiderCode.count": 5,
  "spiderCode.speed": 1,
  "spiderCode.detectWarnings": false,
  "spiderCode.enabled": true,
  "spiderCode.randomMovement": true
}
```

| Setting | Default | Description |
| --- | ---: | --- |
| `spiderCode.count` | `3` | Number of spiders (1–50). |
| `spiderCode.speed` | `1` | Movement speed multiplier (0.25–4). |
| `spiderCode.detectWarnings` | `false` | Include warning diagnostics as targets. |
| `spiderCode.enabled` | `true` | Show and animate spiders. |
| `spiderCode.randomMovement` | `true` | Let unassigned spiders wander. |

## Commands

- **Spider Code: Enable**
- **Spider Code: Disable**
- **Spider Code: Toggle**
- **Spider Code: Add Spider**
- **Spider Code: Remove Spider**
- **Spider Code: Reset Spiders**

## API and visual limitations

The VS Code Extension API does not expose an arbitrary DOM/canvas overlay positioned over editor pixels. Webviews are separate editor surfaces, not transparent overlays, and would not robustly track editor scroll and layout. This extension therefore uses `TextEditorDecorationType` with an SVG content icon, anchored at a document position. The document text is never changed, and decorations follow scrolling and document edits. Since decorations are attached to text positions, they participate in the editor's visual layout and movement is quantized to line/character positions rather than free pixel coordinates. Only the active text editor is animated; VS Code does not expose the decoration rendering surface needed for a true, independent overlay across all visible editor groups.

Animation uses a single 10 Hz timer while enabled. Diagnostics are cached and refreshed only when VS Code reports diagnostic changes; they are not requested on every animation tick.

## Roadmap

- Additional spider types and skins.
- Optional sounds and webs.
- More expressive leg animations.
- Warning-specific spiders.
- Bug-finding statistics and easter eggs.
