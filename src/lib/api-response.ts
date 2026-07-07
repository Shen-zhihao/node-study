/**
 * 统一响应格式：全项目所有接口都返回同一种「信封」结构，前端处理起来才省心。
 *
 *   成功：{ "success": true,  "data": <任意载荷> }
 *   失败：{ "success": false, "error": { "code": "...", "message": "...", "details"?: ... } }
 *
 * 成功响应由这里的 sendSuccess 产出；失败响应统一由全局错误处理中间件产出（见 error-handler.ts）。
 */

import type { Response } from 'express';

// 成功响应的信封类型（导出给需要的地方复用/测试）。
export interface SuccessBody<T> {
  success: true;
  data: T;
}

// 失败响应的信封类型。
export interface ErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// 发送成功响应。默认 200，创建资源时传 201。
export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  const body: SuccessBody<T> = { success: true, data };
  res.status(status).json(body);
}
