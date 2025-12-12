// config/passport.js
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../db/models/user.js";

export default function configurePassport(app) {
  // Local strategy (email + password)
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    (email, password, done) => {
      // Get the built-in authenticator from passport-local-mongoose
      const authenticate = User.authenticate();

      authenticate(email.toLowerCase(), password, (err, user, info) => {
        if (err) return done(err);

        if (!user) {
          // info.message contains the exact reason (bad password, missing, etc.)
          return done(null, false, { message: info?.message || "Invalid email or password" });
        }

        if (user.status === "inactive") {
          return done(null, false, { message: "Account is inactive" });
        }

        return done(null, user);
      });
    }
  )
);



  // Google OAuth
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();

          let user = await User.findOne({ googleId: profile.id });

          if (!user && email) {
            user = await User.findOne({ email });
          }

          if (!user) {
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName || "New User",
              email,
              status: "active",
            });
          } else {
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).populate("roles");
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());
}
