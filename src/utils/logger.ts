import { type Request } from "express";

export { loggerLevel, LogLevel, log, fatal, error, warn, info, debug, trace };

enum LogLevel {
	OFF,
	FATAL,
	ERROR,
	WARN,
	INFO,
	DEBUG,
	TRACE
}

let LOGGER_LEVEL = LogLevel.TRACE;

function loggerLevel(level: LogLevel) {
	LOGGER_LEVEL = level;
}

function log(level: LogLevel, method: string, originalUrl: string, logger: (...data: any[])=>void, ...data: any[]) {
	if (LOGGER_LEVEL < level) return;
	logger(LogLevel[level], `- ${method} ${originalUrl} ->`, ...data);
}

function fatal(req: Request, ...data: any[]) {
	log(LogLevel.FATAL, req.method, req.originalUrl, console.error, ...data);
}

function error(req: Request, ...data: any[]) {
	log(LogLevel.ERROR, req.method, req.originalUrl, console.error, ...data);
}

function warn(req: Request, ...data: any[]) {
	log(LogLevel.WARN, req.method, req.originalUrl, console.warn, ...data);
}

function info(req: Request, ...data: any[]) {
	log(LogLevel.INFO, req.method, req.originalUrl, console.info, ...data);
}

function debug(req: Request, ...data: any[]) {
	log(LogLevel.DEBUG, req.method, req.originalUrl, console.debug, ...data);
}

function trace(req: Request, ...data: any[]) {
	log(LogLevel.TRACE, req.method, req.originalUrl, console.trace, ...data);
}
