/**
 * Step 1：用 Node 原生 http 模块，手写第一个 HTTP 服务器。
 *
 * 这一步故意「不用任何框架」，目的是让你看清：
 * 一个 Web 服务器的本质，就是「监听端口 → 收到请求 → 返回响应」。
 * 之后 Step 3 我们会用 Express 替换它，你就能真切体会到框架帮我们省了什么。
 */

// `node:` 前缀表示这是 Node 内置模块（不是从 node_modules 装的），推荐显式写出。
import http from 'node:http';

// 从统一的配置入口拿端口，而不是直接读 process.env。
// 注意：这里的 env.PORT 已经是 number 类型了，有类型提示。
import { env } from './config/env.js';

const PORT = env.PORT;

// createServer 接收一个回调，每来一个请求就执行一次。
// req = 请求对象（谁来的、要什么），res = 响应对象（我们往里写东西返回给对方）。
const server = http.createServer((req, res) => {
  // 简单打印一下，让你在终端看到每个请求。
  console.log(`收到请求：${req.method} ${req.url}`);

  // 只处理 GET /health 这个「健康检查」接口，其余一律 404。
  // 健康检查是企业级服务的标配：负载均衡/K8s 靠它判断你的服务活没活着。
  if (req.method === 'GET' && req.url === '/health') {
    // 必须先设置状态码和响应头，再写响应体。
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // 兜底：其它路径返回 404。
  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ message: 'Not Found' }));
});

// 开始监听端口。这一句执行后，进程不会退出——它会一直挂着等请求。
server.listen(PORT, () => {
  console.log(`🚀 服务已启动：http://localhost:${PORT}`);
  console.log(`   试试健康检查：http://localhost:${PORT}/health`);
});
