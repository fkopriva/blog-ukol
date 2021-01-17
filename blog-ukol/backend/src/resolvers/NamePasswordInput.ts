import {
    InputType,
    Field
} from "type-graphql";

@InputType()
export class NamePasswordInput {
    @Field()
    firstname: string;

    @Field()
    lastname: string;

    @Field()
    email: string;

    @Field()
    password: string;

    @Field()
    confirmPassword: string;
}