const { pool } = require('../config/database');

const School = {
  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM schools WHERE id = $1', [id]);
    return rows[0] ? formatSchool(rows[0]) : null;
  },
  async findByCode(code) {
    const { rows } = await pool.query('SELECT * FROM schools WHERE code = $1', [code.toUpperCase()]);
    return rows[0] ? formatSchool(rows[0]) : null;
  },
  async find(filter = {}) {
    let q = 'SELECT * FROM schools WHERE 1=1';
    const vals = [];
    let i = 1;
    if (filter.is_active !== undefined) { q += ` AND is_active = $${i++}`; vals.push(filter.is_active); }
    q += ' ORDER BY name ASC';
    const { rows } = await pool.query(q, vals);
    return rows.map(formatSchool);
  },
  async create(data) {
    const { name, code, address = '', city = '', state = '', logo = '', admin_id, is_active = true } = data;
    const { rows } = await pool.query(
      `INSERT INTO schools (name, code, address, city, state, logo, admin_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, code.toUpperCase(), address, city, state, logo, admin_id || null, is_active]
    );
    if (rows && rows.length > 0) return formatSchool(rows[0]);
    return this.findByCode(code);
  },
  async findByIdAndUpdate(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
    if (data.student_count_inc !== undefined) { fields.push(`student_count = student_count + $${idx++}`); values.push(data.student_count_inc); }
    if (data.is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(data.is_active); }
    if (data.logo !== undefined) { fields.push(`logo = $${idx++}`); values.push(data.logo); }
    if (fields.length === 0) return this.findById(id);
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const { rows } = await pool.query(`UPDATE schools SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    return rows[0] ? formatSchool(rows[0]) : null;
  },
  async findByIdAndDelete(id) {
    const { rows } = await pool.query('DELETE FROM schools WHERE id = $1 RETURNING *', [id]);
    return rows[0] ? formatSchool(rows[0]) : null;
  },
};

function formatSchool(row) {
  return { _id: row.id, id: row.id, name: row.name, code: row.code, address: row.address, city: row.city, state: row.state, logo: row.logo, adminId: row.admin_id, isActive: row.is_active, studentCount: row.student_count, createdAt: row.created_at };
}

module.exports = School;
