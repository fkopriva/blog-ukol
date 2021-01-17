import { Post } from "../entities/Post";
import {
    Resolver,
    Query,
    Arg,
    Mutation,
    Field,
    InputType,
    Ctx,
    UseMiddleware,
    Int,
    FieldResolver,
    Root,
    ObjectType
} from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { User } from "../entities/User";

@InputType()
class PostInput {
    @Field()
    title: string;

    @Field()
    text: string;
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];

    @Field()
    hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post
    ) {
        return root.text.slice(0, 290);
    }

    @FieldResolver(() => String)
    parax(
        @Root() root: Post
    ) {
        return root.text.slice(0, 50);
    }

    @FieldResolver(() => User)
    creator(
        @Root() post: Post,
        @Ctx() { userLoader }: MyContext
    ) {
        return userLoader.load(post.creatorId);
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    ): Promise<PaginatedPosts> {
        // 20 -> 21
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;

        const replacements: any[] = [realLimitPlusOne];

        let cursorIdx = 2;
        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
            cursorIdx = replacements.length;
        }

        const posts = await getConnection().query(`
            select p.*,
            (select count(*) from comment where "postId" = p.id) "commentsLength"
            from post p
            ${cursor ? `where p."createdAt" < ${cursorIdx}` : ""}
            order by p."createdAt" DESC
            limit $1
        `,
            replacements
        );

        return { 
            posts: posts.slice(0, realLimit), 
            hasMore: posts.length === realLimitPlusOne
        };
    }

    @Query(() => Post, { nullable: true })
    post(
        @Arg("id", () => Int) id: number,
    ): Promise<Post | undefined> {
        return Post.findOne(id);
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
        return Post.create({
            ...input,
            creatorId: req.session.userId,
        }).save();
    }

    @Query(() => [Post])
    @UseMiddleware(isAuth)
    async myPosts(
        @Ctx() { req }: MyContext
    ): Promise<Post[]> {
        const replacements: any[] = [req.session.userId];
        const posts = await getConnection().query(`
            select p.*,
            (select count(*) from comment where "postId" = p.id) "commentsLength"
            from post p
            where p."creatorId" = $1
        `,
            replacements
        )
        return posts;
    };

    @Query(() => [Post])
    async relatedPosts(
        @Arg("postId", () => Int) postId: number
    ): Promise<Post[]> {
        const replacements: any[] = [postId];
        const posts = await getConnection().query(`
            select p.*
            from post p
            where p.id != $1
        `,
            replacements
        )    

        return posts;
    }

    @Mutation(() => Post, { nullable: true })
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg("id", () => Int) id: number,
        @Arg("title") title: string,
        @Arg("text") text: string,
    ): Promise<Post | null> {
        const result = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({ title, text })
            .where('id = :id', { id })
            .returning("*")
            .execute();
            
        return result.raw[0];
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<Boolean> {
        await Post.delete({ id, creatorId: req.session.userId });
        return true;
    }
}