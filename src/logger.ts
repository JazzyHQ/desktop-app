/* eslint-disable import/prefer-default-export */
import winston from 'winston';

export class Logger {
  // eslint-disable-next-line no-use-before-define
  private static instance: Logger;

  private logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.simple()
      ),
    });
  }

  public static get Instance() {
    if (!this.instance) {
      this.instance = new this();
    }
    return this.instance.logger;
  }
}
