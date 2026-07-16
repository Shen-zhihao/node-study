/**
 * Auth 路由：认证相关端点。
 *
 *   POST /api/auth/register  注册（公开）
 *   POST /api/auth/login     登录（公开）
 *   GET  /api/auth/me        查看当前登录用户（受保护，需带 token）
 *
 * 写操作先过 validate 校验；/me 先过 authenticate 门卫。中间件按书写顺序执行。
 */

import { Router } from 'express';
import { postRegister, postLogin, getMe } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authenticate.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), postRegister); // POST /api/auth/register
authRouter.post('/login', validate(loginSchema), postLogin); //         POST /api/auth/login
authRouter.get('/me', authenticate, getMe); //                          GET  /api/auth/me
