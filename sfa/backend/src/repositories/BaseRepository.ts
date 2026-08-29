import { Env } from '../types';

export class BaseRepository {
  protected collection: string;
  protected env: Env;

  constructor(env: Env, collection: string) {
    this.env = env;
    this.collection = collection;
  }

  async find(query: string, params: any[] = []) {
    let sql = query.trim();
    if (!sql.toUpperCase().startsWith('SELECT')) {
      sql = `SELECT * FROM ${this.collection} ${sql}`;
    }
    const stmt = this.env.chikusfa_db.prepare(sql).bind(...params);
    const { results } = await stmt.all();
    return results;
  }

  async findById(id: string) {
    return await this.env.chikusfa_db.prepare(`SELECT * FROM ${this.collection} WHERE id = ?`).bind(id).first();
  }

  private sanitizeValue(v: any) {
    if (v === undefined) return null;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (typeof v === 'object' && v !== null && !(v instanceof ArrayBuffer) && !ArrayBuffer.isView(v)) {
      return JSON.stringify(v);
    }
    return v;
  }

  async insert(id: string, keys: string[], values: any[]) {
    const columns = ['id', ...keys].join(', ');
    const placeholders = ['?', ...keys.map(() => '?')].join(', ');
    const vals = [id, ...values.map(v => this.sanitizeValue(v))];
    return this.env.chikusfa_db.prepare(`INSERT INTO ${this.collection} (${columns}) VALUES (${placeholders})`).bind(...vals);
  }

  async update(id: string, keys: string[], values: any[]) {
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const vals = [...values.map(v => this.sanitizeValue(v)), id];
    return this.env.chikusfa_db.prepare(`UPDATE ${this.collection} SET ${setClause} WHERE id = ?`).bind(...vals);
  }

  async softDelete(id: string) {
    return this.env.chikusfa_db.prepare(`UPDATE ${this.collection} SET is_active = 0 WHERE id = ?`).bind(id);
  }

  async batchExecute(stmts: any[]) {
    for (let i = 0; i < stmts.length; i += 100) {
      await this.env.chikusfa_db.batch(stmts.slice(i, i + 100));
    }
  }

  async executeSingle(stmt: any) {
    await this.env.chikusfa_db.batch([stmt]);
  }
}
