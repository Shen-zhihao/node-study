/**
 * Service 层：只写「业务逻辑」，完全不认识 HTTP。
 *
 * 注意这里没有 req / res —— 它不知道自己是被 HTTP 调用的，还是被定时任务、
 * 被测试用例调用的。这种「纯粹」正是分层的价值：业务逻辑可以独立复用和测试。
 */

export interface HealthStatus {
  status: 'ok';
  /** 进程已运行的秒数 */
  uptime: number;
  timestamp: string;
}

export function getHealthStatus(): HealthStatus {
  return {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}
