import { Handler } from '@netlify/functions';
import { getDbConnection } from './db';

export const handler: Handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const conn = await getDbConnection();
  if (!conn) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'DB not connected' }) };
  }

  try {
    const { email, password } = JSON.parse(event.body || '{}');

    const [rows]: any = await conn.execute(
      'SELECT user_id, username, email, full_name, role, department, status FROM users WHERE email = ?',
      [email]
    );

    await conn.end();

    if (!rows || rows.length === 0) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid email or password' }) };
    }

    const user = rows[0];
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token: `mock-jwt-token-${user.user_id}-${Date.now()}`,
        user: {
          id: user.user_id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          department: user.department
        }
      })
    };
  } catch (err: any) {
    if (conn) await conn.end();
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
