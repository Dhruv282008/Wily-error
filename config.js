import * as firebase from 'firebase'
require('@firebase/firestore')

  var firebaseConfig = {
    apiKey: "AIzaSyANCU3FjAaUsKPIG8jKLTsnrWbV9aNAyzo",
    authDomain: "wireless-library-app-f4d02.firebaseapp.com",
    projectId: "wireless-library-app-f4d02",
    storageBucket: "wireless-library-app-f4d02.appspot.com",
    messagingSenderId: "901885085374",
    appId: "1:901885085374:web:b643dcc2d28b404d26c0ef"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();