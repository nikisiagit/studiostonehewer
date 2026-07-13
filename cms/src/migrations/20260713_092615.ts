import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`home_guides\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_guides_order_idx\` ON \`home_guides\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_guides_parent_id_idx\` ON \`home_guides\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`home\` DROP COLUMN \`guides\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`home_guides\`;`)
  await db.run(sql`ALTER TABLE \`home\` ADD \`guides\` text;`)
}
