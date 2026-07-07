/**
 * 请求日志中间件（Step 8 升级版）。做两件事：
 *   1) 为每个请求生成/沿用一个 requestId，并开启「请求上下文」——
 *      这样从这里往后的整条调用链（控制器、service…）打的每条日志都自动带上它。
 *   2) 请求处理完（res 'finish'）时，用结构化字段记录一条访问日志。
 *
 * requestId 也会写回响应头 x-request-id，前端/网关拿到后可用于跨服务排查同一请求。
 */

import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { logger } from '../lib/logger.js';
import { runWithContext } from '../lib/request-context.js';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // 优先沿用上游（网关/前端）传来的 x-request-id，实现跨服务链路贯通；没有就自己生成。
  const headerId = req.headers['x-request-id'];
  const requestId = (Array.isArray(headerId) ? headerId[0] : headerId) ?? randomUUID();

  // 回写响应头，方便调用方拿到本次请求的 id。
  res.setHeader('x-request-id', requestId);

  const start = Date.now();

  // res 'finish'：响应发送完毕，此时能拿到最终状态码和总耗时。
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    // 结构化日志：这些字段在 JSON 里是独立键，生产环境可按 statusCode/durationMs 检索、告警。
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
      },
      '请求完成',
    );
  });

  // 把后续处理都跑在「带 requestId 的上下文」里，next() 之后的整条链路都能取到它。
  runWithContext({ requestId }, next);
}
