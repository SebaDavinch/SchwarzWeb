import { requestJson, requestVoid } from "./http";

export interface AdminSnapshotResponse {
  navItems?: unknown[];
  announcements?: unknown[];
  customPages?: unknown[];
  pageOverrides?: unknown[];
  members?: unknown[];
}

export interface VotePayload {
  pollId: string;
  optionId: string;
  voterId: string;
}

export interface WebhookEventPayload {
  title: string;
  description?: string;
  color: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
}

export async function getAdminSnapshot() {
  return requestJson<AdminSnapshotResponse>("/admin/snapshot", { method: "GET" });
}

export async function putAdminSnapshot(payload: AdminSnapshotResponse) {
  return requestVoid("/admin/snapshot", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function listApplications<T>() {
  return requestJson<T[]>("/applications", { method: "GET" });
}

export async function createApplication<T>(payload: T) {
  return requestVoid("/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function putApplications<T>(payload: T[]) {
  return requestVoid("/applications", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateApplication<T extends { id: string }>(id: string, payload: Partial<T>) {
  return requestVoid(`/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteApplicationById(id: string) {
  return requestVoid(`/applications/${id}`, { method: "DELETE" });
}

export async function listPolls<T>() {
  return requestJson<T[]>("/polls", { method: "GET" });
}

export async function putPolls<T>(payload: T[]) {
  return requestVoid("/polls", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function votePoll(payload: VotePayload) {
  return requestVoid("/polls/vote", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function postDiscordWebhookEvent(payload: WebhookEventPayload) {
  return requestVoid("/webhooks/discord", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ─── Auth / Staff Accounts ─── */

export interface StaffAccountResponse {
  id: string;
  username: string;
  displayName: string;
  position: string;
  permissions: string[];
  isRoot: boolean;
  active: boolean;
  createdAt: string;
}

export async function loginAdmin(username: string, password: string) {
  return requestJson<{ ok: boolean; account: StaffAccountResponse }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function listAdminAccounts() {
  return requestJson<StaffAccountResponse[]>("/auth/accounts", { method: "GET" });
}

export async function createAdminAccount(payload: {
  username: string;
  password: string;
  displayName?: string;
  position?: string;
  permissions?: string[];
}) {
  return requestJson<{ ok: boolean; account: StaffAccountResponse }>("/auth/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminAccount(
  id: string,
  payload: {
    password?: string;
    displayName?: string;
    position?: string;
    permissions?: string[];
    active?: boolean;
  },
) {
  return requestJson<{ ok: boolean; account: StaffAccountResponse }>(`/auth/accounts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminAccount(id: string) {
  return requestVoid(`/auth/accounts/${id}`, { method: "DELETE" });
}
