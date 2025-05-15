import fs from "fs";
import { log, LogLevel } from "../utils/logger";
import * as path from "node:path";

const sourcePath = path.join(__dirname, '..');
const files = [
	"index.ts",
	"utils/files.ts",
	"utils/logger.ts",
	"service/generic-service.ts",
	"service/student-service.ts",
	"router/student-router.ts",
	"middleware/jsonParser.ts",
	"middleware/logs.ts",
	"infra/error/error-classes.ts",
	"infra/error/error-handler.ts",
	"datasource/entity/entities.ts",
	"controller/student-controller.ts"
];

type LineStatusData = {
	lines: {
		amount: number,
			max: {
			value: number | undefined,
				filePath: string | undefined
		},
		min: {
			value: number | undefined,
				filePath: string | undefined
		}
	},
	chars: {
		amount: 0,
			max: {
			value: number | undefined,
				filePath: string | undefined
		},
		min: {
			value: number | undefined,
				filePath: string | undefined
		},
		longestLine: {
			value: number | undefined,
				filePath: string | undefined
		},
		shortestLine: {
			value: number | undefined,
				filePath: string | undefined
		}
	}
};

function initializeData(): LineStatusData {
	return {
		lines: {
			amount: 0,
			max: {
				value: undefined as (number | undefined),
				filePath: undefined as (string | undefined)
			},
			min: {
				value: undefined as (number | undefined),
				filePath: undefined as (string | undefined)
			}
		},
		chars: {
			amount: 0,
			max: {
				value: undefined as (number | undefined),
				filePath: undefined as (string | undefined)
			},
			min: {
				value: undefined as (number | undefined),
				filePath: undefined as (string | undefined)
			},
			longestLine: {
				value: undefined as (number | undefined),
				filePath: undefined as (string | undefined)
			},
			shortestLine: {
				value: undefined as (number | undefined),
				filePath: undefined as (string | undefined)
			}
		}
	};
}

function perFileReader(file: string, data: LineStatusData) {
	const text = fs.readFileSync(file, "utf8");
	const allLines = text.split("\n");
	const filteredLines = allLines
		.map(l => l.trimEnd())
		.filter(l => l.trim().length > 0);

	const longestLine = filteredLines.reduce((prev, curr) => Math.max(prev, curr.length), Number.MIN_VALUE);
	const shortestLine = filteredLines.reduce((prev, curr) => Math.min(prev, curr.length), Number.MAX_VALUE);

	const chars = filteredLines.join("\n").length;
	data.chars.amount += chars;

	if (data.chars.longestLine.value === undefined || longestLine > data.chars.longestLine.value) {
		data.chars.longestLine.value = longestLine;
		data.chars.longestLine.filePath = file;
	} else if (data.chars.shortestLine.value === undefined || shortestLine < data.chars.shortestLine.value) {
		data.chars.shortestLine.value = shortestLine;
		data.chars.shortestLine.filePath = file;
	}

	if (data.chars.max.value === undefined || chars > data.chars.max.value) {
		data.chars.max.value = chars;
		data.chars.max.filePath = file;
	} else if (data.chars.min.value === undefined || chars < data.chars.min.value) {
		data.chars.min.value = chars;
		data.chars.min.filePath = file;
	}

	data.lines.amount += allLines.length;

	if (data.lines.max.value === undefined || allLines.length > data.lines.max.value) {
		data.lines.max.value = allLines.length;
		data.lines.max.filePath = file;
	} else if (data.lines.min.value === undefined || allLines.length < data.lines.min.value) {
		data.lines.min.value = allLines.length;
		data.lines.min.filePath = file;
	}
}


export function logLinesStatus() {
	const data = initializeData();

	files.forEach(file => {
		try {
			perFileReader(path.join(sourcePath, file), data);
		} catch (e) {
			console.warn(`Error while reading status of ${file}`);
			log(
				LogLevel.TRACE, "(none METHOD)", "(none URL)", console.trace,
				"Project file reading error:", e
			);
		}
	});

	console.log("Logging Project Lines STATUS");
	console.log("Files in project:", files.length);

	console.log("\nTotal lines in project:", data.lines.amount);

	console.log("\nAverage lines per file:", data.lines.amount / files.length);
	console.log("Maximum lines on a file:", data.lines.max.value, "- File Path:", data.lines.max.filePath);
	console.log("Minimum lines on a file:", data.lines.min.value, "- File Path:", data.lines.min.filePath);


	console.log("\n\nTotal characters in project:", data.chars.amount);
	console.log("\nAverage characters per file:", data.chars.amount / files.length);
	console.log("Maximum characters on a file:", data.chars.max.value, "- File Path:", data.chars.max.filePath);
	console.log("Minimum characters on a file:", data.chars.min.value, "- File Path:", data.chars.min.filePath);

	console.log("\nAverage characters per line:", data.chars.amount / data.lines.amount);
	console.log("Maximum characters on a line:", data.chars.longestLine.value, "- File Path:", data.chars.longestLine.filePath);
	console.log("Minimum characters on a line:", data.chars.shortestLine.value, "- File Path:", data.chars.shortestLine.filePath);
}
