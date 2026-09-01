import { initializeApp } from "firebase/app";
import { initializeFirestore, getDocs, collection } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json"));
const app = initializeApp(config);
const db = initializeFirestore(app, {}, config.firestoreDatabaseId);

async function test() {
  try {
    const snap = await getDocs(collection(db, "products"));
    console.log("Docs:", snap.docs.length);
  } catch(e) {
    console.error(e);
  }
}
test();
