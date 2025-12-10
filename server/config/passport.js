const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const { User } = require('../models');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy (Email/Password)
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Find user by email
      const user = await User.findOne({ where: { email } });
      
      // If no user found
      if (!user) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }
      
      // Success
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3003/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with Google ID
      let user = await User.findOne({ where: { googleId: profile.id } });
      
      if (user) {
        return done(null, user);
      }
      
      // Check if user exists with email
      user = await User.findOne({ where: { email: profile.emails[0].value } });
      
      if (user) {
        // Update user with Google ID
        user.googleId = profile.id;
        await user.save();
        return done(null, user);
      }
      
      // Create new user
      user = await User.create({
        email: profile.emails[0].value,
        googleId: profile.id
      });
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

module.exports = passport;