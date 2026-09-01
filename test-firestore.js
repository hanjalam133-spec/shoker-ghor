const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, initializeFirestore } = require("firebase/firestore");
const config = require("./firebase-applet-config.json");
const app = initializeApp(config);
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, config.firestoreDatabaseId);
getDocs(collection(db, "products")).then(s => console.log("Success:", s.size)).catch(e => console.error("Error:", e));
