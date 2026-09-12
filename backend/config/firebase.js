const admin = require("firebase-admin");
let db;
try {
  const serviceAccount = require("../serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  db = admin.firestore();
} catch (e) {
  console.warn("serviceAccountKey.json mancante o non configurato.");
}

module.exports = { db, admin };
