# gamenglam-console — CLAUDE.md

React + TypeScript admin panel for the GameNGlam e-commerce platform.
Stack: **React · TypeScript · Vite · Redux Toolkit · React Hook Form + Zod · CSS Modules · Bootstrap 5 + Font Awesome**

Backend: `gamenglam-server` running at `http://localhost:8080/api/v1` (Go + Gin).

---

## Quick start

```bash
npm install
npm run dev      # Vite dev server at :5173
npm run build
npm run preview
```

---

## Architecture — clean layers

```
domain/entities          →  plain TypeScript interfaces
domain/repositories      →  repository interfaces (IXxxRepository)
domain/usecases          →  use-case classes (thin, delegate to repositories)
infrastructure/          →  concrete repository implementations (axios calls)
features/*/store         →  Redux Toolkit async thunks + slices
features/*/hooks         →  custom hooks wrapping selectors + dispatch
features/*/pages+modals  →  UI components
```

Never skip layers. A component calls a hook; a hook dispatches a thunk; a thunk calls an infrastructure repository.

---

## Project layout

```
src/
  app/
    routes/           # React Router setup, ProtectedRoute, RoleGuard
    store/            # configureStore — all reducers registered here
    providers/        # AppProviders wrapper
  core/
    api/              # axiosInstance (interceptors, token attach, auto-refresh)
    config/           # env.ts — typed env vars
    constants/        # permissions.ts, roles.ts
    hooks/            # useAppDispatch, useAppSelector
    types/            # common.types.ts (ApiResponse, etc.)
    utils/            # storage.ts, token.ts (tokenService)
  domain/
    entities/         # Attribute, Category, Product, Order, User, Role, etc.
    repositories/     # IXxxRepository interfaces
    usecases/         # AuthUseCases, etc.
  infrastructure/
    repositories/     # Axios implementations of domain interfaces
  features/
    auth/             # login, forgot/reset/change password
    catalog/          # categories, products, variants, attributes, attribute values
    customer/         # customer listing
    dashboard/        # DashboardPage
    employee/         # sections, pages, roles, users (RBAC management)
    inventory/        # inventory table (variant-level stock)
    order/            # order listing, status updates
    setting/          # duplicate of employee — sections, pages, roles viewed
                      # from a settings perspective; separate slices exist for both
  shared/
    components/       # DataTable, Modal, LoadingSpinner (reusable)
    layouts/          # AdminLayout, AuthLayout
    ui/               # FormTextField, etc.
```

> ⚠️ `features/employee/` and `features/setting/` both manage the same backend resources
> (sections, pages, roles) through separate Redux slices. Prefer `features/employee/` for
> CRUD operations. Avoid diverging state between the two.

---

## Styling conventions

### Global design system
All shared tokens live in `src/app/styles/` and use the `gng-*` class prefix (e.g. `gng-card`, `gng-btn`, `gng-table`). These are the first choice for any styling.

### CSS Modules
Component-specific styles go in a co-located `.module.css` file. Never add component-specific styles to global files.

### Bootstrap 5
Used for layout utilities (grid, flex helpers) and some form controls. Font Awesome for icons.

---

## ID conventions — critical

**Always use `_id` (UUID) in API payloads. Never send or store `_no` (serial) fields.**

The backend resolves `_id → _no` internally. Specific mappings:

| Context | Field to send |
|---------|--------------|
| Category parent | `parent_id` (UUID) |
| Product → category | `category_id` (UUID) |
| Attribute filtering | `attribute_id` (UUID) |
| Attribute value selection | `attribute_value_id` (UUID) |
| Order → address | `address_id` (UUID) |
| Variant bulk create | `product_id` (UUID), `attribute_value_ids` (UUID[]) |

All `_no` fields received from the API should be treated as internal/opaque. Do not use them in subsequent requests.

---

## State management (Redux Toolkit)

- One slice per feature module (e.g. `categorySlice`, `orderSlice`)
- Async logic lives in `createAsyncThunk` — never directly in components
- Always call `.unwrap()` on dispatched thunks so errors surface to the component
- Loading / error states come from the slice; never use local `useState` for async status

```ts
// ✅ correct
const dispatch = useAppDispatch();
try {
  await dispatch(fetchProducts()).unwrap();
} catch (err) {
  setError((err as Error).message);
}
```

---

## Forms

- React Hook Form + Zod for all forms
- Schema defines validation; `register()` wires inputs
- Avoid manual `onChange` handlers — use `register` or `Controller`
- For Select/custom inputs, use `Controller` with `control`
- TypeScript form types derived from Zod schema via `z.infer<typeof schema>`

Common pitfall: **don't mix `register()` and `value`/`onChange` props** on the same input — pick one pattern.

---

## Shared components

### `<DataTable>`
Generic table with column definitions, pagination, and optional actions. Pass `columns` + `data`; never build raw `<table>` elements for list pages.

### `<Modal>`
Wrapper around Bootstrap modal. Pass `show`, `onClose`, and `title`. Internal form state resets on close.

---

## Catalog module notes

### Product form
- No `base_price` or `stock_qty` on the product — those belong to variants only
- Description is a plain `<textarea>` (no rich text editor)
- `specifications` = key-value pairs (JSONB); `features` = string list (JSONB)
- Image upload: `POST /products/:id/image` → `image_url` on product

### Variant form (`VariantFormModal`)
- Edit mode locks attributes — show read-only pills for the already-selected values, hide unselected
- `selectedValueIds` uses `attribute_value_id` (UUID)
- Three price fields: `cost_price`, `mrp`, `selling_price` (no `price_override`)
- Image upload: `POST /product-variants/:id/images/upload`

### Variant generator (`VariantGeneratorModal`)
- 2-step flow: (1) select attribute values → (2) configure each generated variant
- Variants are the cartesian product of selected values
- "Apply to same color" copies price/stock from one variant to all with matching color value
- Uses `attribute_id` / `attribute_value_id` throughout

### Attribute form (`AttributeFormModal`)
- Toggles: `is_required`, `is_variant`, `show_in_filter`
- `show_in_filter = true` means the attribute appears in the storefront sidebar filter

### Inventory table
- Shows variant primary image from `product_variant_images`; falls back to `null` (no product image fallback)

---

## Employee module

Tabbed page pattern with embedded `section` prop:

```tsx
<EmployeesPage section="roles" />
<EmployeesPage section="users" />
```

Structure: Sections → Pages → Roles (with JSONB permission map) → Users.
Permissions are a JSONB object keyed by page slug; always null-safe-access them (`role.permissions?.[slug]`).

---

## Auth

Tokens are stored in **`localStorage`** via `tokenService` (in `src/core/utils/token.ts`) — not in cookies.

- Login: `POST /auth/login` → response body contains `access_token` + `refresh_token`
- Both tokens saved to localStorage: `tokenService.setTokens(access, refresh)`
- All requests: `axiosInstance` request interceptor attaches `Authorization: Bearer <access_token>`
- 401 response: interceptor automatically calls `POST /auth/refresh-token`, queues any concurrent requests, retries them with the new token
- Refresh failure: `tokenService.clearTokens()` + redirect to `/auth/login`
- The console never sends `credentials: 'include'` — auth is entirely header-based

---

## API conventions

- Base URL: `http://localhost:8080/api/v1` (set via `VITE_API_BASE_URL` env var)
- Auth: `Authorization: Bearer <token>` header (token from localStorage)
- `multipart/form-data` uploads: axiosInstance deletes `Content-Type` so the browser sets it with the correct boundary automatically
- Error responses: `{ error: string }`
- Successful list responses: usually `{ data: [...] }` or a plain array
- Never expose or log JWT tokens

---

## Common mistakes to avoid

- **Don't send `_no` fields** in POST/PUT bodies — only `_id` (UUID).
- **Don't put async logic in components** — it belongs in thunks.
- **Don't mix `register` + `value`/`onChange`** on the same RHF input.
- **Don't add component styles to global files** — use `.module.css`.
- **Don't access `role.permissions[slug]`** without null-safety — it's JSONB and may be `null`.
- **Don't build raw `<table>` for list pages** — use the shared `<DataTable>`.
- **Don't assume cookies carry auth** — the console uses localStorage Bearer tokens, not httpOnly cookies.
- **Don't duplicate state across `features/employee/` and `features/setting/`** — they share the same backend resources.
