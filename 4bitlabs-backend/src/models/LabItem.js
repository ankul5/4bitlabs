const { pool } = require('../config/database');

const LabItem = {
  async find(filter = {}) {
    let q = 'SELECT * FROM lab_items WHERE 1=1';
    const vals = []; let i = 1;
    if (filter.school_id) { q += ` AND school_id = $${i++}`; vals.push(filter.school_id); }
    if (filter.status) { q += ` AND status = $${i++}`; vals.push(filter.status); }
    q += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(q, vals);
    return rows;
  },
  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM lab_items WHERE id = $1', [id]);
    return rows[0] || null;
  },
  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO lab_items (name, quantity, description, status, category, school_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [data.name, data.quantity || 0, data.description || '', data.status || 'available', data.category || 'General', data.school_id, data.created_by]
    );
    return rows[0];
  },
  async findByIdAndUpdate(id, data) {
    const fields = []; const vals = []; let i = 1;
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) { fields.push(`${k} = $${i++}`); vals.push(v); }
    }
    fields.push(`updated_at = NOW()`);
    vals.push(id);
    const { rows } = await pool.query(`UPDATE lab_items SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    return rows[0] || null;
  },
  async findByIdAndDelete(id) {
    const { rows } = await pool.query('DELETE FROM lab_items WHERE id = $1 RETURNING *', [id]);
    return rows[0] || null;
  },
};

module.exports = LabItem;
