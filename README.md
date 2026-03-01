# Schwarz Family Website

Проект перенесён из `SchwarzDesign-main` в текущий workspace с сохранением UX-структуры 1:1 (`src/app/**`).

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Motion
- Radix UI + вспомогательные UI-библиотеки
- Локальный API сервер на Express

## Run

```bash
npm install
npm run api
npm run dev
```

## Build

```bash
npm run build
```

## API

Локальные endpoints (backend):

- `GET/PUT /api/admin/snapshot`
- `GET/PUT/POST/PATCH/DELETE /api/applications`
- `GET/PUT /api/polls`
- `POST /api/polls/vote`
- `POST /api/webhooks/discord`

Данные сохраняются в `.data/db.json`.

## PocketBase (users DB)

- Интеграция включена в админку: [src/app/pages/AdminPage.tsx](src/app/pages/AdminPage.tsx).
- Клиент и sync-логика: [src/app/api/pocketbase.ts](src/app/api/pocketbase.ts).
- Схема и шаги настройки: [pocketbase/README.md](pocketbase/README.md).

Если задан `VITE_POCKETBASE_URL`, админка использует PocketBase для:

- авторизации админ-стаффа;
- синхронизации коллекции стаффа;
- синхронизации пользовательской базы семьи.

## Environment

Скопируйте `.env.example` в `.env` и при необходимости задайте:

- `VITE_API_BASE_URL` — внешний URL API (если не задан, используется `/api` через Vite proxy)
- `API_PORT` — порт backend (по умолчанию `8790`)
- `DISCORD_WEBHOOK_URL` — webhook для пересылки Discord-уведомлений с backend
- `VITE_POCKETBASE_URL` — URL PocketBase
- `VITE_PB_STAFF_COLLECTION` — коллекция админов/стаффа
- `VITE_PB_USERS_COLLECTION` — коллекция пользователей семьи
