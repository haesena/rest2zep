//import libraries
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";
import * as moment from 'moment';
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
    const snapshot = await db.ref('/users/' + username + '/token').once('value');
    authorize(null, snapshot.val() === password);
}

main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

//define google cloud function name
export const rest2zep = functions.https.onRequest(main);

app.post('/users/:user/start', async (req, res) => {
    const user = req.params.user;
    const val = {
        currentStart: moment().format('YYYY-MM-DD HH:mm')
    };
    db.ref('/users/' + user).update(val)
        .then(() => res.status(200).json(val))
        .catch((err) => res.status(500).json({error: err}));
});

app.post('/users/:user/end', async (req, res) => {
    const user = req.params.user;

    db.ref('/users/' + user + '/currentStart').once('value')
        .then((snapshot: DataSnapshot) => {

            if(snapshot.val() === null) {
                res.status(500).json({error: "No currentStart found"});
            } else {
                const timeSlot = {
                    start: snapshot.val(),
                    end: moment().format('YYYY-MM-DD HH:mm'),
                    exported: false
                };

                db.ref('/users/' + user).update({currentStart: null});

                db.ref('/users/' + user + '/timeSlots').push(timeSlot)
                    .then(() => res.status(200).json(timeSlot))
                    .catch((err) => res.status(500).json({error: err}));
            }
        })
        .catch((err) => res.status(500).json({error: err}));
});


