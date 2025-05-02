import fs from "fs";

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

let lines = 0;

let max = Number.MIN_VALUE;
let maxName = "";
let min = Number.MAX_VALUE;
let minName = "";

files.forEach(file => {
	const text = fs.readFileSync(file, "utf8");
	const count = (text.match(/\n/g) ?? [])?.length + 1;

	lines += count;

	if (count > max) {
		max = count;
		maxName = file;
	} else if (count < min) {
		min = count;
		minName = file;
	}
});

console.log("Total lines in project:", lines);
console.log("Average lines per file:", lines / files.length);
console.log("Maximum lines on a file:", max, maxName);
console.log("Minimum lines on a file:", min, minName);
