import { ObjectType, Field } from "type-graphql";
import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    OneToMany,
} from "typeorm"; 
import { Post } from "./Post";
import { Updoot } from "./Updoot";
import { Comment } from "./Comment";

@ObjectType()
@Entity()
export class User extends  BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    firstname!: string;

    @Field()
    @Column()
    lastname!: string;

    @Field()
    @Column({ unique: true })
    email!: string;

    @Field()
    @Column({ nullable: true })
    image: string;

    @Column()
    password!: string;

    @Column()
    confirmPassword!: string;

    @OneToMany(() => Post, (post) => post.creator)
    posts: Post[];

    @OneToMany(() => Updoot, (updoot) => updoot.user)
    updoots: Updoot[];

    @OneToMany(() => Comment, (comment) => comment.author)
    comments: Comment[];

    @Field(() => String)
    @CreateDateColumn()
    createdAt = new Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = new Date();
}