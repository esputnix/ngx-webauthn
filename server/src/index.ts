import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as crypto from 'crypto';
import * as WebAuthn from 'webauthn';

// app
const port = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());

// session
app.use(session({
  secret: crypto.randomBytes(32).toString('hex'),
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }
}));

// serve angular app
app.use(express.static(path.join(__dirname, '../../dist/ngx-webauthn')));

// webauthn routes
const webauthn = new WebAuthn({
  origin: `http://localhost:4200`,
  usernameField: 'email', // field that uniquely id's user
  userFields: {
    email: 'email',
    name: 'displayName',
  },
  // using default in-memory "db"
  // OR
  // store: {
  //   put: async (id, value) => void,
  //   get: async (id) => User,
  //   search: async (search) =>  { [username]: User },
  //   delete: async (id) => boolean,
  // },
  rpName: 'Inorganik Produce, inc.',
});

app.use('/webauthn', webauthn.initialize());

// check if the user is signed in
app.get('/auth-check', webauthn.authenticate(), (req, res) => {
  res.status(200).json({ status: 'ok'});
});

// init
app.listen(port, () => console.log(`Server listening on port ${port}!`));
