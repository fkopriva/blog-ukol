import { 
    Entity, 
    Column,
    BaseEntity,
    ManyToOne,
    PrimaryColumn,
} from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";

@Entity()
export class Updoot extends BaseEntity {
    @Column({ type: "int" })
    value: number;

    @PrimaryColumn()
    userId: number;

    @ManyToOne(() => User, (user) => user.updoots)
    user: User;

    @PrimaryColumn()
    commentId: number;

    @ManyToOne(() => Comment, (comment) => comment.updoots, {
        onDelete: "CASCADE",
    })
    comment: Comment;
}