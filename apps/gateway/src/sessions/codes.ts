const adjectives = [
  "warm",
  "soft",
  "tiny",
  "sleepy",
  "crispy",
  "golden",
  "lucky",
  "gentle",
  "steamy",
  "cozy",
  "bamboo",
  "plump",
];

const nouns = [
  "bao",
  "bun",
  "dumpling",
  "scallion",
  "sesame",
  "bamboo",
  "noodle",
  "mochi",
  "tofu",
  "wonton",
];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function randomSessionCode(): string {
  const adjective = pick(adjectives);
  const noun = pick(nouns);
  const number = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return `${adjective}-${noun}-${number}`;
}

/**
 * Generate a session code that is unique according to `exists`. Falls back to
 * appending entropy if collisions persist.
 */
export async function generateUniqueSessionCode(
  exists: (code: string) => Promise<boolean>,
): Promise<string> {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const code = randomSessionCode();
    if (!(await exists(code))) {
      return code;
    }
  }
  return `${randomSessionCode()}-${Date.now().toString(36).slice(-4)}`;
}
