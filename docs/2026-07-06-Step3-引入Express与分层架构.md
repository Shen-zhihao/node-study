# Step 3 · 引入 Express 与分层架构

> 目标：用 Express 替换原生 http；把「一坨」代码重构为 `路由 → 控制器 → 服务` 的企业级分层架构；理解中间件；拆分 app 与 server。

## 本步做了什么

1. 安装 `express` + `@types/express`（Express 5）
2. 按职责分层建立目录：`services/` `controllers/` `routes/` `middlewares/`
3. `app.ts` 组装应用、`server.ts` 启动监听（两者分离）
4. 删除旧的 `src/index.ts`
5. `package.json` 入口从 `index` 改为 `server`

---

## 目录结构变化

**变化前（Step 2）：**

```
src/
├── config/env.ts
└── index.ts          # 原生 http + 所有逻辑堆一起
```

**变化后（Step 3）：**

```
src/
├── config/
│   └── env.ts
├── controllers/          # 【新增】HTTP 翻译官：取 req、调 service、回 res
│   └── health.controller.ts
├── services/             # 【新增】纯业务逻辑，不认识 HTTP
│   └── health.service.ts
├── routes/               # 【新增】路径→控制器 的映射
│   ├── index.ts          #   路由总入口，聚合到 /api
│   └── health.routes.ts
├── middlewares/          # 【新增】请求流水线：日志、404…
│   ├── request-logger.ts
│   └── not-found.ts
├── app.ts                # 【新增】组装 app（不监听）
└── server.ts             # 【新增，取代 index.ts】启动监听
```

变化点：`index.ts` 被删除，逻辑按职责拆分到 4 个新目录；新增 `app.ts` / `server.ts` 分离「组装」与「启动」。

---

## 概念讲解（含前端类比）

### 1. 为什么要分层？

之前所有逻辑堆在一个文件，项目一大就无法维护/测试/协作。企业级做法按职责切层，每层只干一件事：

```
请求 → [路由 Router] → [控制器 Controller] → [服务 Service] → (Step 5 接数据库)
        决定谁处理        解析请求/组织响应        真正的业务逻辑
```

> 前端类比：像 React 把「组件 / 业务 hooks / API 层」分开——组件不直接 fetch，hooks 不管渲染。这就是关注点分离。

### 2. 各层职责边界（重点）

| 层         | 认识 HTTP 吗？ | 干什么                                 | 不干什么     |
| ---------- | -------------- | -------------------------------------- | ------------ |
| Router     | 是             | 把「路径+方法」映射到控制器            | 不写逻辑     |
| Controller | 是             | 从 req 取数据、调 service、用 res 返回 | 不写业务逻辑 |
| Service    | **否**         | 纯业务逻辑（可被测试/定时任务复用）    | 不碰 req/res |

**关键**：`health.service.ts` 里没有 `req`/`res`——它不知道自己是被 HTTP、定时任务还是测试调用的。这种「纯粹」正是分层的价值。

### 3. 中间件（Express 的灵魂）

一个请求进来，像流水线一样依次穿过多个中间件。签名固定 `(req, res, next)`：

- 每个中间件可读改 `req`/`res`；
- 处理完**必须调 `next()`** 交给下一个，否则请求卡死；
- **注册顺序 = 执行顺序**。所以 404 兜底必须放在所有路由之后。

> 前端类比：Redux middleware / axios 拦截器链。日志、鉴权、CORS、限流都靠它。

### 4. app 与 server 分离

- `app.ts`：只组装（挂中间件+路由），**不监听端口**。
- `server.ts`：只启动（`app.listen`）。

拆开的理由：测试时（Step 11）把 `app` 直接交给 supertest 发请求，无需真的占用端口。组装可复用、可测试。

### 5. Express 帮我们省了什么（对比 Step 1）

| 事情       | Step 1 原生写法                     | Express 写法                           |
| ---------- | ----------------------------------- | -------------------------------------- |
| 返回 JSON  | 手动 `writeHead` + `JSON.stringify` | `res.json(obj)`                        |
| 解析请求体 | 手动监听 data/end 拼接              | `app.use(express.json())` → `req.body` |
| 路由匹配   | 手写 `if (url === ...)`             | `router.get('/path', handler)`         |
| 路径参数   | 手动解析字符串                      | `req.params.id`                        |

---

## 动手验证

```bash
pnpm typecheck
pnpm lint
pnpm dev

curl http://localhost:3000/api/health   # 走通 路由→控制器→服务
curl http://localhost:3000/api/nope      # 404 中间件兜底
# 终端会看到请求日志：GET /api/health 200 - 4ms
```

## 小结

从「一坨」进化为清晰的分层架构，这是企业级项目的骨架。理解了中间件流水线和 app/server 分离。下一步用 Docker Compose 起一个真正的 PostgreSQL 数据库。
