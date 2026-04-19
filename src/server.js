const createApp = require('./app');
const { initializeDatabase } = require('./db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized');

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Memorial website running on http://localhost:${PORT}`);
      console.log(`Press Ctrl+C to stop the server`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
