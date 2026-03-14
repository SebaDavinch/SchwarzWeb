import { requestJson, requestVoid } from "./http";

export interface AdminSnapshotResponse {
  navItems?: unknown[];
  announcements?: unknown[];
  customPages?: unknown[];
  pageOverrides?: unknown[];
  members?: unknown[];
  leaderships?: unknown[];
  rules?: unknown[];
  principles?: unknown[];
  newsArticles?: unknown[];
  moments?: unknown[];
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

/* ─── Admin Staff (login credentials) ─── */

export async function getAdminStaff<T>() {
  return requestJson<T[]>("/admin/staff", { method: "GET" });
}

export async function putAdminStaff<T>(payload: T[]) {
  return requestVoid("/admin/staff", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/* ─── News Articles ─── */

export async function listNews<T>() {
  return requestJson<T[]>("/news", { method: "GET" });
}

export async function putNews<T>(payload: T[]) {
  return requestVoid("/news", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function createNewsArticle<T>(payload: T) {
  return requestJson<{ ok: boolean; article: T }>("/news", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateNewsArticle<T>(id: string, payload: Partial<T>) {
  return requestVoid(`/news/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteNewsArticle(id: string) {
  return requestVoid(`/news/${id}`, { method: "DELETE" });
}

/* ─── Moments ─── */

export async function listMoments<T>() {
  return requestJson<T[]>("/moments", { method: "GET" });
}

export async function putMoments<T>(payload: T[]) {
  return requestVoid("/moments", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function createMoment<T>(payload: T) {
  return requestJson<{ ok: boolean; moment: T }>("/moments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMoment<T>(id: string, payload: Partial<T>) {
  return requestVoid(`/moments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteMoment(id: string) {
  return requestVoid(`/moments/${id}`, { method: "DELETE" });
}

/* ─── Telegram Bot ─── */

export interface TgBotConfig {
  token: string;
  botUsername: string;
  enabled: boolean;
  webhookUrl: string;
  secretToken: string;
}

export interface TgBotCommand {
  id: string;
  command: string;
  description: string;
  example: string;
  category: string;
  enabled: boolean;
  allowedRoles: string[];
}

export interface TgBotAdmin {
  id: string;
  name: string;
  telegramId: string;
  telegramUsername: string;
  permissions: string[];
  active: boolean;
  addedAt: string;
}

export interface TgBotLink {
  id: string;
  memberId: string;
  memberName: string;
  memberRole?: string;
  accountUsername?: string;
  telegramId?: string;
  telegramUsername?: string;
  tgLinkedAt?: string;
  tgNotifications?: string[];
}

export async function getTelegramConfig() {
  return requestJson<TgBotConfig>("/telegram/config", { method: "GET" });
}

export async function putTelegramConfig(config: TgBotConfig) {
  return requestVoid("/telegram/config", { method: "PUT", body: JSON.stringify(config) });
}

export async function getTelegramBotInfo() {
  return requestJson<{ ok: boolean; result?: { id: number; username: string; first_name: string }; description?: string }>("/telegram/bot-info", { method: "GET" });
}

export async function registerTelegramWebhook(url: string, secretToken?: string) {
  return requestJson<{ ok: boolean; description?: string }>("/telegram/register-webhook", {
    method: "POST",
    body: JSON.stringify({ url, secretToken }),
  });
}

export async function getTelegramCommands() {
  return requestJson<TgBotCommand[]>("/telegram/commands", { method: "GET" });
}

export async function putTelegramCommands(commands: TgBotCommand[]) {
  return requestVoid("/telegram/commands", { method: "PUT", body: JSON.stringify(commands) });
}

export async function getTelegramAdmins() {
  return requestJson<TgBotAdmin[]>("/telegram/admins", { method: "GET" });
}

export async function putTelegramAdmins(admins: TgBotAdmin[]) {
  return requestVoid("/telegram/admins", { method: "PUT", body: JSON.stringify(admins) });
}

export async function getTelegramLinks() {
  return requestJson<TgBotLink[]>("/telegram/links", { method: "GET" });
}

export async function putTelegramLinks(links: TgBotLink[]) {
  return requestVoid("/telegram/links", { method: "PUT", body: JSON.stringify(links) });
}

export async function sendTelegramMessage(chatId: string, text: string) {
  return requestJson<{ ok: boolean }>("/telegram/send", {
    method: "POST",
    body: JSON.stringify({ chatId, text }),
  });
}

export async function broadcastTelegram(chatIds: string[], text: string) {
  return requestJson<{ ok: boolean; sent: number; total: number }>("/telegram/send", {
    method: "POST",
    body: JSON.stringify({ chatIds, text }),
  });
}

/* ─── Birthdays ─── */

export async function listBirthdayEntries<T>() {
  return requestJson<T[]>("/birthdays", { method: "GET" });
}
export async function putBirthdayEntries<T>(payload: T[]) {
  return requestVoid("/birthdays", { method: "PUT", body: JSON.stringify(payload) });
}
export async function createBirthdayEntry<T>(payload: T) {
  return requestJson<{ ok: boolean; entry: T }>("/birthdays", { method: "POST", body: JSON.stringify(payload) });
}
export async function updateBirthdayEntry<T>(id: string, payload: Partial<T>) {
  return requestVoid(`/birthdays/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}
export async function deleteBirthdayEntry(id: string) {
  return requestVoid(`/birthdays/${id}`, { method: "DELETE" });
}
export async function getBirthdayNotifConfigAPI<T>() {
  return requestJson<T | null>("/birthdays/notif-config", { method: "GET" });
}
export async function putBirthdayNotifConfigAPI<T>(payload: T) {
  return requestVoid("/birthdays/notif-config", { method: "PUT", body: JSON.stringify(payload) });
}

/* ─── Cabinet Accounts (member ЛК) ─── */

export async function getCabinetAccounts<T>() {
  return requestJson<T[]>("/cabinet/accounts", { method: "GET" });
}
export async function putCabinetAccounts<T>(payload: T[]) {
  return requestVoid("/cabinet/accounts", { method: "PUT", body: JSON.stringify(payload) });
}

/* ─── Role Templates ─── */

export async function listRoleTemplates<T>() {
  return requestJson<T[]>("/role-templates", { method: "GET" });
}
export async function putRoleTemplates<T>(payload: T[]) {
  return requestVoid("/role-templates", { method: "PUT", body: JSON.stringify(payload) });
}

/* ─── Admin Notifications ─── */

export async function getAdminNotifications<T>() {
  return requestJson<T[]>("/notifications", { method: "GET" });
}
export async function putAdminNotifications<T>(payload: T[]) {
  return requestVoid("/notifications", { method: "PUT", body: JSON.stringify(payload) });
}

/* ─── Family Goals ─── */

export async function listGoals<T>() {
  return requestJson<T[]>("/goals", { method: "GET" });
}
export async function putGoals<T>(payload: T[]) {
  return requestVoid("/goals", { method: "PUT", body: JSON.stringify(payload) });
}
export async function createGoal<T>(payload: T) {
  return requestJson<{ ok: boolean; goal: T }>("/goals", { method: "POST", body: JSON.stringify(payload) });
}
export async function updateGoalById<T>(id: string, payload: Partial<T>) {
  return requestVoid(`/goals/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}
export async function deleteGoalById(id: string) {
  return requestVoid(`/goals/${id}`, { method: "DELETE" });
}

/* ─── Treasury ─── */

export async function listTreasury<T>() {
  return requestJson<T[]>("/treasury", { method: "GET" });
}
export async function putTreasury<T>(payload: T[]) {
  return requestVoid("/treasury", { method: "PUT", body: JSON.stringify(payload) });
}
export async function createTreasuryTransaction<T>(payload: T) {
  return requestJson<{ ok: boolean; tx: T }>("/treasury", { method: "POST", body: JSON.stringify(payload) });
}
export async function deleteTreasuryTransaction(id: string) {
  return requestVoid(`/treasury/${id}`, { method: "DELETE" });
}

/* ─── Reports ─── */

export async function listReports<T>() {
  return requestJson<T[]>("/reports", { method: "GET" });
}
export async function putReports<T>(payload: T[]) {
  return requestVoid("/reports", { method: "PUT", body: JSON.stringify(payload) });
}
export async function createReportEntry<T>(payload: T) {
  return requestJson<{ ok: boolean; report: T }>("/reports", { method: "POST", body: JSON.stringify(payload) });
}
export async function updateReportEntry<T>(id: string, payload: Partial<T>) {
  return requestVoid(`/reports/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}
export async function deleteReportEntry(id: string) {
  return requestVoid(`/reports/${id}`, { method: "DELETE" });
}
