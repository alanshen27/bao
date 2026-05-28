import { isAbsolute, join, normalize, relative, resolve } from "node:path";

/**
 * Resolve a user-supplied path against a root directory, guaranteeing the
 * result stays inside the root. Throws on traversal or absolute escapes.
 */
export function resolveWithinRoot(root: string, inputPath: string): string {
  const cleaned = normalize(inputPath).replace(/^(\.\.[/\\])+/, "");
  const candidate = isAbsolute(inputPath)
    ? resolve(inputPath)
    : resolve(root, cleaned);

  const rel = relative(root, candidate);
  if (rel === "" ) {
    return candidate;
  }
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(
      `Path "${inputPath}" escapes the project directory and is not allowed.`,
    );
  }
  return candidate;
}

export function joinWithinRoot(root: string, ...segments: string[]): string {
  return resolveWithinRoot(root, join(...segments));
}
