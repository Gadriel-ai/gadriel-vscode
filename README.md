# Gadriel AI Security Harness — VS Code

Security scanning for the code your AI writes. This extension registers the
**Gadriel MCP server** so GitHub Copilot (and other MCP-aware chat) can use
Gadriel's security tools with no config editing, and adds a **Gadriel: Scan
Repository** command.

Gadriel covers SAST, secrets, dependencies (SCA/SBOM), containers and
configuration, including AI-specific risks such as the OWASP LLM Top 10, with
3,000+ rules. Scanning runs on your machine.

## Requirements

The `gadriel` scanner binary. By default the extension runs it via
`npx -y gadriel@1.4.1` (needs Node.js). Or set **`gadriel.command`** to an
absolute path / a `gadriel` already on PATH (e.g. `npm install -g gadriel`).

## Use

- **Command Palette → "Gadriel: Scan Repository"** runs a full scan in a
  terminal (writes `.security/` with findings, SBOMs, reports).
- In Copilot Chat (agent mode), the `gadriel` MCP tools (`validate_file`,
  `findings_for_path`, `fix_finding`, …) are available automatically.

## Settings

- `gadriel.command` — path to the gadriel binary (default: run via npx).
- `gadriel.version` — npm version used with npx (default `1.4.1`).

## Data

Code is scanned locally and not uploaded. First run registers an anonymous
device credential with app.gadriel.ai (a random device id; no
hostname/username/keys); set `GADRIEL_NO_ANONYMOUS_AUTH=1` to skip. See the
[privacy policy](https://gadriel.ai/privacy).

## License

[Apache-2.0](LICENSE). The `gadriel` scanner it runs is proprietary, under the
[Gadriel terms](https://gadriel.ai/terms).
