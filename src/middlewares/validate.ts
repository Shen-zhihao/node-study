/**
 * 校验中间件工厂：传入一个 zod schema，返回一个「校验 req.body」的中间件。
 *
 * 用法（见 user.routes.ts）：
 *   userRouter.post('/', validate(createUserSchema), postUser);
 *
 * 校验通过：用「解析后的干净数据」覆盖 req.body（会剥掉多余字段、完成类型转换），
 *          然后 next() 放行进入控制器。
 * 校验失败：next(ValidationError)，交给全局错误处理中间件统一返回 400。
 */

import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '../lib/errors.js';

export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // safeParse 不抛异常，返回 { success, data | error }，方便我们自己决定怎么处理。
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // 把 zod 的 issues 整理成「字段 → 错误信息」的精简数组，放进 details。
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      next(new ValidationError('请求参数校验失败', details));
      return;
    }

    // 覆盖为校验后的数据，控制器后续拿到的就是干净、带类型的 body。
    req.body = result.data;
    next();
  };
}
