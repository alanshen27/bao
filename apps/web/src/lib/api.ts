import type {
  BaoConfig,
  PluginWithEnabled,
  ProviderDto,
  SessionDetailDto,
  SessionDto,
  SetupStatusDto,
  ToolWithEnabled,
} from "./types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as { message?: string };
      if (data.message) message = data.message;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  // Setup
  getSetupStatus: () => request<SetupStatusDto>("/setup/status"),
  completeSetup: (body: {
    defaultProvider: string;
    defaultModel?: string;
    secrets?: Record<string, Record<string, string>>;
  }) =>
    request<{ ok: boolean; config: BaoConfig }>("/setup/complete", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Config
  getConfig: () => request<BaoConfig>("/config"),
  updateConfig: (patch: Partial<BaoConfig>) =>
    request<BaoConfig>("/config", {
      method: "POST",
      body: JSON.stringify(patch),
    }),

  // Providers
  getProviders: () => request<ProviderDto[]>("/providers"),
  saveProviderSecrets: (id: string, body: Record<string, string>) =>
    request<{ ok: boolean; configured: boolean }>(`/providers/${id}/secrets`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Sessions
  getSessions: () => request<SessionDto[]>("/sessions"),
  createSession: (body: {
    title?: string;
    kind?: string;
    providerId?: string;
    modelId?: string;
  }) =>
    request<SessionDto>("/sessions", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getSession: (code: string) =>
    request<SessionDetailDto>(`/sessions/${code}`),
  sendMessage: (code: string, content: string) =>
    request<SessionDetailDto>(`/sessions/${code}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  runSession: (code: string) =>
    request<SessionDetailDto>(`/sessions/${code}/run`, { method: "POST" }),
  spawnHelper: (
    code: string,
    body: { task: string; providerId?: string; modelId?: string },
  ) =>
    request<SessionDto>(`/sessions/${code}/spawn`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Plugins & tools
  getPlugins: () => request<PluginWithEnabled[]>("/plugins"),
  getTools: () => request<ToolWithEnabled[]>("/tools"),
  testTool: (name: string, input: Record<string, unknown>) =>
    request<{ ok: boolean; output?: unknown; error?: string }>(
      `/tools/${name}/test`,
      { method: "POST", body: JSON.stringify({ input }) },
    ),
};
