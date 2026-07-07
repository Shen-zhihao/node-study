/**
 * 环境变量的「唯一入口」。
 *
 * 原则：全项目任何地方都不要直接读 process.env，一律从这里 import { env }。
 * 好处：
 *   1) 校验：启动时就检查环境变量是否齐全/合法，配错立刻崩（fail fast），
 *      而不是等到某个接口被调用时才莫名其妙出错。
 *   2) 类型：env.PORT 是 number、env.NODE_ENV 是联合类型，有自动补全，不再是 any。
 *   3) 转换：把字符串 "3000" 自动转成数字 3000。
 */

// 这一句会读取项目根目录的 .env 文件，把里面的键值塞进 process.env。
// 必须在读取任何环境变量「之前」执行，所以放在文件最顶部。
import 'dotenv/config';
import { z } from 'zod';

// 用 zod 定义「我们的服务需要哪些环境变量、各自长什么样」。
const envSchema = z.object({
  // 运行环境：只能是这三个值之一，默认 development。
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // 端口：环境变量都是字符串，z.coerce.number() 会自动转成数字。
  // .default(3000) 表示没配时用 3000。
  PORT: z.coerce.number().int().positive().default(3000),

  // 数据库连接串。这是 Step 5 的 Prisma 要用的核心配置，缺了服务就没意义，
  // 所以不给默认值——没配就直接 fail fast。
  DATABASE_URL: z.string().min(1, 'DATABASE_URL 不能为空'),

  // 日志级别（Step 8）。pino 的级别从低到高：trace < debug < info < warn < error < fatal。
  // 设为某级别后，只输出「≥ 该级别」的日志。开发想看 SQL/调试细节可设 debug。
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
});

// 校验。safeParse 不会抛异常，而是返回 { success, data | error }，方便我们自定义报错。
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // 校验失败：打印每一条问题，然后直接退出进程（exit code 1 = 异常退出）。
  console.error('❌ 环境变量校验失败：');
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

// 校验通过：导出这个「干净、带类型」的配置对象供全项目使用。
export const env = parsed.data;

// 顺手导出两个布尔值，业务里判断环境时更好读：if (isDev) { ... }
export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
