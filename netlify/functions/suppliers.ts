import { Handler } from '@netlify/functions';
import { getDbConnection } from './db';

export const handler: Handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const conn = await getDbConnection();
  if (!conn) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'DB not connected' }) };
  }

  try {
    if (event.httpMethod === 'GET') {
      const [suppliers] = await conn.execute(`
        SELECT s.*, COUNT(p.product_id) AS product_count
        FROM suppliers s
        LEFT JOIN products p ON s.supplier_id = p.supplier_id
        GROUP BY s.supplier_id
        ORDER BY s.supplier_id DESC
      `);
      await conn.end();
      return { statusCode: 200, headers, body: JSON.stringify(suppliers) };
    }

    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      const [res]: any = await conn.execute(
        `INSERT INTO suppliers (code, company_name, contact_person, email, phone, address, lead_time_days, rating)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.code, data.company_name, data.contact_person, data.email, data.phone, data.address, data.lead_time_days || 7, data.rating || 5.0]
      );
      await conn.end();
      return { statusCode: 201, headers, body: JSON.stringify({ message: 'Supplier created', supplierId: res.insertId }) };
    }

    await conn.end();
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err: any) {
    if (conn) await conn.end();
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
