export {HttpError, HttpErrorHandler, RawSQLiteError, SQLiteError};

interface RawSQLiteError extends Error {
    errno: number;
    code: string;
}

class SQLiteError extends Error implements RawSQLiteError {
    errno: number;
    code: string;

    constructor(rawError: RawSQLiteError) {
        super(rawError.message);
        this.errno = rawError.errno;
        this.code = rawError.code;
        this.name = 'SQLiteError';
    }

    static isRawSQLiteError(error: Error): error is RawSQLiteError {
        return 'errno' in error && 'code' in error;
    }
}

class HttpError extends Error {
    readonly statusCode: number;
    readonly message: string;
    readonly cause?: Error;

    constructor(statusCode?: number, message?: string, cause?: Error) {
        super(message);
        this.name = 'HttpError';
        this.statusCode = statusCode || 500;
        this.message = message || "An unexpected error occurred";
        this.cause = cause;

        if (statusCode && statusCode < 400)
            return new HttpError(500,
                `Cannot create an HttpError with a non-error status (Status: ${statusCode}).`
                + ` Cause: ` + this.message, this);
    }

    static fromSQLiteError(error: SQLiteError | RawSQLiteError): HttpError {
        const sqliteError = error instanceof SQLiteError ? error : new SQLiteError(error);

        switch (sqliteError.code) {
            // Constraint violations (conflicts with existing data)
            case 'SQLITE_CONSTRAINT':
            case 'SQLITE_CONSTRAINT_UNIQUE':
            case 'SQLITE_CONSTRAINT_PRIMARYKEY':
                return new HttpError(409, 'Resource conflict: ' + sqliteError.message, sqliteError);

            // Foreign key constraints
            case 'SQLITE_CONSTRAINT_FOREIGNKEY':
                return new HttpError(409, 'Foreign key constraint violation: ' + sqliteError.message, sqliteError);

            // Check constraints
            case 'SQLITE_CONSTRAINT_CHECK':
                return new HttpError(400, 'Check constraint failed: ' + sqliteError.message, sqliteError);

            // Not null constraints
            case 'SQLITE_CONSTRAINT_NOTNULL':
                return new HttpError(400, 'Required field missing: ' + sqliteError.message, sqliteError);

            // Syntax/query errors
            case 'SQLITE_ERROR':
                return new HttpError(500, 'Database query error: ' + sqliteError.message, sqliteError);

            // Authorization errors
            case 'SQLITE_AUTH':
            case 'SQLITE_PERM':
                return new HttpError(403, 'Database permission denied: ' + sqliteError.message, sqliteError);

            // Resource not found
            case 'SQLITE_NOTFOUND':
                return new HttpError(404, 'Resource not found: ' + sqliteError.message, sqliteError);

            // Database is busy or locked
            case 'SQLITE_BUSY':
            case 'SQLITE_LOCKED':
                return new HttpError(503, 'Database is currently unavailable: ' + sqliteError.message, sqliteError);

            // Database corruption or IO errors
            case 'SQLITE_CORRUPT':
            case 'SQLITE_IOERR':
            case 'SQLITE_NOTADB':
                return new HttpError(500, 'Database integrity error: ' + sqliteError.message, sqliteError);

            // Out of memory or quota
            case 'SQLITE_NOMEM':
            case 'SQLITE_FULL':
            case 'SQLITE_TOOBIG':
                return new HttpError(507, 'Database resource limit exceeded: ' + sqliteError.message, sqliteError);

            // Read-only database
            case 'SQLITE_READONLY':
                return new HttpError(403, 'Database is read-only: ' + sqliteError.message, sqliteError);

            // Operation aborted or interrupted
            case 'SQLITE_ABORT':
            case 'SQLITE_INTERRUPT':
                return new HttpError(500, 'Database operation aborted: ' + sqliteError.message, sqliteError);

            // Misconfiguration
            case 'SQLITE_MISUSE':
            case 'SQLITE_MISMATCH':
                return new HttpError(500, 'Database API misuse: ' + sqliteError.message, sqliteError);
            case 'SQLITE_CANTOPEN':
                return new HttpError(500, 'Cannot open database: ' + sqliteError.message, sqliteError);

            default:
                return new HttpError(500, 'Unknown SQLite Error: ' + sqliteError.message, sqliteError);
        }
    }

    toString() {
        return `HttpError ${this.statusCode}: ${this.message}
		Cause: ${this.cause}`;
    }
}

class HttpErrorHandler {
    readonly status: number;
    readonly error: string;
    readonly message: string;
    readonly causeName?: string;

    constructor(httpError: HttpError) {
        this.status = httpError.statusCode;
        this.error = HttpErrorHandler.httpStatusNameMap[httpError.statusCode] || "Unknown";
        this.message = httpError.message;
        this.causeName = httpError.cause?.name;
    }

    static readonly httpStatusNameMap: { [key: number]: string | undefined } = {
        100: "Continue",
        101: "Switching Protocols",
        102: "Processing",
        103: "Early Hints",
        200: "OK",
        201: "Created",
        202: "Accepted",
        203: "Non-Authoritative Information",
        204: "No Content",
        205: "Reset Content",
        206: "Partial Content",
        207: "Multi-Status",
        208: "Already Reported",
        226: "IM Used",
        300: "Multiple Choices",
        301: "Moved Permanently",
        302: "Found",
        303: "See Other",
        304: "Not Modified",
        305: "Use Proxy",
        307: "Temporary Redirect",
        308: "Permanent Redirect",
        400: "Bad Request",
        401: "Unauthorized",
        402: "Payment Required",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        406: "Not Acceptable",
        407: "Proxy Authentication Required",
        408: "Request Timeout",
        409: "Conflict",
        410: "Gone",
        411: "Length Required",
        412: "Precondition Failed",
        413: "Payload Too Large",
        414: "URI Too Long",
        415: "Unsupported Media Type",
        416: "Range Not Satisfiable",
        417: "Expectation Failed",
        418: "I'm a Teapot",
        421: "Misdirected Request",
        422: "Unprocessable Entity",
        423: "Locked",
        424: "Failed Dependency",
        425: "Too Early",
        426: "Upgrade Required",
        428: "Precondition Required",
        429: "Too Many Requests",
        431: "Request Header Fields Too Large",
        451: "Unavailable For Legal Reasons",
        500: "Internal Server Error",
        501: "Not Implemented",
        502: "Bad Gateway",
        503: "Service Unavailable",
        504: "Gateway Timeout",
        505: "HTTP Version Not Supported",
        506: "Variant Also Negotiates",
        507: "Insufficient Storage",
        508: "Loop Detected",
        510: "Not Extended",
        511: "Network Authentication Required"
    };
}