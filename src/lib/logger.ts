// I present... a logger similar to Rust's tracing crate for TypeScript!
//
// I'm really annoyed at winston and pino and their complex APIs and lack of
// them not actually doing what I want them to do (customizability, spans,
// easy configuration). This is a simple logger I made that I can copy-paste
// into projects and use immediately. Maybe I'll publish it as an NPM package?
//
// It supports spans, structured logging, and log levels, and maybe more in the
// future.
// - gilbert

import chalk, { ChalkInstance } from "chalk";

const inspect = import.meta.env.SSR
  ? (await import("node:util")).inspect
  : // The browser should never reach this point, but just in case...
    (obj: unknown, ..._: unknown[]) => JSON.stringify(obj);

export const LOG_LEVELS = ["error", "warn", "info", "debug", "trace"];
const LOG_LEVEL_VALUES: Record<string, number> = {
  error: 0,
  warn: 10,
  info: 20,
  debug: 30,
  trace: 40,
};
export type LogLevel = (typeof LOG_LEVELS)[number];

/**
 * Compares two log levels. Returns a negative number if `a` is lower (less
 * verbose) than `b`, a positive number if `a` is higher (more verbose) than `b`,
 * and zero if they are equal.
 */
const compareLogLevels = (a: LogLevel, b: LogLevel): number => {
  return LOG_LEVEL_VALUES[a] - LOG_LEVEL_VALUES[b];
};

/**
 * Spans represent blocks of code that can be entered and exited, allowing for
 * structured logging within a specific context.
 *
 * TODO: Add support for location/callsite info (file, line number,
 * and function name)?
 */
export interface Span {
  name: string;
  level: LogLevel;
  parent: Span | null;
  fields: Record<string, unknown>;
}

export interface LogEntry {
  level: LogLevel;
  message?: string;
  fields: unknown[];
  span: Span | null;
  timestamp: Date;
}

export interface LoggerTransport {
  /**
   * Log a single entry. It is up to the transport to format and output the log
   * entry as desired. Note that this method may not immediately write out the
   * log entry; it may cache logs for performance reasons and should implement
   * the `flush` method to ensure all logs are written out.
   * @param entry
   */
  log(entry: LogEntry): void;
  /**
   * The `log` method may cache logs for performance reasons. Calling `flush`
   * ensures that all cached logs are written out.
   */
  flush(): Promise<void>;
}

export interface LoggerConfig {
  transports: LoggerTransport[];
  currentSpan?: Span | null;
}

class Logger {
  private transports: LoggerTransport[];
  /**
   * Whether the current instance is within a span. If it is not within a span,
   * it is considered the "default" logger.
   */
  private currentSpan: Span | null = null;

  constructor(config: LoggerConfig) {
    this.transports = config.transports;
    this.currentSpan = config.currentSpan || null;
  }

  /**
   * Creates a logger span with the given name, level, and fields.
   */
  public span(
    name: string,
    level: LogLevel = "trace",
    fields: Record<string, unknown> = {},
  ) {
    return new Logger({
      transports: this.transports,
      currentSpan: {
        name,
        level: level,
        parent: this.currentSpan,
        fields,
      },
    });
  }

  private logInner(level: LogLevel, ...args: unknown[]) {
    const message =
      args.length > 0 && typeof args[0] === "string" ? args[0] : undefined;
    const fields =
      args.length > 0 && typeof args[0] === "string" ? args.slice(1) : args;
    const entry: LogEntry = {
      level,
      message,
      fields,
      span: this.currentSpan,
      timestamp: new Date(),
    };

    for (const transport of this.transports) {
      transport.log(entry);
    }
  }

  public error(message: string): void;
  public error(...fields: unknown[]): void;
  public error(...args: unknown[]): void {
    this.logInner("error", ...args);
  }

  public warn(message: string): void;
  public warn(...fields: unknown[]): void;
  public warn(...args: unknown[]): void {
    this.logInner("warn", ...args);
  }

  public info(message: string): void;
  public info(...fields: unknown[]): void;
  public info(...args: unknown[]): void {
    this.logInner("info", ...args);
  }

  public debug(message: string): void;
  public debug(...fields: unknown[]): void;
  public debug(...args: unknown[]): void {
    this.logInner("debug", ...args);
  }

  public trace(message: string): void;
  public trace(...fields: unknown[]): void;
  public trace(...args: unknown[]): void {
    this.logInner("trace", ...args);
  }
}

const LEVEL_COLOR: Record<LogLevel, ChalkInstance> = {
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.green,
  debug: chalk.cyan,
  trace: chalk.magenta,
};

const formatFields = (fields: unknown[], compact: boolean = false): string => {
  let out = "";

  for (const field of fields) {
    // Check if field is an Error
    if (field instanceof Error) {
      const formattedError = inspect(field, { colors: true }).split("\n");
      formattedError[0] = chalk.red(formattedError[0]);

      out += `\n ${chalk.bgRed(chalk.black("error"))}${chalk.red("=")}${formattedError.join("\n")}`;
    }
    // Check if field is an object with keys
    else if (
      typeof field === "object" &&
      field !== null &&
      !Array.isArray(field)
    ) {
      out += "\n";
      for (const [key, value] of Object.entries(field)) {
        out += ` ${chalk.bgWhite(
          chalk.black(key),
        )}=${inspect(value, { colors: true, depth: 3, compact })}`;
      }
    } else {
      out += ` ${inspect(field, { colors: true, depth: 3, compact })}`;
    }
  }

  return out;
};

const formatSpan = (span: Span | null): string => {
  if (!span) return "";

  let out = "";
  const spanParts: string[] = [];
  let currentSpan: Span | null = span;

  while (currentSpan) {
    spanParts.push(
      `${chalk.dim(currentSpan.name)}${
        Object.keys(currentSpan.fields).length > 0
          ? `{${formatFields([currentSpan.fields], true)}}`
          : ""
      }`,
    );
    currentSpan = currentSpan.parent;
  }

  out += spanParts.reverse().join(" > ");

  return out;
};

const LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel | undefined) || "trace";
if (!LOG_LEVELS.includes(LOG_LEVEL)) {
  throw new Error(`Invalid LOG_LEVEL: ${LOG_LEVEL}`);
}

const TERMINAL_TRANSPORT: LoggerTransport = {
  log(entry: LogEntry) {
    if (compareLogLevels(entry.level, LOG_LEVEL) > 0) {
      return;
    }

    const timestamp = chalk.dim(entry.timestamp.toISOString());
    const level = LEVEL_COLOR[entry.level](entry.level.toUpperCase());
    console.log(
      `${timestamp} ${level} ${formatSpan(entry.span)} ${entry.message ?? ""}${
        entry.fields.length > 0 ? formatFields(entry.fields) : ""
      }`,
    );
  },
  async flush() {
    // No-op for terminal transport
  },
};

const BROWSER_COLORS: Record<LogLevel, string> = {
  error: "oklch(57.7% 0.245 27.325)",
  warn: "oklch(85.2% 0.199 91.936)",
  info: "oklch(62.7% 0.194 149.214)",
  debug: "oklch(54.6% 0.245 262.881)",
  trace: "oklch(49.1% 0.27 292.581)",
};

const BROWSER_TRANSPORT: LoggerTransport = {
  log(entry: LogEntry) {
    if (compareLogLevels(entry.level, LOG_LEVEL) > 0) {
      return;
    }

    const timestamp = `%c${entry.timestamp.toISOString()}`;
    const level = `%c${entry.level.toUpperCase()}`;
    const levelStyle = `color: ${BROWSER_COLORS[entry.level]}; font-weight: bold;`;
    const RESET = "color: inherit; font-weight: normal;";
    const timestampStyle = "color: gray;";
    const span = formatSpan(entry.span);
    const message = entry.message ?? "";

    console.log(
      `${timestamp} ${level} %c${span ? " " + span + " " : ""}${message ? message + "" : ""}%o`,
      timestampStyle,
      levelStyle,
      RESET,
      ...entry.fields,
    );
  },
  async flush() {
    // No-op for browser transport
  },
};

/**
 * The default logger instance.
 */
export const logger = new Logger({
  transports: [
    typeof window === "undefined" ? TERMINAL_TRANSPORT : BROWSER_TRANSPORT,
  ],
});

export const spanned = (
  name: string,
  level: LogLevel = "trace",
  fields: Record<string, unknown> = {},
) => {
  return logger.span(name, level, fields);
};
