import PocketBase from "pocketbase";

export type FamilyRole = "owner" | "dep_owner" | "veteran" | "member";

export interface PBStaffMember {
  id: string;
  name: string;
  position: string;
  permissions: string[];
  active: boolean;
}

export interface PBFamilyUser {
  id: string;
  name: string;
  role: FamilyRole;
  joinDate: string;
  active: boolean;
  badges?: string[];
}

const pbUrl = import.meta.env.VITE_POCKETBASE_URL?.trim() ?? "";
const staffCollection = import.meta.env.VITE_PB_STAFF_COLLECTION?.trim() || "admin_staff";
const usersCollection = import.meta.env.VITE_PB_USERS_COLLECTION?.trim() || "family_users";
const stateCollection = import.meta.env.VITE_PB_STATE_COLLECTION?.trim() || "admin_state";

const pb = pbUrl ? new PocketBase(pbUrl) : null;

export function isPocketBaseEnabled() {
  return Boolean(pb);
}

export function hasPocketBaseAuth() {
  return Boolean(pb?.authStore.isValid && pb?.authStore.record);
}

export function getPocketBaseAuthStaffId() {
  if (!pb?.authStore.record) return null;
  const externalId = String(pb.authStore.record.get("externalId") || "").trim();
  return externalId || pb.authStore.record.id;
}

export async function loginPocketBaseAdmin(identity: string, password: string): Promise<string | null> {
  if (!pb) return null;

  const authData = await pb.collection(staffCollection).authWithPassword(identity, password);
  const record = authData.record;
  if (!record) return null;

  const externalId = String(record.get("externalId") || "").trim();
  return externalId || record.id;
}

export function logoutPocketBaseAdmin() {
  if (!pb) return;
  pb.authStore.clear();
}

export async function getPocketBaseState<T>(key: string): Promise<T | null> {
  if (!pb) return null;

  try {
    const records = await pb.collection(stateCollection).getList(1, 1, {
      filter: `key = "${key.replace(/"/g, '\\"')}"`,
    });
    const record = records.items[0] as any;
    if (!record) return null;
    return (record.data as T) ?? null;
  } catch {
    return null;
  }
}

export async function setPocketBaseState<T>(key: string, data: T): Promise<void> {
  if (!pb) return;

  const records = await pb.collection(stateCollection).getList(1, 1, {
    filter: `key = "${key.replace(/"/g, '\\"')}"`,
  });
  const record = records.items[0] as any;

  if (record) {
    await pb.collection(stateCollection).update(record.id, { key, data });
  } else {
    await pb.collection(stateCollection).create({ key, data });
  }
}

export async function clearPocketBaseStateByPrefix(prefix: string): Promise<void> {
  if (!pb) return;

  const all = await pb.collection(stateCollection).getFullList({ sort: "key" }) as any[];
  for (const record of all) {
    const key = String(record.key || "");
    if (key.startsWith(prefix)) {
      await pb.collection(stateCollection).delete(record.id);
    }
  }
}

function normalizePermissions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

function normalizeBadges(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

function mapStaffRecord(record: any): PBStaffMember {
  return {
    id: String(record.externalId || record.id),
    name: String(record.name || ""),
    position: String(record.position || ""),
    permissions: normalizePermissions(record.permissions),
    active: Boolean(record.active),
  };
}

function mapUserRecord(record: any): PBFamilyUser {
  const role = String(record.role || "member") as FamilyRole;
  return {
    id: String(record.externalId || record.id),
    name: String(record.name || ""),
    role,
    joinDate: String(record.joinDate || ""),
    active: Boolean(record.active),
    badges: normalizeBadges(record.badges),
  };
}

export async function listPocketBaseStaff(): Promise<PBStaffMember[] | null> {
  if (!pb) return null;

  const result = await pb.collection(staffCollection).getFullList({
    sort: "name",
  });

  return result.map(mapStaffRecord);
}

export async function listPocketBaseUsers(): Promise<PBFamilyUser[] | null> {
  if (!pb) return null;

  const result = await pb.collection(usersCollection).getFullList({
    sort: "name",
  });

  return result.map(mapUserRecord);
}

export async function syncPocketBaseStaff(items: PBStaffMember[]) {
  if (!pb) return;

  const existing = await pb.collection(staffCollection).getFullList({ sort: "name" });
  const byExternalId = new Map(existing.map((record: any) => [String(record.externalId || ""), record]));

  for (const item of items) {
    const matched = byExternalId.get(item.id);
    const payload = {
      externalId: item.id,
      name: item.name,
      position: item.position,
      permissions: item.permissions,
      active: item.active,
    };

    if (matched) {
      await pb.collection(staffCollection).update(matched.id, payload);
    } else {
      await pb.collection(staffCollection).create(payload);
    }
  }
}

export async function syncPocketBaseUsers(items: PBFamilyUser[]) {
  if (!pb) return;

  const existing = await pb.collection(usersCollection).getFullList({ sort: "name" });
  const byExternalId = new Map(existing.map((record: any) => [String(record.externalId || ""), record]));

  for (const item of items) {
    const matched = byExternalId.get(item.id);
    const payload = {
      externalId: item.id,
      name: item.name,
      role: item.role,
      joinDate: item.joinDate,
      active: item.active,
      badges: item.badges || [],
    };

    if (matched) {
      await pb.collection(usersCollection).update(matched.id, payload);
    } else {
      await pb.collection(usersCollection).create(payload);
    }
  }
}
