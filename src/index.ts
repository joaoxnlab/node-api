import express from 'express';

import { loggerLevel, LogLevel } from './utils/logger';
import { jsonParser } from './middleware/jsonParser';
import { enableLoggedResponses, initRequestLogger } from './middleware/logs';
import { errorHandler, jsonParserHandler, listenUnhandledRejections } from './infra/error/error-handler';

import { studentRouter } from './router/student-router';


listenUnhandledRejections();

const app = express();
const PORT = 8800;

loggerLevel(LogLevel.INFO);

app.use(jsonParser);
app.use(jsonParserHandler);

app.use(initRequestLogger);
app.use(enableLoggedResponses);
app.use('/students', studentRouter);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
