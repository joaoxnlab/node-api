import { log, LogLevel } from '@logger';
import { logLinesStatus } from "./lines-counter";

export { ExecutionMode, setExecutionMode, projectStatus };

enum ExecutionMode {
	PRODUCTION,
	DEVELOPMENT,
	TEST,
	DEBUG
}

let EXECUTION_MODE = ExecutionMode.PRODUCTION;

function setExecutionMode(mode: ExecutionMode) {
	EXECUTION_MODE = mode;
}

function projectStatus() {
	if (EXECUTION_MODE < ExecutionMode.DEVELOPMENT) return;
	console.log(`Running NodeJS project on directory:`, process.cwd());
	log(
		LogLevel.TRACE, '(NONE method)', '(NONE url)', console.trace,
		"Project NodeJS process:", process
	);
	console.log();
	logLinesStatus();
	console.log("\nProject Status Logging COMPLETED\n\n");
}
