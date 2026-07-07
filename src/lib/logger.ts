/**
 * 全局日志器（pino）。取代之前到处写的 console.log。
 *
 * 为什么用 pino 而不是 console？
 *   1) 结构化：默认输出 JSON，每条日志是一个对象（含时间、级别、字段），
 *      机器可解析——生产环境采集到 ELK / Loki 等系统里能直接检索、告警。
 *   2) 分级：trace/debug/info/warn/error/fatal，按 LOG_LEVEL 过滤，生产不刷屏。
 *   3) 快：pino 以「低开销」著称，序列化在旁路进行，几乎不拖慢主流程。
 *
 * 两种输出形态：
 *   - 开发环境：经 pino-pretty 转成彩色、人类友好的单行文本，方便肉眼看。
 *   - 生产环境：原始 JSON，交给日志采集系统。
 */

import { pino } from 'pino';
import { env, isProd } from '../config/env.js';
import { getRequestId } from './request-context.js';

export const logger = pino({
  level: env.LOG_LEVEL,

  // mixin：每条日志输出前都会调用它，把返回的字段并进这条日志。
  // 这里从「请求上下文」取 requestId —— 于是任意层打的日志都自动带上 requestId，
  // 无需层层传参。不在请求上下文里（如启动日志）时不加该字段。
  mixin() {
    const requestId = getRequestId();
    return requestId ? { requestId } : {};
  },

  // 开发环境用 pino-pretty 美化；生产直接输出 JSON（transport 留空）。
  transport: isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          // 让 requestId 显示在每行末尾，方便肉眼串起同一条请求的多行日志。
          messageFormat: '{msg}',
          ignore: 'pid,hostname',
        },
      },
});
