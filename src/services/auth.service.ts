/**
 * Auth Service：注册 / 登录的「纯业务逻辑」。不认识 HTTP，只处理输入 → 输出。
 *
 * 核心职责：
 *   - 注册：把密码哈希后落库（email 重复由 Prisma P2002 → 全局处理器翻译成 409）
 *   - 登录：查用户 → 比对密码 → 签发 JWT
 * 两者返回的 user 都【剔除了 password 字段】，绝不让密码哈希流出到响应里。
 */

import type { User } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { signToken } from '../lib/jwt.js';
import { UnauthorizedError } from '../lib/errors.js';

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// 对外返回的「安全用户」：去掉 password 后的 User。
export type SafeUser = Omit<User, 'password'>;

// 认证成功后统一返回：一张 token + 当前用户信息。
export interface AuthResult {
  token: string;
  user: SafeUser;
}

// 从完整 User 里挑出「可安全对外暴露」的字段。
// 刻意用「白名单」而不是「删掉 password」的黑名单：以后 User 若新增敏感字段（如
// resetToken），只要不主动加进这里就绝不会泄露——默认安全，比「记得删」更可靠。
function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// 注册：哈希密码 → 建用户 → 直接签发 token（注册即登录，省一次登录请求）。
export async function register(input: RegisterInput): Promise<AuthResult> {
  logger.info({ email: input.email }, '用户注册');

  const hashed = await hashPassword(input.password);
  // email 唯一约束若冲突，Prisma 抛 P2002 → 全局错误处理器翻译成 409 Conflict。
  const user = await prisma.user.create({
    data: { email: input.email, name: input.name, password: hashed },
  });

  const token = signToken({ sub: user.id, email: user.email });
  return { token, user: toSafeUser(user) };
}

// 登录：查用户 → 比对密码 → 签发 token。
export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // 安全要点：无论是「邮箱不存在」还是「密码不对」，都回同一句含糊的 401，
  // 不给攻击者区分「这个邮箱到底注册没注册」的线索。
  if (user === null) {
    throw new UnauthorizedError('邮箱或密码不正确');
  }

  const ok = await verifyPassword(input.password, user.password);
  if (!ok) {
    logger.warn({ email: input.email }, '登录失败：密码不正确');
    throw new UnauthorizedError('邮箱或密码不正确');
  }

  const token = signToken({ sub: user.id, email: user.email });
  return { token, user: toSafeUser(user) };
}
