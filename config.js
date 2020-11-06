import firebase from 'firebase';
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyCl__pAuu92udyT6qub-l1omaHA40vBMFw",
    authDomain: "barterapp-9f6a4.firebaseapp.com",
    databaseURL: "https://barterapp-9f6a4.firebaseio.com",
    projectId: "barterapp-9f6a4",
    storageBucket: "barterapp-9f6a4.appspot.com",
    messagingSenderId: "136714278292",
    appId: "1:136714278292:web:381a00e7c0f078efe9eb81"
  };

  // Initialize Firebase
  
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();
