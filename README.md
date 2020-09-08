# Steps to reproduce

run npm install in this repository
run firebase emulator locally (I used firebase-tools cli since it's easy to
integrate in a node environment)

```
firebase  emulators:start --only firestore
```

run the following command

```
DEBUG="digin:*" node_modules/.bin/babel-node firestore.js
```

this should display the following output (or something very similar)

```
  digin:firebase:admin start +0ms
  digin:firebase:admin trying to connect to firebase on localhost:8080 +2ms
Entered new data into the document
Updated an existing document
Read the document
Deleted the document
```

stop the firebase emulator and run the docker contained emulator:

```
docker run --rm -p 8080:8080  google/cloud-sdk gcloud beta emulators firestore start --host-port=127.0.0.1:8080
```

and rerun firestore.js

```
DEBUG="digin:*" node_modules/.bin/babel-node firestore.js

```

this should display the same output as the previous run, if it displays

```
  digin:firebase:admin start +0ms
  digin:firebase:admin trying to connect to firebase on localhost:8080 +1ms
watchdog timed out!
```

then it means it failed to connect and you reproduced the issue
