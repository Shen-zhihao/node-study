/**
 * server.ts：程序入口。只干一件事——启动 HTTP 服务，开始监听端口。
 * （之前的 src/index.ts 已被这个文件取代。）
 */

import { env } from './config/env.js';
import { createApp } from './app.js';
import { logger } from './lib/logger.js';

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`🚀 服务已启动：http://localhost:${env.PORT}`);
  logger.info(`   健康检查：http://localhost:${env.PORT}/api/health`);
});
