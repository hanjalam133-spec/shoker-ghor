const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, initializeFirestore } = require("firebase/firestore");
const fs = require('fs');
const config = require("./firebase-applet-config.json");
const app = initializeApp(config);
const db = initializeFirestore(app, {}, config.firestoreDatabaseId);

const products = JSON.parse(fs.readFileSync('products_db.json', 'utf-8'));

async function seed() {
  for (const product of products) {
    try {
      await setDoc(doc(db, "products", String(product.id)), product);
      console.log('Seeded:', product.title);
    } catch (e) {
      console.error('Error seeding', product.id, e);
    }
  }
  console.log('Done');
}
seed();
