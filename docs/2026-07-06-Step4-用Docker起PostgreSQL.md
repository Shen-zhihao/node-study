# Step 4 · 用 Docker Compose 起 PostgreSQL

> 目标：不在本机安装数据库，用 Docker Compose 一条命令拉起一个真实的 PostgreSQL，环境干净、可随时重置、与生产一致。

## 本步做了什么

1. 新建 `docker-compose.yml`，声明一个 PostgreSQL 17 服务（含端口映射、数据卷、健康检查）
2. `.env` / `.env.example` 增加数据库配置与 `DATABASE_URL`
3. `src/config/env.ts` 把 `DATABASE_URL` 纳入启动校验
4. 拉起容器并验证连接成功

## 目录结构变化

```
node-study/
├── docker-compose.yml   # 【新增】声明数据库等基础设施服务
├── .env                 # 【改】新增 POSTGRES_* 与 DATABASE_URL
├── .env.example         # 【改】同步
└── src/config/env.ts    # 【改】校验新增 DATABASE_URL
```

> 注意：数据库数据不在项目目录里，而是存在 Docker 管理的命名卷 `node-study_pgdata` 中。

---

## 概念讲解（含前端类比）

### 1. 为什么用 Docker 而不本机装 PG？

- **不污染本机**：数据库跑在隔离的容器里，`docker compose down -v` 就彻底清除，不留垃圾。
- **一致性**：团队每个人、CI、生产用的是同一个镜像版本，杜绝「我这能跑你那不行」。
- **可重置**：想要一个干净数据库？删了重建，几秒钟的事。

> 前端类比：类似 `npx` 跑一次性工具不全局安装，只是这里跑的是一整个数据库服务进程。

### 2. docker-compose.yml 关键字段

| 字段                                       | 作用                                                                |
| ------------------------------------------ | ------------------------------------------------------------------- |
| `image: postgres:17-alpine`                | 用哪个镜像；alpine 是精简版，体积小                                 |
| `environment`                              | 首次启动初始化的账号/库名，用 `${}` 从 `.env` 读，不写死密码        |
| `ports: '5432:5432'`                       | `本机端口:容器端口`。所以应用连 `localhost:5432`                    |
| `volumes: pgdata:/var/lib/postgresql/data` | 数据持久化到命名卷，重启不丢                                        |
| `healthcheck`                              | Docker 探测「PG 是否真的可连接」，`pg_isready` 返回成功才算 healthy |

### 3. 常用命令

```bash
docker compose up -d      # 后台拉起所有服务
docker compose ps         # 查看状态（关注 STATUS 是否 healthy）
docker compose logs -f    # 跟踪日志
docker compose down       # 停止并删除容器（数据卷保留）
docker compose down -v    # 连数据卷一起删（彻底清空数据）
```

### 4. DATABASE_URL 连接串格式

```
postgresql://用户:密码@主机:端口/库名?参数
postgresql://node_study:node_study_pwd@localhost:5432/node_study?schema=public
```

Step 5 的 Prisma 会直接读这个连接串连数据库。它是核心配置，没配就 fail fast（不给默认值）。

---

## ⚠️ 排错记录：拉取镜像失败

第一次 `docker compose up` 报错：

```
failed to resolve reference "docker.io/library/postgres:17-alpine":
failed to authorize: ... Get "https://auth.docker.io/token...": EOF
```

**原因**：国内直连 Docker Hub 不稳定。

**本次解决**：用国内公共加速源拉取后打回原标签：

```bash
docker pull docker.m.daocloud.io/library/postgres:17-alpine
docker tag  docker.m.daocloud.io/library/postgres:17-alpine postgres:17-alpine
docker compose up -d
```

**建议的长期解决**（配一次，以后都走加速）：编辑 Docker Desktop → Settings → Docker Engine，加入：

```json
{
  "registry-mirrors": ["https://docker.m.daocloud.io"]
}
```

保存并重启 Docker 后，`docker compose up` 会自动走加速源，无需再手动 pull+tag。

---

## 动手验证

```bash
docker compose up -d
docker compose ps                          # STATUS 应含 (healthy)

# 连进容器执行 SQL
docker exec -it node-study-postgres psql -U node_study -d node_study -c "SELECT version();"
```

## 小结

有了一个随起随停、与生产一致的真实 PostgreSQL。数据库就绪，下一步用 Prisma 把应用和数据库连起来，定义数据模型并生成类型安全的查询客户端。
