import type { ModelProvider } from "./types.js";

export class ModelRegistry {
  private providers = new Map<string, ModelProvider>();

  register(provider: ModelProvider): void {
    if (this.providers.has(provider.id)) {
      throw new Error(`Duplicate provider id: ${provider.id}`);
    }
    this.providers.set(provider.id, provider);
  }

  get(providerId: string): ModelProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Unknown provider: ${providerId}`);
    }
    return provider;
  }

  has(providerId: string): boolean {
    return this.providers.has(providerId);
  }

  list(): ModelProvider[] {
    return [...this.providers.values()];
  }
}
