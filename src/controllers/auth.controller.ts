/**
 * Auth Controller：把注册/登录的 HTTP 请求翻译成对 Auth Service 的调用。
 *
 * 和 user.controller 一样很薄：body 已被 validate 中间件校验过，
 * 错误一律 throw 交全局处理器，成功走 sendSuccess。
 */

import type { Request, Response } from 'express';
import { register, login } from '../services/auth.service.js';
import { sendSuccess } from '../lib/api-response.js';
import type { RegisterBody, LoginBody } from '../schemas/auth.schema.js';

// POST /api/auth/register —— 注册（body 已由 validate(registerSchema) 校验）
export async function postRegister(req: Request, res: Response): Promise<void> {
  const input = req.body as RegisterBody;
  const result = await register(input);
  // 201 Created：新建了用户资源。返回 { token, user }。
  sendSuccess(res, result, 201);
}

// POST /api/auth/login —— 登录（body 已由 validate(loginSchema) 校验）
export async function postLogin(req: Request, res: Response): Promise<void> {
  const input = req.body as LoginBody;
  const result = await login(input);
  sendSuccess(res, result);
}

// GET /api/auth/me —— 返回当前登录用户（需先过 authenticate 中间件）
// 演示「受保护路由」：能走到这里，说明 token 已验证通过、req.user 已挂好。
export function getMe(req: Request, res: Response): void {
  sendSuccess(res, req.user);
}
