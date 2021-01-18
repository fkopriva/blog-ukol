import { MigrationInterface, QueryRunner } from "typeorm";
import bcrypt from "bcryptjs";

export class mockUser1610919517154 implements MigrationInterface {    
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        insert into public.user (firstname, lastname, email, password, "confirmPassword", "isAdmin") values ('test', 'admin', 'admin@admin.com', '${bcrypt.hashSync("admin", 8)}', '${bcrypt.hashSync("admin", 8)}', true);
        insert into post (title, text, "creatorId", "createdAt") values ('Ishtar', 'Sed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci. Nullam molestie nibh in lectus.', 1, '2020-03-06T11:49:40Z');
        insert into post (title, text, "creatorId", "createdAt") values ('Capone', 'Integer tincidunt ante vel ipsum. Praesent blandit lacinia erat. Vestibulum sed magna at nunc commodo placerat.', 1, '2020-04-05T12:50:15Z');
        insert into post (title, text, "creatorId", "createdAt") values ('News from a Personal War (Notícias de uma Guerra Particular)', 'Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem.', 1, '2020-09-01T04:39:18Z');
        `);
    }

    public async down(_: QueryRunner): Promise<void> {
    }
    
}
