/**
 * Prisma 客户端单例。
 *
 * 为什么是单例？
 *   PrismaClient 内部维护一个「数据库连接池」。如果每个请求都 new 一个，
 *   连接数会暴涨、很快耗尽数据库。所以全项目共享【同一个】实例。
 *   任何 service 里 `import { prisma } from '../lib/prisma.js'` 即可。
 *
 * 关于「驱动适配器」(driver adapter)：
 *   Prisma 7 起，运行时通过标准适配器接口连数据库。PostgreSQL 用 @prisma/adapter-pg。
 *   好处是连接层可替换，也更贴近底层驱动生态。
 */

import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { env, isProd } from '../config/env.js';

// 适配器负责实际的数据库连接（用连接串）。
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
  // 开发环境打印 SQL，方便你看到 Prisma 到底发了什么语句；生产只记录错误。
  log: isProd ? ['error'] : ['query', 'warn', 'error'],
});
