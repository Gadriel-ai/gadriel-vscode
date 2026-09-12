import * as vscode from 'vscode';

// Resolve how to launch the gadriel MCP server (and CLI):
//  - gadriel.command setting, if set (absolute path or a name on PATH)
//  - otherwise `npx -y gadriel@<version> …` (requires Node)
function resolveLauncher(): { command: string; baseArgs: string[] } {
  const cfg = vscode.workspace.getConfiguration('gadriel');
  const explicit = (cfg.get<string>('command') || '').trim();
  if (explicit) {
    return { command: explicit, baseArgs: [] };
  }
  const version = (cfg.get<string>('version') || '1.4.0').trim() || '1.4.0';
  return { command: 'npx', baseArgs: ['-y', `gadriel@${version}`] };
}

export function activate(context: vscode.ExtensionContext): void {
  // 1) Register the Gadriel MCP server so Copilot/Chat can use its tools with
  //    no hand-editing of .vscode/mcp.json.
  const didChange = new vscode.EventEmitter<void>();
  const provider: vscode.McpServerDefinitionProvider = {
    onDidChangeMcpServerDefinitions: didChange.event,
    provideMcpServerDefinitions: async () => {
      const { command, baseArgs } = resolveLauncher();
      return [
        new vscode.McpStdioServerDefinition(
          'Gadriel',
          command,
          [...baseArgs, 'code', 'mcp'],
          {},
          '1.4.0'
        )
      ];
    },
    resolveMcpServerDefinition: async (server) => server
  };
  context.subscriptions.push(
    vscode.lm.registerMcpServerDefinitionProvider('gadriel.mcp', provider),
    didChange
  );

  // Re-evaluate the server definition if the launch settings change.
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('gadriel.command') || e.affectsConfiguration('gadriel.version')) {
        didChange.fire();
      }
    })
  );

  // 2) A "Scan Repository" command that runs a full scan (which writes
  //    .security/ and produces the findings/report) in an integrated terminal.
  context.subscriptions.push(
    vscode.commands.registerCommand('gadriel.scan', () => {
      const folder = vscode.workspace.workspaceFolders?.[0];
      if (!folder) {
        void vscode.window.showWarningMessage('Gadriel: open a folder to scan.');
        return;
      }
      const { command, baseArgs } = resolveLauncher();
      const argv = [command, ...baseArgs, 'code', 'scan'].map(quote).join(' ');
      const term = vscode.window.createTerminal({ name: 'Gadriel Scan', cwd: folder.uri.fsPath });
      term.show(true);
      term.sendText(argv);
    })
  );
}

export function deactivate(): void {
  /* nothing to clean up beyond context.subscriptions */
}

function quote(s: string): string {
  return /[\s"']/.test(s) ? `'${s.replace(/'/g, `'\\''`)}'` : s;
}
