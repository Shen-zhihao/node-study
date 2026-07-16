/**
 * User 路由：定义 users 资源的 RESTful 端点，映射到对应控制器函数。
 *
 * Step 9 起，整个 users 资源都是「受保护」的：router.use(authenticate) 放在最前面，
 * 于是下面每一条路由都会先过门卫（没带合法 token 直接 401），再进各自的 validate / 控制器。
 * 中间件按书写顺序执行：authenticate → validate(...) → 控制器。
 *
 * 创建用户的入口已移到注册接口（POST /api/auth/register），所以这里不再有 POST /。
 */

import { Router } from 'express';
import { getUsers, getUser, patchUser, removeUser } from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authenticate.js';
import { updateUserSchema } from '../schemas/user.schema.js';

export const userRouter = Router();

// 一行给整个 users 资源加上登录保护（作用于其后所有路由）。
userRouter.use(authenticate);

userRouter.get('/', getUsers); //                                 GET    /api/users
userRouter.get('/:id', getUser); //                              GET    /api/users/:id
userRouter.patch('/:id', validate(updateUserSchema), patchUser); // PATCH  /api/users/:id
userRouter.delete('/:id', removeUser); //                         DELETE /api/users/:id
