# node-study

一步一步搭建一个**企业级 Node.js 后端**学习项目（面向前端工程师自学）。

## 技术栈

Express 5 · TypeScript · PostgreSQL · Prisma 7 · Docker · pnpm

## 快速开始

```bash
pnpm install                 # 安装依赖（postinstall 会自动生成 Prisma 客户端）
cp .env.example .env         # 准备环境变量
docker compose up -d         # 启动 PostgreSQL
pnpm db:migrate              # 应用数据库迁移
pnpm dev                     # 启动开发服务（http://localhost:3000）

curl http://localhost:3000/api/health
```

## 常用命令

| 命令                            | 作用                         |
| ------------------------------- | ---------------------------- |
| `pnpm dev`                      | 启动开发服务（改动自动重启） |
| `pnpm build` / `pnpm start`     | 编译 / 运行编译产物          |
| `pnpm typecheck`                | 类型检查                     |
| `pnpm lint` / `pnpm format`     | 代码质量 / 格式化            |
| `pnpm db:migrate`               | 生成并应用数据库迁移         |
| `pnpm db:studio`                | 可视化数据库管理界面         |
| `pnpm db:reset`                 | 重置数据库并重跑迁移         |
| `docker compose up -d` / `down` | 启停数据库                   |

## 学习进度

> 每一步的详细讲解见 [`docs/`](docs/) 目录。

**阶段一 · 项目地基**

- [x] **Step 1** 项目初始化 + TypeScript + 第一个 HTTP 服务
- [x] **Step 2** 工程化配置（ESLint / Prettier / 环境变量 + zod 校验）
- [x] **Step 3** 引入 Express + 分层架构（路由 / 控制器 / 服务 / 中间件）

**阶段二 · 核心能力**

- [x] **Step 4** Docker Compose 起 PostgreSQL
- [x] **Step 5** 接入 Prisma（schema / migration / client 单例）
- [x] **Step 6** 实现完整 User CRUD，走通「路由→控制器→服务→数据库」全链路
- [ ] **Step 7** 请求校验 + 统一响应格式 + 全局错误处理 ← 下一步

**阶段三 · 企业级特性**

- [ ] **Step 8** 结构化日志（pino）+ 请求链路追踪
- [ ] **Step 9** 认证鉴权（JWT + 密码加密）
- [ ] **Step 10** 分环境配置 / 健康检查 / 优雅关闭
- [ ] **Step 11** 单元测试 + 接口测试（Vitest + supertest）
- [ ] **Step 12** API 文档（Swagger / OpenAPI）

## 目录结构

```
node-study/
├── prisma/
│   ├── schema.prisma        # 数据模型定义
│   └── migrations/          # 版本化迁移历史
├── src/
│   ├── config/env.ts        # 环境变量唯一入口（校验+类型）
│   ├── lib/prisma.ts        # PrismaClient 单例
│   ├── routes/              # 路由：路径→控制器
│   ├── controllers/         # 控制器：HTTP 翻译官
│   ├── services/            # 服务：纯业务逻辑
│   ├── middlewares/         # 中间件：日志 / 404 …
│   ├── generated/prisma/    # Prisma 生成物（gitignore）
│   ├── app.ts               # 组装 Express 应用
│   └── server.ts            # 启动入口
├── docker-compose.yml       # PostgreSQL 服务
└── docs/                    # 每一步的中文讲解
```
