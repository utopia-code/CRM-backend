import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnqualifiedFromCampaignResult1792327396241 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Eliminar el default temporalmente.
    await queryRunner.query(`
      ALTER TABLE "interaction"
      ALTER COLUMN "campaignResult" DROP DEFAULT;
    `);

    // Renombrar el enum antiguo.
    await queryRunner.query(`
      ALTER TYPE "public"."interaction_campaignresult_enum"
      RENAME TO "interaction_campaignresult_enum_old";
    `);

    // Crear el enum actualizado.
    await queryRunner.query(`
      CREATE TYPE "public"."interaction_campaignresult_enum" AS ENUM (
        'POSITIVE',
        'PENDING',
        'NEGATIVE',
        'NOT_CONTACTED'
      );
    `);

    // Convertir la columna al nuevo tipo.
    await queryRunner.query(`
      ALTER TABLE "interaction"
      ALTER COLUMN "campaignResult"
      TYPE "public"."interaction_campaignresult_enum"
      USING "campaignResult"::text::"public"."interaction_campaignresult_enum";
    `);

    // Restaurar el valor por defecto de la entidad.
    await queryRunner.query(`
      ALTER TABLE "interaction"
      ALTER COLUMN "campaignResult"
      SET DEFAULT 'NOT_CONTACTED';
    `);

    // Eliminar el tipo anterior.
    await queryRunner.query(`
      DROP TYPE "public"."interaction_campaignresult_enum_old";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restaurar el enum anterior.
    await queryRunner.query(`
      ALTER TABLE "interaction"
      ALTER COLUMN "campaignResult" DROP DEFAULT;
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."interaction_campaignresult_enum"
      RENAME TO "interaction_campaignresult_enum_new";
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."interaction_campaignresult_enum" AS ENUM (
        'POSITIVE',
        'PENDING',
        'NEGATIVE',
        'NOT_CONTACTED',
        'UNQUALIFIED'
      );
    `);

    await queryRunner.query(`
      ALTER TABLE "interaction"
      ALTER COLUMN "campaignResult"
      TYPE "public"."interaction_campaignresult_enum"
      USING "campaignResult"::text::"public"."interaction_campaignresult_enum";
    `);

    await queryRunner.query(`
      ALTER TABLE "interaction"
      ALTER COLUMN "campaignResult"
      SET DEFAULT 'NOT_CONTACTED';
    `);

    await queryRunner.query(`
      DROP TYPE "public"."interaction_campaignresult_enum_new";
    `);
  }
}
