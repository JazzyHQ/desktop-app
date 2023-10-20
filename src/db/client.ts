/* eslint-disable import/prefer-default-export */
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { app } from 'electron';
import path from 'path';
import * as credentialsSchema from './schema/credentials';
import * as graphSchema from './schema/graph';
import * as quickActionsSchema from './schema/quick-actions';

export class DBClient {
  // eslint-disable-next-line no-use-before-define
  private static instance: DBClient;

  private dbConnection;

  private migrationsDir: string;

  private constructor() {
    this.migrationsDir = app?.isPackaged
      ? path.join(process.resourcesPath, 'drizzle')
      : 'drizzle';

    // When we try to access the database from a utility process
    // (a fork from the main process), `electron` is not available,
    // so we need to pass the path to the database file as an environment
    // variable.
    const dataDir = app
      ? `${app.getPath('userData')}/sqlite.db`
      : process.env.DATABASE_DATA_FILE;
    const sqlite = new Database(dataDir || '');
    sqlite.pragma('journal_mode = WAL');
    this.dbConnection = drizzle(sqlite, {
      schema: { ...credentialsSchema, ...graphSchema, ...quickActionsSchema },
      logger: false,
    });
  }

  public static get Instance() {
    if (!this.instance) {
      this.instance = new this();
    }
    return this.instance;
  }

  public get connection() {
    return this.dbConnection;
  }

  migrate() {
    migrate(this.dbConnection, { migrationsFolder: this.migrationsDir });
  }

  async cloudAccounts() {
    return this.dbConnection.query.applicationAccounts.findMany({
      with: { application: true },
    });
  }
}
