import { execSync } from 'child_process';

try {
  console.log('Pushing database schema to Postgres...');
  execSync('pnpm db:push', { 
    stdio: 'inherit',
    cwd: '/vercel/share/v0-project',
    env: {
      ...process.env,
      POSTGRES_URL: process.env.POSTGRES_URL,
    }
  });
  console.log('Database schema pushed successfully!');
} catch (error) {
  console.error('Failed to push database schema:', error.message);
  process.exit(1);
}
