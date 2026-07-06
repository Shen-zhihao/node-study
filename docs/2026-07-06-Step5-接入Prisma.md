# Step 5 · 接入 Prisma（ORM）

> 目标：用 Prisma 把应用和 PostgreSQL 连起来。定义数据模型 → 生成迁移改数据库 → 得到类型安全的查询客户端。

## 本步做了什么

1. 安装 `prisma`（CLI）、`@prisma/client`（运行时）、`@prisma/adapter-pg`（PG 驱动适配器）
2. `prisma init` 生成 `prisma/schema.prisma` 和 `prisma.config.ts`
3. 在 schema 里定义第一个模型 `User`
4. `prisma migrate dev --name init` 生成并应用首个迁移（创建 `users` 表）
5. `prisma generate` 生成类型安全客户端到 `src/generated/prisma`
6. 建 `src/lib/prisma.ts`：全项目共享的 PrismaClient 单例
7. `package.json` 增加 `db:*` 脚本 + `postinstall` 自动 generate

## 目录结构变化

```
node-study/
├── prisma/
│   ├── schema.prisma          # 【新增】数据模型定义（唯一事实来源）
│   └── migrations/            # 【新增】版本化的 SQL 迁移历史（提交进 git）
│       └── 2026..._init/migration.sql
├── prisma.config.ts           # 【新增】Prisma CLI 配置（从 DATABASE_URL 读连接）
├── src/
│   ├── generated/prisma/      # 【新增，gitignore】生成的类型安全客户端
│   └── lib/
│       └── prisma.ts          # 【新增】PrismaClient 单例
├── .gitignore                 # 【改】忽略 src/generated/prisma
└── package.json               # 【改】db:* 脚本 + postinstall
```

> `src/generated/prisma` 是生成物，被 gitignore；克隆项目后 `pnpm install` 会通过 `postinstall` 自动重新生成。

---

## 概念讲解（含前端类比）

### 1. ORM 是什么？为什么用 Prisma？

ORM = Object-Relational Mapping。它让你**用写对象/方法的方式操作数据库**，而不是手拼 SQL 字符串。

```ts
// 不用写：SELECT * FROM users WHERE email = '...'
const user = await prisma.user.findUnique({ where: { email } });
```

Prisma 的杀手锏是**端到端类型安全**：`user.name` 有自动补全，写错字段名编译期就报错。

> 前端类比：像用了最好的那种 API SDK——请求参数和返回值全有类型提示，而不是裸 `fetch` 拿 `any`。

### 2. 三个核心概念

| 概念          | 是什么                                       | 类比                |
| ------------- | -------------------------------------------- | ------------------- |
| **schema**    | `schema.prisma` 里声明表结构，唯一事实来源   | 类型定义文件        |
| **migration** | 每次改 schema 生成的版本化 SQL，记录结构演进 | 数据库的 git commit |
| **client**    | 生成的类型安全查询对象 `prisma.user.xxx()`   | 自带类型的 API SDK  |

工作流：**改 schema → `migrate dev` 生成并应用迁移 → 自动重新生成 client**。

### 3. 迁移（migration）为什么重要？

- 结构改动有**历史可追溯**，能 review、能回滚。
- 团队 / CI / 生产按同一批迁移执行，数据库结构**永远一致**。
- 绝不手动去数据库改表——所有改动都经过 schema + 迁移。

### 4. 为什么 PrismaClient 要单例？

`PrismaClient` 内含数据库**连接池**。每请求都 `new` 会耗尽连接。所以 `src/lib/prisma.ts` 只 new 一次并导出，全项目共享。

### 5. Prisma 7 的新东西（本步踩的坑）

- **客户端生成到 `src/generated/prisma`**（不再是 node_modules），导入用相对路径 `../generated/prisma/client.js`。
- **连接配置在 `prisma.config.ts`**（CLI 用），从 `DATABASE_URL` 读。
- **运行时必须用「驱动适配器」**：`new PrismaClient({ adapter })`。PG 用 `@prisma/adapter-pg`。只传连接串会类型报错，必须走适配器。

### 6. 常用命令（已封装成脚本）

```bash
pnpm db:migrate      # 改完 schema 后：生成+应用迁移（会问你迁移名）
pnpm db:generate     # 只重新生成客户端
pnpm db:studio       # 打开可视化数据库管理界面（浏览器里看表/改数据）
pnpm db:reset        # 清空数据库并重跑所有迁移（开发时重置用）
```

---

## 动手验证

```bash
# 确保数据库在跑
docker compose ps

# 打开可视化界面看看 users 表（推荐！）
pnpm db:studio
```

本步用一个临时脚本验证了 create / findUnique / count / delete 全部成功，并在终端看到了 Prisma 生成的真实 SQL（开发环境 `log: ['query']` 的功劳）。

## 小结

应用与数据库通过 Prisma 打通，拿到了类型安全的查询客户端和单例连接。数据层就绪。下一步把它接进分层架构，实现一个完整的 User CRUD REST 接口，真正走通「路由→控制器→服务→数据库」全链路。
