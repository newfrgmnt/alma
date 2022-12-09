import { Field, ObjectType } from 'type-graphql';

import { Project } from '../Project/Project';

@ObjectType()
export class User {
    /** Identifier */
    @Field()
    id: string;

    /** Name */
    @Field()
    name: string;

    /** Username */
    @Field()
    username: string;

    /** Media URL */
    @Field({ nullable: true })
    mediaUrl?: string;

    /** Projects */
    @Field(() => [Project])
    projects: Project[];

    /** Created At */
    @Field()
    createdAt: Date;

    /** Updated At */
    @Field()
    updatedAt: Date;

    /** Created At */
    @Field({ nullable: true })
    deletedAt?: Date;
}
