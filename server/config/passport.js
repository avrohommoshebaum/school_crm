// config/passport.js
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { userService } from "../db/services/userService.js";

export default function configurePassport(app) {
  // -----------------------------
  // Local strategy (email/password)
  // -----------------------------
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await userService.findByEmail(email.toLowerCase());

          if (!user) {
            return done(null, false, {
              message: "Invalid email or password",
            });
          }

          if (!user.hash) {
            return done(null, false, {
              message: "Invalid email or password",
            });
          }

          const isValid = await userService.verifyPassword(user, password);

          if (!isValid) {
            return done(null, false, {
              message: "Invalid email or password",
            });
          }

          if (user.status === "inactive") {
            return done(null, false, { message: "Account is inactive" });
          }

          // Populate roles before returning
          const userWithRoles = await userService.populateRoles(user);
          return done(null, userWithRoles);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // -----------------------------
  // Google OAuth (OPTIONAL)
  // -----------------------------
  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  ) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value?.toLowerCase();

            let user = await userService.findByGoogleId(profile.id);

            if (!user && email) {
              user = await userService.findByEmail(email);
            }

            if (!user) {
              user = await userService.create({
                googleId: profile.id,
                name: profile.displayName || "New User",
                email,
                status: "active",
              });
            } else if (!user.googleId) {
              await userService.update(user._id, { googleId: profile.id });
              user.googleId = profile.id;
            }

            const userWithRoles = await userService.populateRoles(user);
            return done(null, userWithRoles);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }

  // -----------------------------
  // Session handling
  // -----------------------------
  passport.serializeUser((user, done) => {
    done(null, user._id || user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userService.findById(id);
      if (!user) {
        return done(null, false);
      }
      const userWithRoles = await userService.populateRoles(user);
      done(null, userWithRoles);
    } catch (err) {
      done(err);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());
}
