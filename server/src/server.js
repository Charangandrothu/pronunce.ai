import app from './app.js';
import { PORT } from './config/env.js';
import fs from 'fs';
import path from 'path';

// Ensure the uploads directories are present on boot
const uploadDir = path.resolve('src/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Bind to port
app.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`  Pronounce.AI Backend Calibration Server Operational  `);
  console.log(`  Active Port: ${PORT}                                 `);
  console.log(`  Timestamp:   ${new Date().toLocaleString()}          `);
  console.log(`======================================================`);
});
