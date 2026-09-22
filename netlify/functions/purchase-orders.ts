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
      const [orders]: any = await conn.execute(`
        SELECT po.*, s.company_name AS supplier_name, u.full_name AS created_by_name
        FROM purchase_orders po
        JOIN suppliers s ON po.supplier_id = s.supplier_id
        JOIN users u ON po.created_by_user_id = u.user_id
        ORDER BY po.po_id DESC
      `);

      for (const po of orders) {
        const [details] = await conn.execute(`
          SELECT od.*, p.sku, p.name AS product_name
          FROM order_details od
          JOIN products p ON od.product_id = p.product_id
          WHERE od.po_id = ?
        `, [po.po_id]);
        po.details = details;
      }

      await conn.end();
      return { statusCode: 200, headers, body: JSON.stringify(orders) };
    }

    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      const { po_number, supplier_id, created_by_user_id, order_date, expected_delivery_date, total_amount, notes, items } = data;

      const [res]: any = await conn.execute(
        `INSERT INTO purchase_orders (po_number, supplier_id, created_by_user_id, status, order_date, expected_delivery_date, total_amount, notes)
         VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)`,
        [po_number, supplier_id, created_by_user_id || 1, order_date, expected_delivery_date, total_amount, notes || '']
      );

      const poId = res.insertId;

      if (items && Array.isArray(items)) {
        for (const item of items) {
          await conn.execute(
            `INSERT INTO order_details (po_id, product_id, quantity_ordered, unit_cost)
             VALUES (?, ?, ?, ?)`,
            [poId, item.product_id, item.quantity_ordered, item.unit_cost]
          );
        }
      }

      await conn.end();
      return { statusCode: 201, headers, body: JSON.stringify({ message: 'Purchase Order created', poId }) };
    }

    if (event.httpMethod === 'PUT') { // Status update / PO receipt
      const data = JSON.parse(event.body || '{}');
      const { po_id, status, user_id } = data;

      if (status === 'received') {
        // Fetch PO line items
        const [items]: any = await conn.execute('SELECT product_id, quantity_ordered FROM order_details WHERE po_id = ?', [po_id]);
        
        for (const item of items) {
          // Increase stock for each product
          const [invRows]: any = await conn.execute('SELECT quantity_on_hand FROM inventory WHERE product_id = ?', [item.product_id]);
          const currentQty = invRows.length > 0 ? invRows[0].quantity_on_hand : 0;
          const newQty = currentQty + item.quantity_ordered;

          await conn.execute('UPDATE inventory SET quantity_on_hand = ? WHERE product_id = ?', [newQty, item.product_id]);

          // Audit log
          await conn.execute(
            `INSERT INTO stock_logs (product_id, user_id, type, quantity_changed, new_quantity, reason, reference_no)
             VALUES (?, ?, 'po_receipt', ?, ?, ?, ?)`,
            [item.product_id, user_id || 1, item.quantity_ordered, newQty, `PO Received (PO #${po_id})`, `PO-${po_id}`]
          );
        }

        await conn.execute('UPDATE purchase_orders SET status = ?, received_date = NOW() WHERE po_id = ?', ['received', po_id]);
      } else {
        await conn.execute('UPDATE purchase_orders SET status = ? WHERE po_id = ?', [status, po_id]);
      }

      await conn.end();
      return { statusCode: 200, headers, body: JSON.stringify({ message: `PO status updated to ${status}` }) };
    }

    await conn.end();
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err: any) {
    if (conn) await conn.end();
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
