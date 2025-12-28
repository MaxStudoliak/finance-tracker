import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../prisma';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Ищем пользователя по Google ID
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        // Если не найден, ищем по email
        if (!user && profile.emails && profile.emails.length > 0) {
          const email = profile.emails[0].value;
          user = await prisma.user.findUnique({
            where: { email },
          });

          // Если нашли по email, обновляем googleId
          if (user) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id },
            });
          }
        }

        // Если пользователь не найден, создаем нового
        if (!user && profile.emails && profile.emails.length > 0) {
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              name: profile.displayName || null,
              googleId: profile.id,
            },
          });
        }

        return done(null, user || false);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
