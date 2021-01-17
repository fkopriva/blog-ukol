import { Comment } from "../entities/Comment";
import { isAuth } from "../middleware/isAuth";
import { 
    Arg, 
    Ctx, 
    Field, 
    FieldResolver, 
    Int, 
    Mutation, 
    ObjectType, 
    Query, 
    Resolver, 
    Root, 
    UseMiddleware 
} from "type-graphql";
import { MyContext } from "../types";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";

@ObjectType()
class PaginatedComments {
    @Field(() => [Comment])
    comments: Comment[];

    @Field()
    hasMore: boolean;
}

@Resolver(Comment)
export class CommentResolver {
    @FieldResolver(() => User)
    author (
        @Root() comment: Comment,
        @Ctx() { userLoader }: MyContext
    ) {
        return userLoader.load(comment.authorId);
    }
    
    @FieldResolver(() => Int, { nullable: true })
    async voteStatus(
        @Root() comment: Comment,
        @Ctx() { updootLoader, req }: MyContext
    ) {
        if (!req.session.userId) {
            return null; 
        }
        const updoot = await updootLoader.load({ 
            commentId: comment.id,
            userId: req.session.userId,
        });

        return updoot ? updoot.value : null;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg("commentId", () => Int) commentId: number,
        @Arg("value", () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;
        const { userId } = req.session;

        const updoot = await Updoot.findOne({where: {commentId, userId}});

        // the user has voted on the post before
        // and they are changing their vote
        if (updoot && updoot.value !== realValue) {
            await getConnection().transaction(async (tm) => {
                await tm.query(`
                    update updoot
                    set value = $1
                    where "commentId" = $2 and "userId" = $3
                `, [realValue, commentId, userId]);

                await tm.query(`
                    update comment
                    set points = points + $1
                    where id = $2
                `, [2 * realValue, commentId])
            });
        } else if (!updoot) {
            // has never voted before
            await getConnection().transaction(async (tm) => {
                tm.query(`
                    insert into updoot ("userId", "commentId", value)
                    values ($1, $2, $3)
                `, [userId, commentId, realValue]);
                await tm.query(`
                    update comment
                    set points = points + $1
                    where id = $2
                `, [realValue, commentId]);
            })
        }
        return true; 
    }

    @Query(() => PaginatedComments)
    async comments(
        @Arg("limit", () => Int) limit: number,
        @Arg("postId", () => Int) postId: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    ): Promise<PaginatedComments> {
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;

        const replacements: any[] = [realLimitPlusOne];

        if (postId) {
            replacements.push(postId);
        }

        let cursorIdx = 3;
        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
            cursorIdx = replacements.length;
        }

        const comments = await getConnection().query(`
            select c.*
            from comment c
            where c."postId" = $2
            ${cursor ? `and c."createdAt" < ${cursorIdx}` : ""}
            order by c."createdAt" DESC
            limit $1
        `,
            replacements
        );

        return {
            comments: comments.slice(0, realLimit),
            hasMore: comments.length === realLimitPlusOne
        };
        
    }

    @Mutation(() => Comment)
    @UseMiddleware(isAuth)
    async createComment(
        @Arg("id", () => Int) postId: number, 
        @Arg("text") text: string,
        @Ctx() { req }: MyContext
    ): Promise<Comment> {
        return Comment.create({
            text,
            authorId: req.session.userId,
            postId: postId,
        }).save();
    }
}