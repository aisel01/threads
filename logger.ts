import pino from 'pino';

const logger = pino({
    browser: { asObject: true },
    level: 'debug',
});

export { logger };
