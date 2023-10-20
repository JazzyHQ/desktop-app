/* eslint-disable import/prefer-default-export */
import { relations } from 'drizzle-orm';
import {
  ForeignKeyBuilder,
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core';
import { applicationAccounts, applications } from './credentials';

export const dataNodes = sqliteTable(
  'data_node',
  {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    nodeType: text('node_type').notNull(),
    cloudId: text('cloud_id').notNull(),
    metadata: text('metadata', { mode: 'json' }),
    applicationId: integer('application_id')
      .references(() => applications.id, { onDelete: 'cascade' })
      .notNull(),
    applicationAccountId: integer('application_account_id')
      .references(() => applicationAccounts.id, { onDelete: 'cascade' })
      .notNull(),
    parentDataNodeId: integer('parent_data_node_id'),
  },
  (table) => {
    return {
      cloudIdApplicationIdUnq: unique().on(
        table.applicationAccountId,
        table.nodeType,
        table.cloudId
      ),
      nodeTypeIdx: index('node_type_idx').on(table.nodeType),
      parentReference: new ForeignKeyBuilder(
        () => ({
          columns: [table.parentDataNodeId],
          foreignColumns: [table.id],
        }),
        { onDelete: 'cascade' }
      ),
    };
  }
);

export const applicationAccountsRelation = relations(dataNodes, ({ one }) => ({
  applicationAccount: one(applicationAccounts, {
    fields: [dataNodes.applicationAccountId],
    references: [applicationAccounts.id],
  }),
}));

export const applicationRelation = relations(dataNodes, ({ one }) => ({
  application: one(applications, {
    fields: [dataNodes.applicationId],
    references: [applications.id],
  }),
}));
