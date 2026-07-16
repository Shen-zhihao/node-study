/**
 * 认证相关请求体的校验规则（zod）。和 user.schema 一样，校验在进控制器前完成。
 */

import { z } from 'zod';

// 注册：邮箱 + 密码（必填），name 可选。
// 密码这里只做「最低长度」这类基础规则；更复杂的强度策略（大小写/符号）按需再加。
export const registerSchema = z.object({
  email: z.email('email 格式不正确'),
  password: z.string().min(6, '密码至少 6 位'),
  name: z.string().min(1, 'name 不能为空字符串').optional(),
});

// 登录：邮箱 + 密码。这里对密码不再校验长度——
// 登录只管「对不对」，格式规则是注册时的事，登录时多校验反而泄露了密码规则。
export const loginSchema = z.object({
  email: z.email('email 格式不正确'),
  password: z.string().min(1, '密码不能为空'),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
