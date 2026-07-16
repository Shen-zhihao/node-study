/**
 * JWT（JSON Web Token）：一张「服务端签发、可自证真伪」的身份凭证。
 *
 * 类比前端最熟的场景：登录后服务端发给你一张「盖了防伪章的门票」，
 * 之后每次请求你都带上这张票，服务端验一下章是不是自己盖的，就知道你是谁——
 * 全程不用再查数据库存 session。这就是 JWT 的「无状态鉴权」。
 *
 * 一个 token 长这样（三段用 . 隔开）：header.payload.signature
 *   - header：算法信息
 *   - payload：我们放进去的数据（这里放 userId、email），⚠️ 只是 base64 编码、并非加密，
 *              任何人都能解开看内容，所以【绝不要往里放密码等敏感信息】。
 *   - signature：用 JWT_SECRET 对前两段签名。改动 payload 会导致签名对不上 → 验签失败。
 * 「防伪」靠的正是签名：没有密钥就伪造不出合法签名。
 */

import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from './errors.js';

// 我们往 token 里放的业务数据。sub（subject）是 JWT 标准字段，习惯用来放「用户标识」。
export interface JwtPayload {
  sub: number; // 用户 id
  email: string;
}

// 签发 token：把用户信息塞进 payload，用密钥签名，返回那串 token 字符串。
export function signToken(payload: JwtPayload): string {
  // expiresIn 的类型较严格（只认 "7d" 这类字面量或数字），env 里是普通 string，
  // 这里显式收窄成 SignOptions 的对应类型即可。
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

// 校验 token：验签 + 检查是否过期。
// 通过：返回解出的 payload；不通过（无效/过期/被篡改）：统一抛 401，交全局错误处理翻译。
export function verifyToken(token: string): JwtPayload {
  try {
    // verify 成功返回 payload；jsonwebtoken 的类型是宽泛的 string | JwtPayload，
    // 我们签发时放的就是 JwtPayload，这里断言回来。
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded as unknown as JwtPayload;
  } catch {
    // TokenExpiredError / JsonWebTokenError 等都归为「凭证无效」，不把内部细节暴露给客户端。
    throw new UnauthorizedError('token 无效或已过期');
  }
}
