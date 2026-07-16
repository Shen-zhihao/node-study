/**
 * 鉴权中间件：受保护路由的「门卫」。
 *
 * 前端类比：这就是路由守卫（beforeEach / <PrivateRoute>）——进受保护页面前先检查登录态，
 *          没登录就拦下。只不过这里拦的是 HTTP 请求，验的是 JWT。
 *
 * 工作流程：
 *   1) 从请求头读 Authorization: Bearer <token>
 *   2) 没有 / 格式不对 → 抛 401（未认证）
 *   3) 有则 verifyToken 验签+验过期，通过就把用户信息挂到 req.user
 *   4) next() 放行，后续控制器可直接用 req.user 拿到「当前是谁」
 *
 * 用法（见 auth.routes.ts / user.routes.ts）：
 *   router.get('/me', authenticate, getMe);   // 单个路由加保护
 *   router.use(authenticate);                  // 整个 router 都加保护
 */

import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt.js';
import { UnauthorizedError } from '../lib/errors.js';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  // 约定俗成的传法：请求头 Authorization: "Bearer <token>"
  const header = req.headers.authorization;

  if (header === undefined || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('缺少 Authorization: Bearer <token> 请求头');
  }

  // 切掉前缀 "Bearer "（7 个字符），剩下的才是 token 本体。
  const token = header.slice(7).trim();
  if (token === '') {
    throw new UnauthorizedError('token 为空');
  }

  // 验签+验过期：不通过会抛 401（见 jwt.ts），交全局错误处理统一响应。
  const payload = verifyToken(token);

  // 挂到 req 上，供后续控制器/service 使用（类型来自 types/express.d.ts 的增强）。
  req.user = payload;
  next();
}
