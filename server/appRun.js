import dotenv from 'dotenv';
dotenv.config({ path: './dev.env'});

import { app } from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

