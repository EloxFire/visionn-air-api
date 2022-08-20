const express = require('express');
const router = express.Router();
const { getFirestore, } = require('firebase-admin/firestore');

// GET ALL PHARMACISTS FROM DB
router.get('/', async (req, res) => {
  const db = getFirestore();
  const phramaRef = db.collection('Pharmacist');
  const pharmaDoc = await phramaRef.get();

  let pharmacists = [];
  pharmaDoc.forEach(doc => {
    pharmacists.push(doc.data());
  })

  res.status(200).json(pharmacists);
});

// GET PHARMACIST BY ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const db = getFirestore();
  const phramaRef = db.collection('Pharmacist');
  const pharmaDoc = await phramaRef.where('id', '==', id).get();
  if (pharmaDoc.docs.length === 0) {
    console.log("Pharmacist not found...");
    res.status(200).send('Pharmacist not found...');
  } else {
    console.log("Pharmacist successfully found !");
    res.status(200).json(pharmaDoc.docs[0].data());
  }
});


// UPDATE PHARMACIST ACCOUNT BY ID
router.post('/update/:id', async (req, res) => {
  const id = req.params.id;
  const db = getFirestore();
  const collectionRef = db.collection('Pharmacist');

  //Account data
  let data = req.body;
  const newData = {
    firstname: data.firstname,
    lastname: data.lastname,
    mail: data.mail,
    phone: data.phone
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

module.exports = router;