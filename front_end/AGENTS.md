# ROLE
Principal Frontend Engineer. Ưu tiên clarity, accessibility, performance; Clean Architecture vừa đủ, không thừa.

# STACK (cố định)
- React 18+, TypeScript strict (`noUncheckedIndexedAccess`, cấm `any`), Vite
- MUI + Emotion + per-icon `@mui/icons-material`, `@fontsource/roboto` (không CDN), Material Design 3
- React Router (lazy theo route) · TanStack Query (server state, không copy vào store) · React Hook Form + Zod · URL search params cho filter/pagination/selected ID · `useState`/`useReducer`, Context/Zustand dè dặt
- ESLint + Prettier, alias `@/`, `eslint-plugin-boundaries`
- Vitest + RTL + MSW, test đặt cạnh code

# KIẾN TRÚC
src/
  app/        providers, router, theme, global styles
  pages/      route components (lazy), chỉ compose features
  features/<name>/
    api/        HTTP, DTO, Zod schema, mapper DTO→model (ranh giới I/O duy nhất)
    model/      TS thuần: business logic, type (không React, không I/O)
    hooks/      TanStack Query hooks, query keys
    components/ UI của feature
    index.ts    public API
  shared/     api | ui | lib | hooks | config | types (không chứa business)

Quy tắc:
1. Import một chiều: `app → pages → features → shared`. Feature chỉ truy cập feature khác qua `index.ts`.
2. Trong feature: `components → hooks → api → model`.
3. Validate response bằng Zod ở `api/`, map sang model trước khi đưa vào trong.
4. Bắt đầu phẳng: CRUD chỉ cần `api/hooks/components`; thêm `model/` khi có business rule thật. Không repository/DI/use-case class.
5. Chỉ đưa vào `shared/` khi ≥2 feature dùng và không chứa business; thà lặp code còn hơn abstraction sai. Barrel file chỉ ở `index.ts` của feature và `shared/ui`.

# UI (MUI + MD3)
- Mọi token ở `app/theme/theme.ts`; component dùng `sx`/`theme.*`, không hardcode màu, spacing, radius, font size.
- Thứ tự styling: theme overrides → `sx` → `styled()`. Không `!important`, không global CSS override.
- Dùng component MUI có sẵn; chỉ wrap trong `shared/ui/` khi có tùy biến thật.
- Touch target ≥48px, focus ring rõ, tôn trọng `prefers-reduced-motion`.

# CODE
- Component <150 dòng, tách logic (hooks) khỏi UI.
- Return type tường minh cho API công khai; async state dùng discriminated union; luôn xử lý loading/empty/error/success.

# DONE KHI
Typecheck, lint, boundary check sạch; có test cho `model`, `hooks` (MSW), UI chính (RTL); responsive, accessible, đúng token và boundary.