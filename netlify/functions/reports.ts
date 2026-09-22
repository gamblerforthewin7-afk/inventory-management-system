import { Handler } from '@netlify/functions';
import { getDbConnection } from './db';

export const handler: Handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const conn = await getDbConnection();
  if (!conn) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'DB not connected' }) };
  }

  try {
    // Inventory Valuation by Category
    const [categoryValuation] = await conn.execute(`
      SELECT c.name AS category_name, COUNT(p.product_id) AS total_items, SUM(i.quantity_on_hand * p.cost_price) AS total_cost_value, SUM(i.quantity_on_hand * p.unit_price) AS total_retail_value
      FROM products p
      JOIN inventory i ON p.product_id = i.product_id
      JOIN categories c ON p.category_id = c.category_id
      GROUP BY c.category_id
    `);

    // Top Suppliers by PO Volume
    const [supplierVolume] = await conn.execute(`
      SELECT s.company_name, COUNT(po.po_id) AS total_orders, SUM(po.total_amount) AS total_spend
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.supplier_id
      GROUP BY s.supplier_id
      ORDER BY total_spend DESC
    `);

    // Key System Metrics
    const [metrics]: any = await conn.execute(`
      SELECT 
        (SELECT SUM(i.quantity_on_hand * p.unit_price) FROM inventory i JOIN products p ON i.product_id = p.product_id) AS total_inventory_value,
        (SELECT COUNT(*) FROM products) AS total_products,
        (SELECT COUNT(*) FROM view_low_stock_alerts) AS low_stock_count,
        (SELECT COUNT(*) FROM purchase_orders WHERE status = 'pending') AS pending_po_count
    `);

    await conn.end();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        metrics: metrics[0],
        categoryValuation,
        supplierVolume
      })
    };
  } catch (err: any) {
    if (conn) await conn.end();
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
