import { Field, ObjectType } from 'type-graphql';

import { User } from '../User/User';

@ObjectType()
export class Project {
    /** Identifier */
    @Field()
    id: string;

    /** Name */
    @Field()
    name: string;

    /** Media URL */
    @Field({ nullable: true })
    mediaUrl?: string;

    /** Serialized Circuit */
    @Field()
    circuit: string;

    /** Private Flag */
    @Field()
    private: boolean;

    /** Owner Id */
    @Field()
    ownerId: string;

    /** Owner */
    @Field(() => User)
    owner: User;

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
