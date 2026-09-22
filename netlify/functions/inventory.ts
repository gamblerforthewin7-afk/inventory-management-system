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
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ error: 'Database not connected. Using Demo mode.' }),
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      const path = event.path;
      if (path.endsWith('/alerts')) {
        const [alerts] = await conn.execute('SELECT * FROM view_low_stock_alerts');
        await conn.end();
        return { statusCode: 200, headers, body: JSON.stringify(alerts) };
      }
      
      if (path.endsWith('/logs')) {
        const [logs] = await conn.execute(`
          SELECT l.*, p.sku, p.name AS product_name, u.full_name AS user_name
          FROM stock_logs l
          JOIN products p ON l.product_id = p.product_id
          JOIN users u ON l.user_id = u.user_id
          ORDER BY l.created_at DESC LIMIT 50
        `);
        await conn.end();
        return { statusCode: 200, headers, body: JSON.stringify(logs) };
      }

      const [rows] = await conn.execute(`
        SELECT i.*, p.sku, p.name AS product_name, p.min_stock_level, p.reorder_quantity, c.name AS category_name
        FROM inventory i
        JOIN products p ON i.product_id = p.product_id
        LEFT JOIN categories c ON p.category_id = c.category_id
      `);
      await conn.end();
      return { statusCode: 200, headers, body: JSON.stringify(rows) };
    }

    if (event.httpMethod === 'POST') { // Stock Adjustment
      const data = JSON.parse(event.body || '{}');
      const { product_id, user_id, type, quantity_changed, reason, reference_no } = data;

      // Fetch current quantity
      const [invRows]: any = await conn.execute('SELECT quantity_on_hand FROM inventory WHERE product_id = ?', [product_id]);
      if (!invRows || invRows.length === 0) {
        await conn.end();
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Inventory record not found' }) };
      }

      const currentQty = invRows[0].quantity_on_hand;
      const newQty = type === 'stock_out' ? currentQty - Math.abs(quantity_changed) : currentQty + Math.abs(quantity_changed);

      if (newQty < 0) {
        await conn.end();
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Stock cannot drop below 0' }) };
      }

      // Update Inventory
      await conn.execute('UPDATE inventory SET quantity_on_hand = ?, last_stock_take = NOW() WHERE product_id = ?', [newQty, product_id]);

      // Insert Audit Log
      await conn.execute(
        `INSERT INTO stock_logs (product_id, user_id, type, quantity_changed, new_quantity, reason, reference_no)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [product_id, user_id || 1, type, quantity_changed, newQty, reason || 'Stock adjustment', reference_no || 'MANUAL-ADJ']
      );

      await conn.end();
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Stock updated', newQuantity: newQty }) };
    }

    await conn.end();
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err: any) {
    if (conn) await conn.end();
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
