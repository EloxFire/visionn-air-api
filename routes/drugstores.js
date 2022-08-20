const express = require('express');
const router = express.Router();
const { getFirestore, } = require('firebase-admin/firestore');
const admin = require("firebase-admin");
const firebaseServiceAccount = require('../firebase-adminsdk-key-iti-medics.json');
const { Expo } = require('expo-server-sdk');

const app = admin.initializeApp({ credential: admin.credential.cert(firebaseServiceAccount) });
const expo = new Expo()


// GET ALL DRUGSTORES FROM DB
router.get('/', async (req, res) => {
  const db = getFirestore();
  const phramaRef = db.collection('Drugstore');
  const pharmaDoc = await phramaRef.get();

  let drugstores = [];
  pharmaDoc.forEach(doc => {
    drugstores.push(doc.data());
  })

  res.status(200).json(drugstores);
});

// GET DRUGSTORE BY ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const db = getFirestore();
  const phramaRef = db.collection('Drugstore');
  const pharmaDoc = await phramaRef.where('id', '==', id).get();
  if (pharmaDoc.docs.length === 0) {
    console.log("Drugstore not found...");
    res.status(200).send('Drugstore not found...');
  } else {
    console.log("Drugstore successfully found !");
    res.status(200).json(pharmaDoc.docs[0].data());
  }
});


// Update drugstore account by id
router.post('/update/:id', async (req, res) => {
  const id = req.params.id;
  const db = getFirestore();
  const collectionRef = db.collection('Drugstore')

  //Account data
  let data = req.body;
  const newData = {
    displayname: data.displayname,
    address: data.address,
    hours: data.hours,
    phone: data.phone,
    mail: data.mail
  }

  // Get account
  const account = await collectionRef.where('id', '==', id).get();
  // console.log(account);
  if (account.docs.length === 0) {
    res.status(404).send('Account not found...');
  }

  // Update account
  await collectionRef.doc(account.docs[0].id).update(newData);
  res.status(200).send(`Account ${account.docs[0].id} updated successfully !`);
});

// SEND NOTIFICATION TO ALL USERS SUBSCRIBED TO DRUGSTORE
router.post('/send', async (req, res) => {
  const communication = req.body.message;
  const drugstore_ref = req.body.drugstore_ref;
  const db = getFirestore();
  const phramaRef = db.collection('Drugstore');

  // console.log("Sending notification to all users subscribed to drugstore");
  const drugstoreDoc = await phramaRef.where('ref', '==', drugstore_ref).get();

  if (drugstoreDoc.docs.length === 0) {
    res.status(200).send('Drugstore not found...');
    return;
  }

  let messages = [];

  console.log(drugstoreDoc.docs[0].data().users);


  for (let i = 0; i < drugstoreDoc.docs[0].data().users.length; i++) {
    const token = drugstoreDoc.docs[0].data().users[i];
    console.log(token);

    if (!Expo.isExpoPushToken(token)) {
      console.error(`Push token ${token} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: token,
      title: "ITI Medics",
      body: communication,
    })
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        console.log("Sending push notif");
      } catch (error) {
        console.error(error);
      }
    }
  })();

  let receiptIds = [];
  for (let ticket of tickets) {
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(receipts);
        for (let receiptId in receipts) {
          let { status, message, details } = receipts[receiptId];
          if (status === 'ok') {
            continue;
          } else if (status === 'error') {
            console.error(
              `There was an error sending a notification: ${message}`
            );
            if (details && details.error) {
              console.error(`The error code is ${details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();

  res.status(200).json(drugstoreDoc.docs[0].data().users);
});

router.post('/subscribe/:pharma_id', async (req, res) => {
  const id = req.params.pharma_id;
  const { pushToken, oldPharma } = req.body;

  const db = getFirestore();
  const phramaRef = db.collection('Drugstore');
  const pharmaDoc = await phramaRef.where('id', '==', id).get();

  if (oldPharma !== "") {
    const oldPharmaDoc = await phramaRef.where('id', '==', oldPharma).get();

    if (oldPharmaDoc.docs.length !== 0) {
      console.log('Old pharma found, unscubscribing...');
      const oldPharmaUsers = oldPharmaDoc.docs[0].data().users;
      // Unsubscribe user from old pharma
      let temp = oldPharmaUsers.filter(user => user !== pushToken);
      oldPharmaDoc.docs[0].ref.update({ users: temp, updated_at: new Date() });
    } else {
      console.log('Old pharma not found, nothing to do...');
    }
  }


  if (pharmaDoc.docs.length === 0) {
    console.log('Pharma not found');
    res.status(200).send({ response: 'Pharma not found' });
    return;
  }

  const pharmaUsers = pharmaDoc.docs[0].data().users;

  let enabled;
  let temp = [];
  if (pharmaUsers.includes(pushToken)) {
    // User is already subscribed to the drugstore
    temp = pharmaUsers.filter(user => user !== pushToken);
    enabled = false;
  } else {
    // User is not subscribed to the drugstore
    temp = pharmaUsers;
    temp.push(pushToken);
    enabled = true;
  }

  console.log(temp);

  pharmaDoc.docs[0].ref.update({
    users: temp,
    updated_at: new Date()
  })

  res.status(200).send({ response: `User ${pushToken} ${enabled ? 'subscribed' : 'unsubscribed'} successfully to pharma ${id} !` });
});


module.exports = router;