/**
 * User 路由：定义 users 资源的 5 个 RESTful 端点，映射到对应控制器函数。
 *
 * 注意「写操作」多了一层 validate 中间件：请求会先经过校验，通过了才进控制器。
 * 中间件按书写顺序执行：validate(...) → 控制器。
 */

import { Router } from 'express';
import {
  getUsers,
  getUser,
  postUser,
  patchUser,
  removeUser,
} from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.js';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema.js';

export const userRouter = Router();

userRouter.get('/', getUsers); //                              GET    /api/users
userRouter.post('/', validate(createUserSchema), postUser); // POST   /api/users
userRouter.get('/:id', getUser); //                            GET    /api/users/:id
userRouter.patch('/:id', validate(updateUserSchema), patchUser); // PATCH  /api/users/:id
userRouter.delete('/:id', removeUser); //                      DELETE /api/users/:id
