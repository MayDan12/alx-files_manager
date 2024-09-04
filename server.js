// This is the server.js or wherever your routes are configured
import express from 'express';
import router from './routes/index.js';

const app = express();

// The Middleware used to parse JSON bodies
app.use(express.json());

router(app);

// The port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
