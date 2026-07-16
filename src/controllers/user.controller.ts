/**
 * User Controller：把 HTTP 请求「翻译」成对 Service 的调用，再把结果写回响应。
 *
 * Step 7 之后，这一层变得很薄：
 *   - 请求体校验已由 validate 中间件在进来前做完 → req.body 是干净、带类型的数据
 *   - 「查不到 / 冲突」等错误一律 throw，交给全局错误处理中间件统一收口
 *   - 成功响应统一走 sendSuccess，产出约定的 { success, data } 信封
 * 所以控制器不再有一堆 if 防御和手写状态码，只剩「取数据 → 调 service → 返回」。
 */

import type { Request, Response } from 'express';
import {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../services/user.service.js';
import { sendSuccess } from '../lib/api-response.js';
import { NotFoundError, ValidationError } from '../lib/errors.js';
import type { UpdateUserBody } from '../schemas/user.schema.js';

// 把路径参数 :id 解析成正整数，非法就抛 400。抽成小函数供各处复用。
// Express 5 里 req.params 的值类型是 string | string[]，所以这里收 unknown 更稳。
function parseId(raw: unknown): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('id 必须是正整数');
  }
  return id;
}

// GET /api/users —— 列出全部用户
export async function getUsers(_req: Request, res: Response): Promise<void> {
  const users = await listUsers();
  sendSuccess(res, users);
}

// GET /api/users/:id —— 查单个用户
export async function getUser(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);
  const user = await getUserById(id);
  // findUnique 查不到返回 null → 主动抛 404，由全局处理器翻译。
  if (user === null) {
    throw new NotFoundError(`用户不存在: ${id}`);
  }
  sendSuccess(res, user);
}

// 注：创建用户的入口已移到「注册」接口（POST /api/auth/register），
// users 资源只保留 读 / 改 / 删，不再重复实现建用户逻辑。

// PATCH /api/users/:id —— 更新用户（body 已由 validate(updateUserSchema) 校验）
export async function patchUser(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);
  const input = req.body as UpdateUserBody;
  // id 不存在时 Prisma 抛 P2025 → 全局处理器翻译成 404，这里无需预先查一次。
  const user = await updateUser(id, input);
  sendSuccess(res, user);
}

// DELETE /api/users/:id —— 删除用户
export async function removeUser(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);
  await deleteUser(id);
  // 204 No Content：删除成功、无响应体（这是唯一不套 success 信封的情况）。
  res.status(204).send();
}
