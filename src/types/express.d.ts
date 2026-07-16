/**
 * 类型增强（declaration merging）：给 Express 的 Request 对象补上 `user` 字段。
 *
 * 痛点：authenticate 中间件验完 token 后想把「当前登录用户」挂到 req 上（req.user），
 *       但 Express 官方类型里 Request 没有 user 字段，直接写 req.user 会报类型错误。
 *
 * 解决：用 TS 的「声明合并」——在全局 Express 命名空间里给 Request 接口再补一个属性。
 *       这不是改源码，而是「往已有类型上叠加声明」，编译后全项目的 req.user 都有类型了。
 *
 * 为什么是可选（user?）：不是每个请求都过了 authenticate（如登录、注册本身就没有 user），
 *       所以类型上它可能不存在。受保护路由里能确定它已被赋值。
 */

import 'express';
import type { JwtPayload } from '../lib/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
