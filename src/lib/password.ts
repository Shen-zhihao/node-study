/**
 * 密码加密：把用户的明文密码变成「不可逆的哈希值」再入库。
 *
 * 为什么不能存明文？
 *   数据库一旦泄露，明文密码等于直接送人。而且很多人到处用同一个密码，
 *   泄露一个站点会连累其他站点。所以行业铁律：密码永远只存哈希，绝不存明文。
 *
 * 为什么用 bcrypt，而不是 md5/sha256？
 *   1) 慢是特性：bcrypt 故意设计得「算一次要花点时间」，让暴力破解代价极高
 *      （md5 一秒能算上亿次，bcrypt 一秒只能算几千次）。
 *   2) 自带 salt：每次哈希都会掺入一段随机「盐」，所以两个人用同样的密码，
 *      存进库的哈希也完全不同——攻击者没法用「彩虹表」批量反查。
 *   3) 盐和成本参数都编码在最终那串哈希里，验证时 bcrypt 自己能读出来，无需我们额外存。
 */

import bcrypt from 'bcryptjs';

// 成本因子（cost factor）：每 +1，计算量翻倍。10~12 是当下常见取值，
// 在「够安全」和「登录别太慢」之间平衡。
const SALT_ROUNDS = 10;

// 把明文密码哈希成一串可安全入库的字符串（形如 $2b$10$....）。
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// 校验：明文密码是否与库里的哈希匹配。返回 true/false，绝不「解密」——哈希本就不可逆。
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
