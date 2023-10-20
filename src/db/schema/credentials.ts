/* eslint-disable import/prefer-default-export */
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { relations, sql } from 'drizzle-orm';

export const applications = sqliteTable(
  'applications',
  {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    shortCode: text('short_code').notNull(),
    clientId: text('client_id').notNull(),
    clientSecret: text('client_id'),
  },
  (table) => ({
    shortCodeIdx: index('short_code_idx').on(table.shortCode),
    nameClientIdIdx: uniqueIndex('name_client_id_idx').on(
      table.name,
      table.clientId
    ),
  })
);

export const applicationAccounts = sqliteTable('application_accounts', {
  id: integer('id').primaryKey(),
  token: text('token').notNull(),
  tokenSecret: text('token_secret'),
  extra: text('extra', { mode: 'json' })
    .default('{}')
    .$type<{ url?: string; email?: string }>(), // Typed here inline to avoid circular dependency
  status: text('status', {
    enum: ['NEW', 'FAILED', 'SYNCING', 'READY'],
  }).default('NEW'),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(
    sql`(strftime('%s', 'now'))`
  ),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
  applicationId: integer('application_id')
    .references(() => applications.id)
    .notNull(),
});

export const applicationsRelations = relations(applications, ({ many }) => ({
  applicationAccounts: many(applicationAccounts),
}));

export const applicationAccountsRelations = relations(
  applicationAccounts,
  ({ one }) => ({
    application: one(applications, {
      fields: [applicationAccounts.applicationId],
      references: [applications.id],
    }),
  })
);
