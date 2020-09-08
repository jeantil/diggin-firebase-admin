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

const emulatorHost = "localhost:8080";

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
  const cols = await store.listCollections();
  debug("cols");
  debug(cols);
  await store.terminate();
  await app.delete();
});
