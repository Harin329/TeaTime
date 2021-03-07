// The Cloud Functions for Firebase SDK to create Cloud Functions
// and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

// const {Storage} = require("@google-cloud/storage");
// const storage = new Storage();

exports.detectLanguage = functions.storage
    .object()
    .onFinalize(async (object) => {
    // Imports the Google Cloud client library
      const speech = require("@google-cloud/speech").v1p1beta1;

      // Creates a client
      const client = new speech.SpeechClient();
      // const bucket = storage.bucket(object.bucket);
      // const file = bucket.file(object.name);

      const uri = "gs://sfhacks2021.appspot.com/Recording/FM9mCxpIL0PYJ0Vw41tsHbjfNv12_PiIfuoPZ6zv482Rsysxc.mp3"; // gs://${bucket.name}/${file.name}

      const config = {
        encoding: "LINEAR16",
        sampleRateHertz: 384000,
        languageCode: "en-US",
        enableAutomaticPunctuation: "true",
        model: "default",
        alternativeLanguageCodes: ["es-ES", "en-US", "en-CA", "fr-CA", "en-GB"],
      };

      const audio = {
        uri: uri,
      };

      const request = {
        config: config,
        audio: audio,
      };

      const [operation] = await client.longRunningRecognize(request);
      const [response] = await operation.promise();
      console.log(`Response: ${response}`);
      const transcription = response.results
          .map((result) => result.alternatives[0].transcript)
          .join("\n");
      console.log(`Transcription: ${transcription}`);
      console.log(`Words: ${response.results.toString()}`);


      //   admin.firestore().collection("Recordings").add({
      //     doc: transcription,
      //   });

      return null;
    });
