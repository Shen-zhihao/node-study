/**
 * Controller 层：HTTP 世界与业务世界的「翻译官」。
 *
 * 职责：
 *   1) 从 req 里取出需要的数据（参数、body、query）
 *   2) 调用 Service 处理业务
 *   3) 把结果通过 res 返回
 * 它「不写业务逻辑」，只做搬运和适配。
 */

import type { Request, Response } from 'express';
import { getHealthStatus } from '../services/health.service.js';

// _req 前缀下划线：约定「这个参数我用不到」，配合 ESLint 规则不报未使用。
export function healthCheck(_req: Request, res: Response): void {
  const status = getHealthStatus();
  // res.json() 是 Express 提供的便利方法：自动 JSON.stringify + 设置 Content-Type。
  // 对比 Step 1 原生写法要手动 writeHead + JSON.stringify，这就是框架帮你省的事。
  res.json(status);
}
