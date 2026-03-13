import { useState } from "react";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

export type TgNotifKey =
  | "contracts"
  | "announcements"
  | "mentions"
  | "treasury"
  | "applications";

export const TG_NOTIF_LABELS: Record<TgNotifKey, string> = {
  contracts:     "Контракты",
  announcements: "Объявления",
  mentions:      "Упоминания",
  treasury:      "Казна",
  applications:  "Заявки",
};

export const TG_NOTIF_COLORS: Record<TgNotifKey, string> = {
  contracts:     "#f59e0b",
  announcements: "#9b2335",
  mentions:      "#a78bfa",
  treasury:      "#22c55e",
  applications:  "#38bdf8",
};

export interface Account {
  id: string;
  username: string;
  password: string;
  memberId: string;
  createdAt: string;
  avatarDataUrl?: string;
  coverDataUrl?: string;
  realName?: string;
  birthday?: string;
  bio?: string;
  specializations?: string[]; // e.g. ["trucker","fisher","miner","delivery"]
  birthdayPublic?: boolean;   // show birthday to public pages (default: false = internal only)
  // Telegram
  telegramId?: string;
  telegramUsername?: string;
  tgLinkedAt?: string;
  tgNotifications?: TgNotifKey[];
}

export interface AuthSession {
  accountId: string;
  memberId: string;
  loginAt: string;
}

/* ═══════════════════════════════════════════════
   STORAGE
   ═══════════════════════════════════════════════ */

const ACCOUNTS_KEY = "schwarz_accounts";
const SESSION_KEY = "schwarz_auth_session";

/* ── Seed root test account ── */
const SEED_MEMBER_ID = "seed_member_root";
const SEED_ACCOUNT_ID = "seed_account_root";

function seedRootAccount() {
  // Seed member into schwarz_admin_members if missing
  try {
    const membersRaw = localStorage.getItem("schwarz_admin_members");
    const members: Record<string, unknown>[] = membersRaw ? JSON.parse(membersRaw) : [];
    if (!members.find((m) => m.id === SEED_MEMBER_ID)) {
      members.unshift({
        id: SEED_MEMBER_ID,
        name: "Roman Schwarz",
        role: "owner",
        joinDate: "2023-01-01",
        active: true,
        badges: ["leader"],
      });
      localStorage.setItem("schwarz_admin_members", JSON.stringify(members));
    }
  } catch { /* ignore */ }

  // Seed account into schwarz_accounts if missing
  try {
    const accRaw = localStorage.getItem(ACCOUNTS_KEY);
    const accounts: Account[] = accRaw ? JSON.parse(accRaw) : [];
    if (!accounts.find((a) => a.id === SEED_ACCOUNT_ID)) {
      accounts.unshift({
        id: SEED_ACCOUNT_ID,
        username: "root",
        password: "schwarz2026",
        memberId: SEED_MEMBER_ID,
        createdAt: "2023-01-01T00:00:00.000Z",
        realName: "Test Root",
        bio: "Тестовый аккаунт · Owner",
      });
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
  } catch { /* ignore */ }
}

seedRootAccount();

function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccountsToStorage(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSessionToStorage(session: AuthSession | null) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

/* ═══════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════ */

export function generatePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "Sw_";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function generateUsername(memberName: string): string {
  return memberName
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "");
}

/* ═══════════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════════ */

export function useAuth() {
  const [session, setSessionState] = useState<AuthSession | null>(() => loadSession());
  const [accounts, setAccountsState] = useState<Account[]>(() => loadAccounts());

  const setSession = (s: AuthSession | null) => {
    setSessionState(s);
    saveSessionToStorage(s);
  };

  const setAccounts = (a: Account[]) => {
    setAccountsState(a);
    saveAccountsToStorage(a);
  };

  const login = (username: string, password: string): boolean => {
    const accs = loadAccounts();
    const account = accs.find(
      (a) => a.username === username && a.password === password
    );
    if (!account) return false;
    setSession({
      accountId: account.id,
      memberId: account.memberId,
      loginAt: new Date().toISOString(),
    });
    return true;
  };

  const logout = () => setSession(null);

  const currentAccount = session
    ? accounts.find((a) => a.id === session.accountId) ?? null
    : null;

  const addAccount = (data: {
    username: string;
    password: string;
    memberId: string;
  }): Account => {
    const newAccount: Account = {
      ...data,
      id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...accounts, newAccount];
    setAccounts(updated);
    return newAccount;
  };

  const updateAccount = (id: string, changes: Partial<Account>) => {
    const updated = accounts.map((a) =>
      a.id === id ? { ...a, ...changes } : a
    );
    setAccounts(updated);
    if (session?.accountId === id && changes.memberId) {
      setSession({ ...session, memberId: changes.memberId });
    }
  };

  const deleteAccount = (id: string) => {
    setAccounts(accounts.filter((a) => a.id !== id));
    if (session?.accountId === id) setSession(null);
  };

  return {
    session,
    accounts,
    currentAccount,
    login,
    logout,
    addAccount,
    updateAccount,
    deleteAccount,
  };
}