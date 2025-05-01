import express from 'express';
import { loggerLevel, LogLevel } from './utils/logger';
import { enableLoggedResponses, initRequestLogger } from './middleware/logs';

import { studentRouter } from './router/student-router';
import { errorHandler } from "./infra/error/error-handler";


const PORT = 8800;
const app = express();

loggerLevel(LogLevel.INFO);

app.use(initRequestLogger);
app.use(enableLoggedResponses);
app.use('/students', studentRouter);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
