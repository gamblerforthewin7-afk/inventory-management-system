import { Handler } from '@netlify/functions';
import { getDbConnection } from './db';

export const handler: Handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const conn = await getDbConnection();
  if (!conn) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: 'Database credentials not configured or database unreachable.',
        mode: 'DEMO_FALLBACK_RECOMMENDED'
      }),
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      const [rows] = await conn.execute(`
        SELECT p.*, c.name AS category_name, s.company_name AS supplier_name, i.quantity_on_hand
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
        LEFT JOIN inventory i ON p.product_id = i.product_id
        ORDER BY p.product_id DESC
      `);
      await conn.end();
      return { statusCode: 200, headers, body: JSON.stringify(rows) };
    }

    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      const [result]: any = await conn.execute(
        `INSERT INTO products (sku, name, description, category_id, supplier_id, cost_price, unit_price, min_stock_level, reorder_quantity, unit_of_measure, location_bin)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.sku, data.name, data.description || '', data.category_id, data.supplier_id, data.cost_price, data.unit_price, data.min_stock_level || 10, data.reorder_quantity || 50, data.unit_of_measure || 'Units', data.location_bin || 'A-01']
      );

      // Initialize inventory row
      await conn.execute(
        `INSERT INTO inventory (product_id, quantity_on_hand) VALUES (?, ?)`,
        [result.insertId, data.initial_stock || 0]
      );

      await conn.end();
      return { statusCode: 201, headers, body: JSON.stringify({ message: 'Product created', productId: result.insertId }) };
    }

    await conn.end();
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err: any) {
    if (conn) await conn.end();
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
