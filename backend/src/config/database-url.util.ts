export function getDatabaseUrlFromEnv(env: NodeJS.ProcessEnv = process.env): string {
  const host = env.DB_HOST;
  const port = env.DB_PORT ?? '3306';
  const name = env.DB_NAME;
  const user = env.DB_USER;
  const password = env.DB_PASSWORD;

  if (host && name && user && password !== undefined) {
    const encodedUser = encodeURIComponent(user);
    const encodedPassword = encodeURIComponent(password);
    return `mysql://${encodedUser}:${encodedPassword}@${host}:${port}/${name}`;
  }

  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  throw new Error(
    'Missing database configuration. Set DATABASE_URL or DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD.',
  );
}
