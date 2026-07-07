/**
 * User Controller：把 HTTP 请求「翻译」成对 Service 的调用，再把结果写回响应。
 *
 * 这一层只做三件事：从 req 取数据 → 调 service → 用 res 返回。
 * 不写业务逻辑，也尽量不碰数据库细节。
 *
 * ⚠️ 关于「校验」和「错误处理」：
 *   - 这里只做了最基础的 id 解析和「查不到 → 404」。
 *   - 更严谨的请求体校验（email 格式等）、统一响应格式、以及把 Prisma 抛出的
 *     错误（重复 email / 更新不存在的 id）优雅转成 4xx —— 全部留到 Step 7 收口。
 *   - 所以现在用同一个 email 创建两次、或更新不存在的用户，会得到 500，这正是
 *     下一步要解决的问题。
 */

import type { Request, Response } from 'express';
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../services/user.service.js';

// GET /api/users —— 列出全部用户
export async function getUsers(_req: Request, res: Response): Promise<void> {
  const users = await listUsers();
  res.json(users);
}

// GET /api/users/:id —— 查单个用户
export async function getUser(req: Request, res: Response): Promise<void> {
  // 路径参数永远是字符串，数据库主键是数字，这里要转一次。
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: 'id 必须是数字' });
    return;
  }

  const user = await getUserById(id);
  if (user === null) {
    res.status(404).json({ message: `用户不存在: ${id}` });
    return;
  }

  res.json(user);
}

// POST /api/users —— 创建用户
export async function postUser(req: Request, res: Response): Promise<void> {
  // req.body 由 app.ts 里的 express.json() 中间件解析而来。
  const { email, name } = req.body as { email?: string; name?: string };

  const user = await createUser({ email: email!, name });
  // 201 Created：语义化状态码，表示「资源已新建成功」。
  res.status(201).json(user);
}

// PATCH /api/users/:id —— 更新用户（部分字段）
export async function patchUser(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: 'id 必须是数字' });
    return;
  }

  const { email, name } = req.body as { email?: string; name?: string };
  const user = await updateUser(id, { email, name });
  res.json(user);
}

// DELETE /api/users/:id —— 删除用户
export async function removeUser(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: 'id 必须是数字' });
    return;
  }

  await deleteUser(id);
  // 204 No Content：删除成功，没有响应体。
  res.status(204).send();
}
