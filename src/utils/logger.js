import chalk from 'chalk';

const isDev = process.env.NODE_ENV !== 'production';

const formatTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').slice(0, 19);
};

const formatData = (data) => {
  if (data === null || data === undefined) return '';
  if (typeof data === 'string') return data;
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

const logger = {
  info: (module, message, data = null) => {
    const timestamp = formatTimestamp();
    const prefix = chalk.blue(`[${timestamp}]`);
    const moduleLabel = chalk.cyan(`[${module}]`);
    const msg = chalk.white(message);
    const dataStr = data ? chalk.gray(formatData(data)) : '';

    console.log(`${prefix} ${moduleLabel} ${msg}${dataStr ? '\n' + dataStr : ''}`);
  },

  error: (module, message, error = null) => {
    const timestamp = formatTimestamp();
    const prefix = chalk.red(`[${timestamp}]`);
    const moduleLabel = chalk.red(`[${module}]`);
    const msg = chalk.red(`❌ ${message}`);

    console.error(`${prefix} ${moduleLabel} ${msg}`);
    if (error) {
      const errorMsg = error instanceof Error ? error.message : formatData(error);
      console.error(chalk.redBright(errorMsg));
      if (isDev && error instanceof Error && error.stack) {
        console.error(chalk.gray(error.stack));
      }
    }
  },

  warn: (module, message, data = null) => {
    const timestamp = formatTimestamp();
    const prefix = chalk.yellow(`[${timestamp}]`);
    const moduleLabel = chalk.yellow(`[${module}]`);
    const msg = chalk.yellow(`⚠️ ${message}`);
    const dataStr = data ? chalk.gray(formatData(data)) : '';

    console.warn(`${prefix} ${moduleLabel} ${msg}${dataStr ? '\n' + dataStr : ''}`);
  },

  success: (module, message, data = null) => {
    const timestamp = formatTimestamp();
    const prefix = chalk.green(`[${timestamp}]`);
    const moduleLabel = chalk.green(`[${module}]`);
    const msg = chalk.green(`✅ ${message}`);
    const dataStr = data ? chalk.gray(formatData(data)) : '';

    console.log(`${prefix} ${moduleLabel} ${msg}${dataStr ? '\n' + dataStr : ''}`);
  },

  request: (method, path, statusCode, duration = null) => {
    const timestamp = formatTimestamp();
    const prefix = chalk.blue(`[${timestamp}]`);

    let methodColor;
    switch (method) {
      case 'GET':
        methodColor = chalk.blue(method);
        break;
      case 'POST':
        methodColor = chalk.green(method);
        break;
      case 'PUT':
        methodColor = chalk.yellow(method);
        break;
      case 'DELETE':
        methodColor = chalk.red(method);
        break;
      case 'PATCH':
        methodColor = chalk.magenta(method);
        break;
      default:
        methodColor = chalk.white(method);
    }

    let statusColor;
    if (statusCode >= 200 && statusCode < 300) {
      statusColor = chalk.green(statusCode);
    } else if (statusCode >= 300 && statusCode < 400) {
      statusColor = chalk.cyan(statusCode);
    } else if (statusCode >= 400 && statusCode < 500) {
      statusColor = chalk.yellow(statusCode);
    } else {
      statusColor = chalk.red(statusCode);
    }

    const durationStr = duration ? chalk.gray(` ${duration}ms`) : '';
    console.log(`${prefix} ${methodColor} ${path} ${statusColor}${durationStr}`);
  },
};

export default logger;
