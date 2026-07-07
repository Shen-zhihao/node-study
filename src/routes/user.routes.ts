/**
 * User 路由：定义 users 资源的 5 个 RESTful 端点，映射到对应控制器函数。
 * 路由只做「路径 + 方法 → 控制器」的映射，不写任何逻辑。
 *
 * 这里的路径都是相对的，挂载时会加上前缀（见 routes/index.ts），
 * 最终对外是 /api/users。
 */

import { Router } from 'express';
import {
  getUsers,
  getUser,
  postUser,
  patchUser,
  removeUser,
} from '../controllers/user.controller.js';

export const userRouter = Router();

userRouter.get('/', getUsers); // GET    /api/users      列表
userRouter.post('/', postUser); // POST   /api/users      新建
userRouter.get('/:id', getUser); // GET    /api/users/:id  查单个
userRouter.patch('/:id', patchUser); // PATCH  /api/users/:id  更新
userRouter.delete('/:id', removeUser); // DELETE /api/users/:id  删除
