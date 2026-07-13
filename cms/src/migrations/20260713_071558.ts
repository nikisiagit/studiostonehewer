import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`projects\` ADD \`meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`projects_meta_meta_image_idx\` ON \`projects\` (\`meta_image_id\`);`)
  await db.run(sql`ALTER TABLE \`home\` ADD \`meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`home\` ADD \`meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`home\` ADD \`meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`home_meta_meta_image_idx\` ON \`home\` (\`meta_image_id\`);`)
  await db.run(sql`ALTER TABLE \`portfolio\` ADD \`meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`portfolio\` ADD \`meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`portfolio\` ADD \`meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`portfolio_meta_meta_image_idx\` ON \`portfolio\` (\`meta_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_projects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`tag\` text NOT NULL,
  	\`year\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`intro_text_1\` text,
  	\`intro_text_2\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_projects\`("id", "title", "tag", "year", "description", "intro_text_1", "intro_text_2", "updated_at", "created_at") SELECT "id", "title", "tag", "year", "description", "intro_text_1", "intro_text_2", "updated_at", "created_at" FROM \`projects\`;`)
  await db.run(sql`DROP TABLE \`projects\`;`)
  await db.run(sql`ALTER TABLE \`__new_projects\` RENAME TO \`projects\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`projects_updated_at_idx\` ON \`projects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_created_at_idx\` ON \`projects\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_home\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_left_image_id\` integer,
  	\`hero_left_caption\` text,
  	\`hero_right_image_id\` integer,
  	\`hero_right_caption\` text,
  	\`quote_text\` text,
  	\`quote_author\` text,
  	\`studio_subtitle\` text,
  	\`studio_title\` text,
  	\`studio_description\` text,
  	\`projects_subtitle\` text,
  	\`projects_title\` text,
  	\`projects_description\` text,
  	\`hww_subtitle\` text,
  	\`hww_title\` text,
  	\`hww_description\` text,
  	\`hww_image_id\` integer,
  	\`virtual_title\` text,
  	\`virtual_description\` text,
  	\`virtual_expectations\` text,
  	\`full_title\` text,
  	\`full_description\` text,
  	\`full_expectations\` text,
  	\`cta_title\` text,
  	\`cta_description\` text,
  	\`final_cta_title\` text,
  	\`about_subtitle\` text,
  	\`about_title\` text,
  	\`about_image_id\` integer,
  	\`about_role\` text,
  	\`about_name\` text,
  	\`about_body\` text,
  	\`guides\` text,
  	\`contact_subtitle\` text,
  	\`contact_title\` text,
  	\`contact_description\` text,
  	\`contact_email\` text,
  	\`contact_instagram\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_left_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`hero_right_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`hww_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`about_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home\`("id", "hero_left_image_id", "hero_left_caption", "hero_right_image_id", "hero_right_caption", "quote_text", "quote_author", "studio_subtitle", "studio_title", "studio_description", "projects_subtitle", "projects_title", "projects_description", "hww_subtitle", "hww_title", "hww_description", "hww_image_id", "virtual_title", "virtual_description", "virtual_expectations", "full_title", "full_description", "full_expectations", "cta_title", "cta_description", "final_cta_title", "about_subtitle", "about_title", "about_image_id", "about_role", "about_name", "about_body", "guides", "contact_subtitle", "contact_title", "contact_description", "contact_email", "contact_instagram", "updated_at", "created_at") SELECT "id", "hero_left_image_id", "hero_left_caption", "hero_right_image_id", "hero_right_caption", "quote_text", "quote_author", "studio_subtitle", "studio_title", "studio_description", "projects_subtitle", "projects_title", "projects_description", "hww_subtitle", "hww_title", "hww_description", "hww_image_id", "virtual_title", "virtual_description", "virtual_expectations", "full_title", "full_description", "full_expectations", "cta_title", "cta_description", "final_cta_title", "about_subtitle", "about_title", "about_image_id", "about_role", "about_name", "about_body", "guides", "contact_subtitle", "contact_title", "contact_description", "contact_email", "contact_instagram", "updated_at", "created_at" FROM \`home\`;`)
  await db.run(sql`DROP TABLE \`home\`;`)
  await db.run(sql`ALTER TABLE \`__new_home\` RENAME TO \`home\`;`)
  await db.run(sql`CREATE INDEX \`home_hero_left_image_idx\` ON \`home\` (\`hero_left_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_hero_right_image_idx\` ON \`home\` (\`hero_right_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_hww_image_idx\` ON \`home\` (\`hww_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_about_image_idx\` ON \`home\` (\`about_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_portfolio\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`seo_description\` text,
  	\`subtitle\` text,
  	\`header_title\` text,
  	\`header_description\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_portfolio\`("id", "seo_description", "subtitle", "header_title", "header_description", "updated_at", "created_at") SELECT "id", "seo_description", "subtitle", "header_title", "header_description", "updated_at", "created_at" FROM \`portfolio\`;`)
  await db.run(sql`DROP TABLE \`portfolio\`;`)
  await db.run(sql`ALTER TABLE \`__new_portfolio\` RENAME TO \`portfolio\`;`)
}
