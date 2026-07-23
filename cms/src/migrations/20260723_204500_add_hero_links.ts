import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`home\` ADD \`hero_left_link\` text;`)
  await db.run(sql`ALTER TABLE \`home\` ADD \`hero_right_link\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Down migration logic if needed
}
