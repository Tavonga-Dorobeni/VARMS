import * as path from 'node:path';

export function getDatabaseUrlFromEnv(env: NodeJS.ProcessEnv = process.env): string {
  if (env.SQLITE_DATABASE_URL) {
    return normalizeSqliteUrl(env.SQLITE_DATABASE_URL);
  }

  if (env.SQLITE_DB_PATH?.trim()) {
    return normalizeSqliteUrl(env.SQLITE_DB_PATH);
  }

  if (env.DATABASE_URL?.startsWith('file:')) {
    return normalizeSqliteUrl(env.DATABASE_URL);
  }

  return normalizeSqliteUrl('./prisma/varms.db');
}

export function getMysqlDatabaseUrlFromEnv(env: NodeJS.ProcessEnv = process.env): string {
  if (env.MYSQL_SOURCE_DATABASE_URL) {
    return env.MYSQL_SOURCE_DATABASE_URL;
  }

  if (env.DATABASE_URL?.startsWith('mysql://')) {
    return env.DATABASE_URL;
  }

  const host = env.MYSQL_HOST ?? env.DB_HOST;
  const port = env.MYSQL_PORT ?? env.DB_PORT ?? '3306';
  const name = env.MYSQL_DB_NAME ?? env.DB_NAME;
  const user = env.MYSQL_USER ?? env.DB_USER;
  const password = env.MYSQL_PASSWORD ?? env.DB_PASSWORD;

  if (host && name && user && password !== undefined) {
    const encodedUser = encodeURIComponent(user);
    const encodedPassword = encodeURIComponent(password);
    return `mysql://${encodedUser}:${encodedPassword}@${host}:${port}/${name}`;
  }

  throw new Error(
    'Missing MySQL source configuration. Set MYSQL_HOST, MYSQL_PORT, MYSQL_DB_NAME, MYSQL_USER, and MYSQL_PASSWORD, or keep DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD available for the source database.',
  );
}

function normalizeSqliteUrl(value: string): string {
  const rawPath = value.startsWith('file:') ? value.slice(5) : value;
  const resolvedPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(rawPath);
  return `file:${resolvedPath.replace(/\\/g, '/')}`;
}
