/**
 * User 请求体的校验规则（用 zod 描述）。
 *
 * 校验放在「进入控制器之前」的中间件里做（见 middlewares/validate.ts）。
 * 好处：控制器拿到的 req.body 一定是「已校验、已清洗、带类型」的干净数据，
 * 不用再写一堆 if (!email) 的防御代码。
 */

import { z } from 'zod';

// 创建用户：email 必填且必须是合法邮箱；name 可选，给了就不能是空串。
export const createUserSchema = z.object({
  email: z.email('email 格式不正确'),
  name: z.string().min(1, 'name 不能为空字符串').optional(),
});

// 更新用户：两个字段都可选（PATCH 语义 = 只改传了的字段），
// 但用 .refine 要求「至少传一个」，否则这次更新没有意义。
export const updateUserSchema = z
  .object({
    email: z.email('email 格式不正确').optional(),
    name: z.string().min(1, 'name 不能为空字符串').optional(),
  })
  .refine((data) => data.email !== undefined || data.name !== undefined, {
    message: '至少要提供 email 或 name 其中一个字段',
  });

// 从 schema 反推出 TypeScript 类型，供 service/controller 复用，避免手写重复接口。
export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
