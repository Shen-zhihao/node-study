/**
 * 请求上下文：用 AsyncLocalStorage 实现「请求链路追踪」。
 *
 * 痛点：一个请求会穿过 中间件 → 控制器 → service → ...，如果想在每一层的日志里都带上
 *       同一个 requestId，最笨的办法是「层层传参」——每个函数都多一个 requestId 参数，
 *       侵入性极强。
 *
 * AsyncLocalStorage 是 Node 内置能力：它能创建一块「跟着异步调用链自动流动」的存储。
 *       在请求入口 als.run(store, cb) 起一个上下文，之后这条链路上任意深度的 await 里，
 *       都能用 als.getStore() 取回同一个 store —— 不用传参。
 *
 * 配合 logger 的 mixin（见 logger.ts），每条日志就能自动带上当前请求的 requestId。
 */

import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  requestId: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

// 在给定上下文里运行一段逻辑（整个请求处理都跑在它内部）。
export function runWithContext<T>(context: RequestContext, callback: () => T): T {
  return storage.run(context, callback);
}

// 取当前请求的 requestId；不在请求上下文里（如启动日志）时返回 undefined。
export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}
