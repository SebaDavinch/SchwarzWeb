# PocketBase setup

## 1) Run PocketBase

Use your local PocketBase instance (default `http://127.0.0.1:8090`).

## 2) Create collections

### `admin_staff` (auth collection)

Required fields:

- `externalId` (text, unique)
- `name` (text)
- `position` (text)
- `permissions` (json)
- `active` (bool)

`email` + `password` are provided by auth collection itself.

### `family_users` (base collection)

Required fields:

- `externalId` (text, unique)
- `name` (text)
- `role` (select: `owner`, `dep_owner`, `veteran`, `member`)
- `joinDate` (text or date)
- `active` (bool)
- `badges` (json)

### `admin_state` (base collection)

Required fields:

- `key` (text, unique)
- `data` (json)

В этой коллекции хранятся остальные данные админки: навигация, страницы, заявки, опросы, настройки и т.д.

## 3) Environment

Copy `.env.example` to `.env` and set:

- `VITE_POCKETBASE_URL`
- `VITE_PB_STAFF_COLLECTION`
- `VITE_PB_USERS_COLLECTION`
- `VITE_PB_STATE_COLLECTION`

## 4) Behavior in app

- Admin login accepts PocketBase identity + password when `VITE_POCKETBASE_URL` is set.
- Staff list and family users are pulled from PocketBase on admin page load.
- Any staff/users edits in admin page are synced back to PocketBase.
- If PocketBase is unavailable, app falls back to local storage behavior.
