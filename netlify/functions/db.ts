import mysql from 'mysql2/promise';

export const getDbConnection = async () => {
  const host = process.env.DB_HOST;
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !user || !database) {
    return null; // DB not configured, caller can fall back to mock response or error
  }

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
    return connection;
  } catch (error) {
    console.error('Failed to connect to MySQL database:', error);
    return null;
  }
};
