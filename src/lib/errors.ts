/**
 * 自定义错误体系：让「业务里 throw 一个错」和「返回什么 HTTP 状态码」对应起来。
 *
 * 为什么要有它？
 *   Service 层不认识 HTTP，但它知道「这个用户不存在」。它不该自己写 res.status(404)，
 *   而是 throw 一个语义化的错误（NotFoundError），由全局错误处理中间件统一翻译成 404。
 *   这样业务逻辑和 HTTP 细节彻底解耦。
 */

// 所有「可预期的业务错误」的基类。带上 statusCode（HTTP 状态码）和 code（机器可读的错误码）。
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    // 额外细节，比如校验失败时每个字段的具体问题。可选。
    public readonly details?: unknown,
  ) {
    super(message);
    // 让 instanceof 在编译到 ES5/ES6 时依然可靠（继承内置类的老坑）。
    this.name = new.target.name;
  }
}

// 404：资源不存在。
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, 'NOT_FOUND', message);
  }
}

// 401：未认证。没带 token、token 过期/无效、或登录时账号密码不对，都归到这里。
// 安全提醒：登录失败时别告诉调用方「到底是邮箱不存在还是密码错」，统一含糊回应，
// 否则等于帮攻击者枚举哪些邮箱已注册。
export class UnauthorizedError extends AppError {
  constructor(message = '未认证或凭证无效') {
    super(401, 'UNAUTHORIZED', message);
  }
}

// 409：冲突，比如 email 已被占用。
export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
  }
}

// 400：请求参数校验不通过。details 里放具体哪些字段错了。
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}
