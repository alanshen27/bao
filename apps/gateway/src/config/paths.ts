import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const thisFile = fileURLToPath(import.meta.url);
const thisDir = dirname(thisFile);

/**
 * Walk upward from a starting directory looking for the workspace root
 * (the package.json that declares npm workspaces). Falls back gracefully
 * so Bao still runs even if the marker cannot be found.
 */
function findRepoRoot(start: string): string {
  let dir = start;
  for (let i = 0; i < 8; i += 1) {
    const pkgPath = join(dir, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
          workspaces?: unknown;
          name?: string;
        };
        if (pkg.workspaces || pkg.name === "bao") {
          return dir;
        }
      } catch {
        // ignore malformed package.json and keep walking
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return start;
}

export const repoRoot = findRepoRoot(thisDir);

/** Directory where Bao keeps all local-first data. */
export const baoHome = process.env.BAO_HOME
  ? resolve(process.env.BAO_HOME)
  : join(repoRoot, ".bao");

export const configPath = join(baoHome, "config.json");
export const secretsPath = join(baoHome, "secrets.json");
export const dbPath = join(baoHome, "bao.db");

/** Working directory that filesystem/shell tools are scoped to. */
export const projectCwd = repoRoot;

/** Prisma datasource URL pointing at the local SQLite database. */
export const databaseUrl = `file:${dbPath}`;
