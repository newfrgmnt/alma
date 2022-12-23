import { PrismaClient } from '@prisma/client';
import _ from 'lodash';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { Route } from '../../server/routes';
import { randomString } from '../../utils/random/random';

export const googleStrategy = (db: PrismaClient) => {
    return new GoogleStrategy(
        {
            clientID: process.env.ALMA_GOOGLE_OAUTH_CLIENT_ID,
            clientSecret: process.env.ALMA_GOOGLE_OAUTH_CLIENT_SECRET,
            callbackURL: Route.GOOGLE_OAUTH_REDIRECT
        },
        async (accessToken, refreshToken, profile, done) => {
            const email = profile.emails?.[0].value;

            if (!email) {
                return;
            }

            const currentUser = await db.user.findFirst({
                where: { email }
            });

            if (currentUser) {
                return done(undefined, currentUser);
            } else {
                const newUser = await db.user.create({
                    data: {
                        name: profile.displayName,
                        email,
                        username: `${_.lowerCase(profile.name?.givenName)}${randomString(12)}`,
                        mediaUrl: profile.photos?.[0].value
                    }
                });

                return done(undefined, newUser);
            }
        }
    );
};
