/* eslint-disable import/prefer-default-export */
import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { applicationAccounts } from './credentials';

export const quickActions = sqliteTable('quick_actions', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  fields: text('fields', { mode: 'json' }).default('[]').$type<
    {
      type: string;
      humanReadableName: string;
      value: string;
    }[]
  >(),
  applicationAccountId: integer('application_account_id')
    .references(() => applicationAccounts.id, { onDelete: 'cascade' })
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const applicationAccountsRelation = relations(
  quickActions,
  ({ one }) => ({
    applicationAccount: one(applicationAccounts, {
      fields: [quickActions.applicationAccountId],
      references: [applicationAccounts.id],
    }),
  })
);
