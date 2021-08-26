#!/usr/bin/env node
/* jshint esversion: 6 */
const logger = require('morgan');
const express = require('express');
const path = require('path');
const passport = require('passport');
const iucas = require('passport-iucas');
const session = require('express-session');

// Grab path to env file from command line if available. 
// Otherwise, check for a .env file adjacent to this file.
const args = process.argv.slice(2);
const ENV_FILE = args.length > 0 && args[0] || path.join(__dirname, '.env');

// Load the .env file for configuration options
require('dotenv').config({ path: ENV_FILE });

// Setup configuration options
const PORT = Number(process.env.PORT) || 8080;
const LISTEN_ADDR = process.env.LISTEN_ADDR || '0.0.0.0';
const USERS = process.env.USERS ? process.env.USERS.split(' ') : [];
const PROTECTED_DIR = process.env.PROTECTED_DIR || './site';
const LOGGER = process.env.LOGGER || 'dev';
const SESSION_SECRET = process.env.SESSION_SECRET || 'cow-abunga d00d';
const EXTERNAL_ROOT_PATH = process.env.EXTERNAL_ROOT_PATH || '/';
const LOGIN_URL = EXTERNAL_ROOT_PATH + 'login';

// Override remote-user login token
logger.token('remote-user', function (req, res) {
  return req.user && req.user.username || req.user;
});

// Given a path, find the absolute path to a file or directory
function abspath(rawPath) {
  if (rawPath.length && rawPath[0] === '.') {
    return path.resolve(path.join(__dirname, rawPath));
  } else {
    return path.resolve(rawPath);
  }
}

// Create the express instance
const app = express();

// Logging
app.use(logger(LOGGER));
// Session management
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
// Authentication
app.use(passport.initialize());
app.use(passport.session());

// IU CAS authentication strategy setup
const iucas_strategy = new iucas.Strategy(
  {serviceURL: LOGIN_URL === '/login' ? undefined : LOGIN_URL},
  function(username, done) {
    return done(null, {username: username, email: `${username}@iu.edu`});
  });
passport.use(iucas_strategy);

// Used to support sessions
passport.serializeUser(function(user, done) {
    done(null, user.username);
});
passport.deserializeUser(function(username, done) {
    done(null, username);
});

// Access this to login via IU CAS
app.use('/login', passport.authenticate('iucas', { failureRedirect: '/iucas/fail' }),
  function(req, res, next) {
    res.redirect(EXTERNAL_ROOT_PATH);
});

// Access this to logout
app.use('/logout', function(req, res, next) {
    req.logout();
    res.redirect(EXTERNAL_ROOT_PATH);
});

// Function to check authorization
function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) {
      if (req.user && USERS.indexOf(req.user) == -1) {
        res.status(403).send('You are not authorized to view this content.');
      } else {
        return next();
      }
    } else {
      res.redirect(LOGIN_URL);
    }
}

// Host the protected site directory, allowing only authorized users to view
app.use('/', ensureAuth, express.static(abspath(PROTECTED_DIR)));

// Start the server
app.listen(PORT, LISTEN_ADDR, 511, function() {
  console.log(`🚀 Server ready at http://${LISTEN_ADDR}:${PORT}`);
});
