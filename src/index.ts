import express from 'express';

import { studentRouter } from './router/student-router';
import { errorHandler } from "./infra/error/error-handler";


const PORT = 8800;
const app = express();

app.use(express.json());

app.use('/students', studentRouter);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
