import Debug from "debug";

import * as admin from "firebase-admin";

const debug = Debug("digin:firebase:admin");
debug("start");
export function abort(msg) {
  throw new Error(msg);
}

export function watchdog(timeout) {
  return setTimeout(() => {
    console.log("watchdog timed out!");
    process.exit(1);
  }, timeout);
}

export async function main(f, timeout = 10000) {
  const watcher = watchdog(timeout);
  const args = process.argv.slice(2);
  try {
    await f(args, process);
    clearTimeout(watcher);
  } catch (error) {
    console.error(error.message);
    console.error(error.stack);
    clearTimeout(watcher);
  }
}

const emulatorHost = "127.0.0.1:8080";
function transactDelete(collection, id) {
  const docRef = collection.doc(id);
  return collection.firestore.runTransaction(
    async (transaction) => {
      console.log("run delete transactionnal against", docRef.id);
      const result = await transaction.get(docRef).then(
        (doc) => {
          if (doc && doc.exists) {
            return { doc, id };
          } else {
            return null;
          }
        },
        () => {}
      );
      transaction.delete(docRef);
      return Promise.resolve(result);
    },
    { maxAttempts: 1 }
  );
}
main(async () => {
  debug(`trying to connect to firebase on ${emulatorHost}`);
  process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;
  //make sure to define process.env.GOOGLE_APPLICATION_CREDENTIALS and point it to an appropriate credential file=

  const app = admin.initializeApp({
    projectId: "test",
    credential: admin.credential.applicationDefault(),
  });
  debug("app initialized");
  const store = app.firestore();
  debug("store initialized");
  const collection = store.collection("tokens");
  const document = collection.doc("1");
  await document.set({
    token: 1,
  });
  const document2 = collection.doc("2");
  await document2.set({
    token: 2,
  });
  const document3 = collection.doc("3");
  await document3.set({
    token: 3,
  });
  debug("setup completed");
  await transactDelete(collection, "1");
  debug("test case 1 : non concurrent transactional delete OK");
  const del1 = await transactDelete(collection, "2");
  const del2 = await transactDelete(collection, "2");
  debug(
    "test case 2: serialized transactional delete OK, del1:%s, del2:%s",
    del1,
    del2
  );
  const delc1 = transactDelete(collection, "3");
  const delc2 = transactDelete(collection, "3");
  await Promise.all([delc1, delc2]);
  debug(
    "test case 2 : concurrent transactional delete OK, del1:%s, del2:%s",
    delc1,
    delc2
  );
  await store.terminate();
  await app.delete();
});
