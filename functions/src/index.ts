//import libraries
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";
import * as moment from 'moment-timezone';
import * as basicAuth from 'express-basic-auth';
import DataSnapshot = admin.database.DataSnapshot;

//initialize firebase inorder to access its services
admin.initializeApp(functions.config().firebase);

// Database
const db = admin.database();

//initialize express server
const app = express();
const main = express();

app.use(basicAuth({
  authorizer: authorizeService,
  authorizeAsync: true
}))

// Function to authroize user based on saved token in firestore database
async function authorizeService(username, password, authorize) {
  const snapshot = await db.ref('/users/' + username).once('value');
  const user = snapshot.val();
  authorize(null, user.apiEnabled && user.apiToken === password);
}

main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({extended: false}));

//define google cloud function name
export const rest2zep = functions.https.onRequest(main);

app.post('/users/:user/start', async (req: basicAuth.IBasicAuthedRequest, res) => {

  const authUser = req.auth.user;
  const user = req.params.user;

  if(authUser !== user) {
    res.status(403).json({error: "Auth user and path user differ!"});
    return;
  }

  db.ref('/users/' + user).once('value')
    .then((snapshot: DataSnapshot) => {
      const val = {
        endTime: null,
        exported: false,
        startTime: moment().tz("Europe/Zurich").format('YYYY-MM-DDTHH:mm'),
        text: snapshot.val().stdText
      };
      db.ref('/users/' + user + '/currentTimeSlot').set(val);
      res.status(200).json(val);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

app.post('/users/:user/end', async (req: basicAuth.IBasicAuthedRequest, res) => {

  const authUser = req.auth.user;
  const user = req.params.user;

  if(authUser !== user) {
    res.status(403).json({error: "Auth user and path user differ!"});
    return;
  }

  db.ref('/users/' + user + '/currentTimeSlot').once('value')
    .then((snapshot: DataSnapshot) => {

      if (snapshot.val() === null) {
        res.status(500).json({error: "No currentTimeSlot found"});
      } else {
        const timeSlot = {...snapshot.val(), endTime: moment().tz("Europe/Zurich").format('YYYY-MM-DDTHH:mm')};

        // delete currentTimeSlot
        snapshot.ref.remove();

        // Add timeSlot to timeSlots-List
        db.ref('/timeSlots/' + user).push(timeSlot)
          .then(() => res.status(200).json(timeSlot))
          .catch((err) => res.status(500).json({error: err}));
      }
    })
    .catch((err) => res.status(500).json({error: err}));
});

exports.timeSlotAdded = functions.database.ref('/timeSlots/{user}/{tid}').onCreate((snapshot, context) => {
  const user = context.params.user;
  const tid = context.params.tid;

  // snapshot.ref.child('exported').set(true);
});
