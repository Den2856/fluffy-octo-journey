import { connectDB } from './config/db';
import { env } from './config/env';
import { createServer } from './app';

(async () => {
  await connectDB();
  const app = createServer();
  app.listen(env.PORT, () => console.log(`API: http://localhost:${env.PORT}`));
})();
