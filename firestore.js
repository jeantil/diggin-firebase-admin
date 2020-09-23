import Debug from "debug";
import { Firestore } from "@google-cloud/firestore";

const debug = Debug("digin:firebase:admin");

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

main(async () => {
  debug(`trying to connect to firebase on ${emulatorHost}`);
  process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;

  // Create a new client
  const firestore = new Firestore();

  // Obtain a document reference.
  const document = firestore.doc("posts/intro-to-firestore");
  // Enter new data into the document.
  await document.set({
    title: "Welcome to Firestore",
    body: "Hello World",
  });
  console.log("Entered new data into the document");

  // Update an existing document.
  await document.update({
    body: "My first Firestore app",
  });
  console.log("Updated an existing document");

  // Read the document.
  const doc = await document.get();
  console.log("Read the document");

  // Delete the document.
  await document.delete();
  console.log("Deleted the document");
});
