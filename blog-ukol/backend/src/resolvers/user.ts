import { User } from "../entities/User";
import { MyContext } from "../types";
import { 
    Resolver, 
    Mutation, 
    Arg, 
    Field, 
    Ctx, 
    ObjectType,
    Query,
    FieldResolver,
    Root
} from "type-graphql";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { NamePasswordInput } from "./NamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

declare module 'express-session' {
    interface SessionData {
        userId: number;
    }
}

@Resolver(User)
export class UserResolver {
    @FieldResolver(() => String)
    email(
        @Root() user: User,
        @Ctx() { req }: MyContext
    ) {
        // this is the current user and its ok to show them their own email
        if(req.session.userId === user.id) {
            return user.email;
        }
        // current user wants to see someone elses email
        return "";
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 2) {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message: "Password length must be greater than 2",
                    },
                ],
            };
        }

        const key = FORGET_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);
        if (!userId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "Token expired",
                    },
                ],
            };
        }

        const userIdNum = parseInt(userId);
        const user = await User.findOne(userIdNum);
        if (!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "User no longer exists",
                    },
                ],
            };
        }

        await User.update(
            { id: userIdNum }, 
            { password: bcrypt.hashSync(newPassword, 8) }
        );

        await redis.del(key);

        // log in user after change password
        req.session.userId = user.id;

        return {
            user,
        };
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() { redis }: MyContext
    ) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            // email is not in DB
            return true;
        }

        const token = v4();

        await redis.set(
            FORGET_PASSWORD_PREFIX + token, 
            user.id, 
            "ex", 
            1000 * 60  * 60 * 24 *  3
        ); // 3 days
        
        sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`
        );
        return true;
    }

    @Query(() => User, { nullable: true })
    me(
        @Ctx() { req }: MyContext
    ) {
        // not logged in
        if (!req.session.userId) {
            return null;
        }

        return User.findOne(req.session.userId);
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: NamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if (errors) {
            return { errors };
        }

        const hashedPassword = bcrypt.hashSync(options.password, 8);
        const hashedConfirmPassword = bcrypt.hashSync(options.confirmPassword, 8);
        let user;
        try {
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    firstname: options.firstname,
                    lastname: options.lastname,
                    email: options.email,
                    password: hashedPassword,
                    confirmPassword: hashedConfirmPassword,
                })
                .returning("*")
                .execute();
            user = result.raw[0];
        } catch (err) {
            //duplicate username error
            console.log(err);
            if (err.code === '23505') {
                return {
                    errors: [
                        {
                            field: "email",
                            message: "email already taken",
                        },
                    ],
                };
            }
        }

        // store user id session
        // this will set a cookie on the user
        // keep them logged in
        req.session.userId = user.id;

        return {
            user,
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne({ where: { email: email } } );
        if (!user) {
            return {
                errors: [
                    {
                        field: "email",
                        message: "that email doesn't exist",
                    },
                ],
            };
        }
        const valid = bcrypt.compareSync(password, user.password);
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password",
                    },
                ],
            };
        }

        req.session.userId = user.id;

        return {
            user,
        };
    }

    @Mutation(() => Boolean)
    logout (
        @Ctx() {req, res}: MyContext
    ) {
        return new Promise((resolve) => 
            req.session.destroy((err) => {
                res.clearCookie(COOKIE_NAME);
                if (err) {
                    console.log(err);
                    resolve(false);
                    return;
                }
                resolve(true);
            })
        );
    }
}