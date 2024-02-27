// src/app.js

import express from 'express';
import reviewsRouter from './routes/reviews.router.js';


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// comments 라우터는 reviews 라우터에서 처리할 것!
app.use('/reviews', reviewsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
