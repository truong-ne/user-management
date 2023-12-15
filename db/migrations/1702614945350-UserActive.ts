import { MigrationInterface, QueryRunner } from "typeorm";

export class UserActive1702614945350 implements MigrationInterface {
    name = 'UserActive1702614945350'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ADD "isActive" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "isActive"`);
    }

}
