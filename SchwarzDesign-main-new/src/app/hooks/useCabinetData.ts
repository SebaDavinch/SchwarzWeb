import { useState } from "react";

/* ═══════════════════════════════════════════════
   ROLE RANKS
   ═══════════════════════════════════════════════ */

export const ROLE_RANK: Record<string, number> = {
  academy: 0,
  main: 1,
  old: 2,
  close: 3,
  dep_owner: 4,
  owner: 5,
};

export const ROLE_LABELS: Record<string, string> = {
  academy: "Academy",
  main: "Main",
  old: "Old",
  close: "Close",
  dep_owner: "Dep.Owner",
  owner: "Owner",
};

export const ROLE_COLORS: Record<string, string> = {
  academy: "#888899",
  main: "#ff3366",
  old: "#b8860b",
  close: "#c43e54",
  dep_owner: "#7a1c2a",
  owner: "#9b2335",
};

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  category: string;
  imageUrl?: string;
  minRole: string;
  status: "available" | "in_use" | "repair";
  licensePlate?: string;
  addedAt: string;
}

export interface ContractParticipant {
  memberId: string;
  memberName: string;
  signedAt: string;
}

export interface Contract {
  id: string;
  title: string;
  description: string;
  type: string;
  reward?: string;
  slots: number;
  participants: ContractParticipant[];
  status: "open" | "in_progress" | "completed" | "failed";
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedMinutes?: number;
  closedBy?: string[];
  minRole?: string;
}

export interface Upgrade {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: "locked" | "planned" | "unlocked";
  cost?: string;
  category: string;
  requiresIds?: string[];
  order: number;
}

export interface InfrastructureItem {
  id: string;
  title: string;
  type: "house" | "office" | "warehouse" | "garage" | "other";
  description: string;
  address?: string;
  imageUrl?: string;
  status: "active" | "planned" | "lost";
  addedAt: string;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  condition: "contracts_closed" | "manual";
  conditionValue?: number;
}

export interface UserAchievement {
  memberId: string;
  achievementId: string;
  unlockedAt: string;
}

export interface CabinetNotification {
  id: string;
  title: string;
  text: string;
  type: "info" | "warning" | "success" | "announcement";
  createdAt: string;
}

/* ═══════════════════════════════════════════════
   DEFAULT DATA
   ═══════════════════════════════════════════════ */

const defaultVehicles: Vehicle[] = [
  {
    id: "v1",
    name: "Pegassi Infernus",
    model: "Infernus",
    category: "Спорткар",
    imageUrl:
      "https://images.unsplash.com/photo-1721007111526-1031da39ae85?w=800&q=80",
    minRole: "main",
    status: "available",
    addedAt: "2025-01-15",
  },
  {
    id: "v2",
    name: "Dubsta 6x6",
    model: "Dubsta 6x6",
    category: "Внедорожник",
    imageUrl:
      "https://images.unsplash.com/photo-1745192116861-ce71474428f2?w=800&q=80",
    minRole: "academy",
    status: "available",
    addedAt: "2025-01-20",
  },
  {
    id: "v3",
    name: "Buzzard Attack Chopper",
    model: "Buzzard",
    category: "Вертолёт",
    minRole: "close",
    status: "available",
    addedAt: "2025-02-01",
  },
  {
    id: "v4",
    name: "Vapid Bullet",
    model: "Bullet",
    category: "Суперкар",
    minRole: "old",
    status: "in_use",
    addedAt: "2025-02-10",
  },
  {
    id: "v5",
    name: "Pegassi Zentorno",
    model: "Zentorno",
    category: "Суперкар",
    minRole: "dep_owner",
    status: "available",
    addedAt: "2025-03-01",
  },
];

const defaultContracts: Contract[] = [
  {
    id: "c1",
    title: "Ночная рыбалка",
    description: "Выловить 50 рыб и сдать на базу. Работаем в ночное время.",
    type: "fishing",
    reward: "$25,000",
    slots: 6,
    participants: [],
    status: "open",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    estimatedMinutes: 120,
    minRole: "academy",
  },
  {
    id: "c2",
    title: "Доставка груза",
    description: "Перевезти контейнеры с дока в Paleto Bay. Нужен транспорт.",
    type: "delivery",
    reward: "$40,000",
    slots: 4,
    participants: [
      {
        memberId: "1",
        memberName: "Madara Schwarz",
        signedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
    ],
    status: "in_progress",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    startedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    estimatedMinutes: 180,
    minRole: "main",
  },
  {
    id: "c3",
    title: "Охрана точки",
    description: "Обеспечить прикрытие на складе в течение 2 часов.",
    type: "security",
    reward: "$60,000",
    slots: 3,
    participants: [
      {
        memberId: "2",
        memberName: "Akihiro Schwarz",
        signedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
      {
        memberId: "3",
        memberName: "Roman Schwarz",
        signedAt: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
      },
    ],
    status: "completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    closedBy: ["2", "3"],
    minRole: "main",
  },
];

const defaultUpgrades: Upgrade[] = [
  // Коммуникации
  {
    id: "u1",
    title: "Discord-сервер",
    description: "Официальный Discord для координации",
    icon: "💬",
    status: "unlocked",
    category: "Коммуникации",
    order: 0,
  },
  {
    id: "u2",
    title: "Сайт-визитка",
    description: "Официальный сайт семьи",
    icon: "🌐",
    status: "unlocked",
    category: "Коммуникации",
    order: 1,
    requiresIds: ["u1"],
  },
  {
    id: "u3",
    title: "Telegram-канал",
    description: "Новости и анонсы в Telegram",
    icon: "📡",
    status: "planned",
    category: "Коммуникации",
    order: 2,
    requiresIds: ["u2"],
  },
  // Бизнес
  {
    id: "u4",
    title: "Семейная касса",
    description: "Общий фонд для нужд семьи",
    icon: "💰",
    status: "unlocked",
    category: "Бизнес",
    order: 0,
  },
  {
    id: "u5",
    title: "Офис",
    description: "Деловой центр для переговоров",
    icon: "🏢",
    status: "planned",
    category: "Бизнес",
    order: 1,
    cost: "$5,000,000",
    requiresIds: ["u4"],
  },
  {
    id: "u6",
    title: "Склад",
    description: "Хранение ресурсов семьи",
    icon: "📦",
    status: "locked",
    category: "Бизнес",
    order: 2,
    cost: "$3,000,000",
    requiresIds: ["u5"],
  },
  // Транспорт
  {
    id: "u7",
    title: "Базовый гараж",
    description: "Хранение семейного транспорта",
    icon: "🚗",
    status: "unlocked",
    category: "Транспорт",
    order: 0,
  },
  {
    id: "u8",
    title: "Элитные авто",
    description: "Суперкары для особых случаев",
    icon: "🏎️",
    status: "planned",
    category: "Транспорт",
    order: 1,
    cost: "$8,000,000",
    requiresIds: ["u7"],
  },
  {
    id: "u9",
    title: "Авиапарк",
    description: "Вертолёты и самолёты",
    icon: "🚁",
    status: "locked",
    category: "Транспорт",
    order: 2,
    cost: "$15,000,000",
    requiresIds: ["u8"],
  },
  // Безопасность
  {
    id: "u10",
    title: "Шифрование связи",
    description: "Защищённые каналы коммуникации",
    icon: "🔐",
    status: "unlocked",
    category: "Безопасность",
    order: 0,
  },
  {
    id: "u11",
    title: "Охрана штаба",
    description: "Круглосуточная охрана базы",
    icon: "🛡️",
    status: "planned",
    category: "Безопасность",
    order: 1,
    cost: "$2,000,000",
    requiresIds: ["u10"],
  },
  {
    id: "u12",
    title: "Сейф",
    description: "Защищённое хранилище ценностей",
    icon: "🗄️",
    status: "locked",
    category: "Безопасность",
    order: 2,
    cost: "$1,500,000",
    requiresIds: ["u11"],
  },
];

const defaultInfrastructure: InfrastructureItem[] = [
  {
    id: "i1",
    title: "Штаб-квартира",
    type: "house",
    description: "Основная база семьи. Место встреч, планирования и отдыха.",
    address: "Strawberry, Los Santos",
    imageUrl:
      "https://images.unsplash.com/photo-1762023067302-f547db074e09?w=800&q=80",
    status: "active",
    addedAt: "2024-01-01",
  },
  {
    id: "i2",
    title: "Деловой офис",
    type: "office",
    description: "Офис для переговоров и деловых встреч.",
    address: "Downtown, Los Santos",
    imageUrl:
      "https://images.unsplash.com/photo-1772631653221-9c77e6f82c9f?w=800&q=80",
    status: "planned",
    addedAt: "2025-01-01",
  },
  {
    id: "i3",
    title: "Подпольный склад",
    type: "warehouse",
    description: "Хранение семейных ресурсов вдали от посторонних глаз.",
    address: "La Mesa, Los Santos",
    imageUrl:
      "https://images.unsplash.com/photo-1720036236697-018370867320?w=800&q=80",
    status: "planned",
    addedAt: "2025-03-01",
  },
];

const defaultAchievements: AchievementDef[] = [
  {
    id: "a1",
    title: "Первый контракт",
    description: "Закрыть первый контракт семьи",
    icon: "🎯",
    color: "#3b82f6",
    condition: "contracts_closed",
    conditionValue: 1,
  },
  {
    id: "a2",
    title: "Надёжный боец",
    description: "Закрыть 5 контрактов",
    icon: "⚡",
    color: "#8b5cf6",
    condition: "contracts_closed",
    conditionValue: 5,
  },
  {
    id: "a3",
    title: "Ветеран контрактов",
    description: "Закрыть 10 контрактов",
    icon: "🔱",
    color: "#f59e0b",
    condition: "contracts_closed",
    conditionValue: 10,
  },
  {
    id: "a4",
    title: "Легенда семьи",
    description: "Закрыть 25 контрактов",
    icon: "👑",
    color: "#9b2335",
    condition: "contracts_closed",
    conditionValue: 25,
  },
  {
    id: "a5",
    title: "Опора семьи",
    description: "Особая награда от лидерства",
    icon: "🏆",
    color: "#22c55e",
    condition: "manual",
  },
  {
    id: "a6",
    title: "Хранитель",
    description: "За вклад в развитие семьи",
    icon: "🛡️",
    color: "#ec4899",
    condition: "manual",
  },
];

/* ═══════════════════════════════════════════════
   STORAGE HELPERS
   ═══════════════════════════════════════════════ */

function loadData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`schwarz_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveData<T>(key: string, data: T) {
  localStorage.setItem(`schwarz_${key}`, JSON.stringify(data));
}

/* ═══════════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════════ */

export function useCabinetData() {
  const [vehicles, setVehiclesState] = useState<Vehicle[]>(() =>
    loadData("vehicles", defaultVehicles)
  );
  const [contracts, setContractsState] = useState<Contract[]>(() =>
    loadData("contracts", defaultContracts)
  );
  const [upgrades, setUpgradesState] = useState<Upgrade[]>(() =>
    loadData("upgrades", defaultUpgrades)
  );
  const [infrastructure, setInfrastructureState] = useState<InfrastructureItem[]>(
    () => loadData("infrastructure", defaultInfrastructure)
  );
  const [achievementDefs, setAchievementDefsState] = useState<AchievementDef[]>(
    () => loadData("achievement_defs", defaultAchievements)
  );
  const [userAchievements, setUserAchievementsState] = useState<UserAchievement[]>(
    () => loadData("user_achievements", [])
  );
  const [notifications, setNotificationsState] = useState<CabinetNotification[]>(
    () => loadData("cabinet_notifications", [])
  );

  /* --- Vehicles --- */
  const setVehicles = (v: Vehicle[]) => {
    setVehiclesState(v);
    saveData("vehicles", v);
  };
  const addVehicle = (data: Omit<Vehicle, "id" | "addedAt">) => {
    const v: Vehicle = {
      ...data,
      id: `v_${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    setVehicles([...vehicles, v]);
    return v;
  };
  const updateVehicle = (id: string, changes: Partial<Vehicle>) =>
    setVehicles(vehicles.map((v) => (v.id === id ? { ...v, ...changes } : v)));
  const deleteVehicle = (id: string) =>
    setVehicles(vehicles.filter((v) => v.id !== id));

  /* --- Contracts --- */
  const setContracts = (c: Contract[]) => {
    setContractsState(c);
    saveData("contracts", c);
  };
  const addContract = (data: Omit<Contract, "id" | "createdAt" | "participants">) => {
    const c: Contract = {
      ...data,
      id: `c_${Date.now()}`,
      createdAt: new Date().toISOString(),
      participants: [],
    };
    setContracts([c, ...contracts]);
    return c;
  };
  const updateContract = (id: string, changes: Partial<Contract>) =>
    setContracts(contracts.map((c) => (c.id === id ? { ...c, ...changes } : c)));
  const deleteContract = (id: string) =>
    setContracts(contracts.filter((c) => c.id !== id));

  const signUpForContract = (
    contractId: string,
    memberId: string,
    memberName: string
  ): boolean => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract || contract.status !== "open") return false;
    if (contract.participants.some((p) => p.memberId === memberId)) return false;
    if (contract.participants.length >= contract.slots) return false;
    updateContract(contractId, {
      participants: [
        ...contract.participants,
        { memberId, memberName, signedAt: new Date().toISOString() },
      ],
    });
    return true;
  };

  const closeContract = (contractId: string, closerIds: string[]) => {
    const currentContracts = loadData<Contract[]>("contracts", []);
    const updatedContracts = currentContracts.map((c) =>
      c.id === contractId
        ? {
            ...c,
            status: "completed" as const,
            completedAt: new Date().toISOString(),
            closedBy: closerIds,
          }
        : c
    );
    setContractsState(updatedContracts);
    saveData("contracts", updatedContracts);

    // Award contract achievements
    const currentUAs = loadData<UserAchievement[]>("user_achievements", []);
    const currentAchDefs = loadData<AchievementDef[]>("achievement_defs", defaultAchievements);
    const newUAs: UserAchievement[] = [];

    closerIds.forEach((memberId) => {
      const closedCount =
        updatedContracts.filter(
          (c) =>
            c.status === "completed" && (c.closedBy || []).includes(memberId)
        ).length;
      const toUnlock = currentAchDefs.filter(
        (a) =>
          a.condition === "contracts_closed" &&
          a.conditionValue !== undefined &&
          closedCount >= a.conditionValue &&
          !currentUAs.some(
            (ua) => ua.memberId === memberId && ua.achievementId === a.id
          ) &&
          !newUAs.some(
            (ua) => ua.memberId === memberId && ua.achievementId === a.id
          )
      );
      toUnlock.forEach((a) =>
        newUAs.push({
          memberId,
          achievementId: a.id,
          unlockedAt: new Date().toISOString(),
        })
      );
    });

    if (newUAs.length > 0) {
      const updatedUAs = [...currentUAs, ...newUAs];
      setUserAchievementsState(updatedUAs);
      saveData("user_achievements", updatedUAs);
    }
  };

  /* --- Upgrades --- */
  const setUpgrades = (u: Upgrade[]) => {
    setUpgradesState(u);
    saveData("upgrades", u);
  };
  const addUpgrade = (data: Omit<Upgrade, "id">) => {
    const u: Upgrade = { ...data, id: `u_${Date.now()}` };
    setUpgrades([...upgrades, u]);
    return u;
  };
  const updateUpgrade = (id: string, changes: Partial<Upgrade>) =>
    setUpgrades(upgrades.map((u) => (u.id === id ? { ...u, ...changes } : u)));
  const deleteUpgrade = (id: string) =>
    setUpgrades(upgrades.filter((u) => u.id !== id));

  /* --- Infrastructure --- */
  const setInfrastructure = (i: InfrastructureItem[]) => {
    setInfrastructureState(i);
    saveData("infrastructure", i);
  };
  const addInfrastructure = (data: Omit<InfrastructureItem, "id" | "addedAt">) => {
    const item: InfrastructureItem = {
      ...data,
      id: `i_${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    setInfrastructure([...infrastructure, item]);
    return item;
  };
  const updateInfrastructure = (id: string, changes: Partial<InfrastructureItem>) =>
    setInfrastructure(infrastructure.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  const deleteInfrastructure = (id: string) =>
    setInfrastructure(infrastructure.filter((i) => i.id !== id));

  /* --- Achievements --- */
  const setAchievementDefs = (a: AchievementDef[]) => {
    setAchievementDefsState(a);
    saveData("achievement_defs", a);
  };
  const awardAchievement = (memberId: string, achievementId: string) => {
    if (
      userAchievements.some(
        (ua) => ua.memberId === memberId && ua.achievementId === achievementId
      )
    )
      return;
    const updated = [
      ...userAchievements,
      { memberId, achievementId, unlockedAt: new Date().toISOString() },
    ];
    setUserAchievementsState(updated);
    saveData("user_achievements", updated);
  };
  const getMemberAchievements = (memberId: string) =>
    userAchievements.filter((ua) => ua.memberId === memberId);
  const getMemberContractCount = (memberId: string) =>
    contracts.filter(
      (c) => c.status === "completed" && (c.closedBy || []).includes(memberId)
    ).length;

  /* --- Notifications --- */
  const setNotifications = (n: CabinetNotification[]) => {
    setNotificationsState(n);
    saveData("cabinet_notifications", n);
  };
  const addNotification = (data: Omit<CabinetNotification, "id" | "createdAt">) => {
    const n: CabinetNotification = {
      ...data,
      id: `n_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications([n, ...notifications]);
    return n;
  };
  const deleteNotification = (id: string) =>
    setNotifications(notifications.filter((n) => n.id !== id));

  return {
    vehicles, setVehicles, addVehicle, updateVehicle, deleteVehicle,
    contracts, setContracts, addContract, updateContract, deleteContract,
    signUpForContract, closeContract,
    upgrades, setUpgrades, addUpgrade, updateUpgrade, deleteUpgrade,
    infrastructure, setInfrastructure, addInfrastructure, updateInfrastructure, deleteInfrastructure,
    achievementDefs, setAchievementDefs, userAchievements, awardAchievement,
    getMemberAchievements, getMemberContractCount,
    notifications, setNotifications, addNotification, deleteNotification,
  };
}