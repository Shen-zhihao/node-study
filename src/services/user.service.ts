/**
 * User Service：用户相关的「纯业务逻辑」，通过 Prisma 读写数据库。
 *
 * 和 health.service 一样，这里不认识 HTTP —— 没有 req/res，只有「输入参数」
 * 和「返回数据」。它可以被控制器调用，也可以被定时任务、测试用例调用。
 *
 * Prisma 的查询方法都返回 Promise，所以这里的函数都是 async。
 */

import { prisma } from '../lib/prisma.js';

// 更新用户的输入：两个字段都可选（只传想改的）。
export interface UpdateUserInput {
  email?: string;
  name?: string;
}

// Step 9 起：User 多了 password（密码哈希）字段。所有「读用户」的查询都用 omit 把它排除，
// 这样密码哈希绝不会顺着 /api/users 的响应流出去。
// 说明：创建用户的职责已经交给「注册」接口（POST /api/auth/register，会加密密码），
// users 资源不再自己建用户，避免出现「绕过密码加密」的第二条建用户路径。
const OMIT_PASSWORD = { password: true } as const;

// 列出全部用户。orderBy 让结果稳定（按 id 升序），否则顺序不保证。
export function listUsers() {
  return prisma.user.findMany({ orderBy: { id: 'asc' }, omit: OMIT_PASSWORD });
}

// 按 id 查单个用户。findUnique 查不到会返回 null（不是抛错），
// 由控制器决定「查不到」怎么回应（这里我们回 404）。
export function getUserById(id: number) {
  return prisma.user.findUnique({ where: { id }, omit: OMIT_PASSWORD });
}

// 更新用户。id 不存在时 Prisma 抛 P2025 → 全局处理器翻译成 404。
export function updateUser(id: number, input: UpdateUserInput) {
  return prisma.user.update({ where: { id }, data: input, omit: OMIT_PASSWORD });
}

// 删除用户。id 不存在同样抛 P2025。
export function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}
