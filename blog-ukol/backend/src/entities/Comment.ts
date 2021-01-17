import { 
    Entity, 
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    ManyToOne,
    PrimaryGeneratedColumn,
    OneToMany,
} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { User } from "./User";
import { Post } from "./Post";
import { Updoot } from "./Updoot";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    text!: string;

    @Field()
    @Column({ type: "int", default: 0})
    points!: number;

    @Field(() => Int, { nullable: true })
    voteStatus: number | null;

    @Field()
    @Column()
    authorId: number;
    
    @Field(() => User)
    @ManyToOne(() => User, (user) => user.comments)
    author: User;

    @Field()
    @Column()
    postId: number;

    @ManyToOne(() => Post, (post) => post.comments, {
        onDelete: "CASCADE",
    })
    post: Post;

    @OneToMany(() => Updoot, (updoot) => updoot.comment)
    updoots: Updoot[];

    @Field(() => String)
    @CreateDateColumn()
    createdAt = new Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = new Date();
}