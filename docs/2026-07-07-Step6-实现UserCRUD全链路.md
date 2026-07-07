# Step 6 · 实现完整 User CRUD 全链路

> 目标：用 users 资源，把「路由 → 控制器 → 服务 → 数据库」这条链路真正走通一遍。
> 前面几步搭好了地基（Express 分层 + Prisma），这一步是第一次让四层协同，读写真实数据。

## 本步做了什么

1. `src/services/user.service.ts`：5 个纯业务函数（list / getById / create / update / delete），用 Prisma 读写 `users` 表
2. `src/controllers/user.controller.ts`：5 个控制器，负责解析请求、调用 service、返回响应
3. `src/routes/user.routes.ts`：把 5 个 RESTful 端点映射到对应控制器
4. `src/routes/index.ts`：新增一行 `apiRouter.use('/users', userRouter)`，把 users 挂到 `/api` 下

## 目录结构变化

```
node-study/
└── src/
    ├── routes/
    │   ├── index.ts             # 【改】挂载 userRouter
    │   └── user.routes.ts       # 【新增】users 的 5 个端点
    ├── controllers/
    │   └── user.controller.ts   # 【新增】HTTP 翻译层
    └── services/
        └── user.service.ts      # 【新增】纯业务逻辑，调 Prisma
```

## API 一览

| 方法     | 路径             | 作用     | 成功状态码 |
| -------- | ---------------- | -------- | ---------- |
| `GET`    | `/api/users`     | 列出全部 | 200        |
| `POST`   | `/api/users`     | 新建     | 201        |
| `GET`    | `/api/users/:id` | 查单个   | 200        |
| `PATCH`  | `/api/users/:id` | 部分更新 | 200        |
| `DELETE` | `/api/users/:id` | 删除     | 204        |

## 一条请求是怎么穿过四层的

以 `POST /api/users` 为例：

```
HTTP 请求
  │  ① express.json() 中间件把 body 解析成 req.body（在 app.ts）
  ▼
routes/index.ts        → /api 前缀命中，转交 apiRouter
  ▼
routes/user.routes.ts  → POST / 命中，交给 postUser 控制器
  ▼
controllers            → 从 req.body 取出 email/name，调用 service
  ▼
services               → prisma.user.create(...) 发 SQL
  ▼
PostgreSQL             → 插入一行，返回新记录
  ▲ 原路返回：service 拿到记录 → 控制器 res.status(201).json(user)
```

**每一层只关心自己的事**：路由只做映射、控制器只做 HTTP 翻译、服务只写业务、Prisma 只管数据库。这就是分层的好处——改任何一层都不牵动其它层。

## 几个关键点

### 1. 路径参数是字符串，主键是数字

`req.params.id` 永远是字符串，而数据库主键是 `Int`，所以控制器里都有一句
`const id = Number(req.params.id)`，并顺手校验 `Number.isNaN(id)` → 返回 400。

### 2. 状态码要「说人话」

- `201 Created`：新建成功
- `204 No Content`：删除成功、没有响应体（注意用 `res.send()` 而不是 `res.json()`）
- `404 Not Found`：查不到资源

`findUnique` 查不到会返回 `null`（不抛错），所以「查不到 → 404」是控制器主动判断的。

### 3. 故意留下的「坑」——正是 Step 7 的引子

现在这版 CRUD 有两个明显的粗糙之处，**故意没在这一步处理**：

- **重复 email 创建** → Prisma 抛 `P2002`
- **更新/删除不存在的 id** → Prisma 抛 `P2025`

因为目前还没有全局错误处理中间件（`app.ts` 里注释写了留到 Step 7），这些错误会被
Express 5 的默认处理器接住，直接吐一大坨 **500 HTML 错误页**——又丑又泄露堆栈。

> 实测：对一个不存在的 id 发 PATCH，返回的就是一整页 HTML 报错。
> 这不是 bug，是**下一步要解决的真实问题**：统一响应格式 + 把 Prisma 错误优雅转成 4xx。

另外，请求体也**还没校验**——现在 `POST` 一个没有 email 的 body 也会一路走到数据库才报错。
严谨的 zod 校验同样留到 Step 7。

## 动手验证

```bash
docker compose up -d          # 确保数据库在跑
pnpm dev                      # 启动服务

# 新建
curl -X POST http://localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","name":"Alice"}'

# 列表 / 查单个
curl http://localhost:3000/api/users
curl http://localhost:3000/api/users/1

# 更新 / 删除
curl -X PATCH http://localhost:3000/api/users/1 \
  -H 'Content-Type: application/json' -d '{"name":"Alice v2"}'
curl -X DELETE http://localhost:3000/api/users/1

# 想看 Prisma 发了什么 SQL？开发环境的控制台会打印每一条 query。
# 想用图形界面看数据？pnpm db:studio
```

## 小结

这一步没有引入任何新依赖，纯粹是**把已有的四层拼成一条能跑的链路**。你现在应该能清楚地
说出「一个请求从进来到落库、再返回」经过了哪些文件、每个文件负责什么。

下一步 **Step 7**：请求校验（zod）+ 统一响应格式 + 全局错误处理，把这一步故意留下的坑填平。
