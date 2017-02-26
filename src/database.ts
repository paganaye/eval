var firebase: any;

export class Database {
    config = {
        apiKey: "AIzaSyDJ-Y0blEFCKL-5mzDGKCvAduCmDQwBz6k",
        authDomain: "data-88a32.firebaseapp.com",
        databaseURL: "https://data-88a32.firebaseio.com",
        storageBucket: "data-88a32.appspot.com",
        messagingSenderId: "1000498540065"
    };

    constructor() {
        firebase.initializeApp(this.config)
        var db = firebase.database().ref();
        db.on('value', function (snap) {
            console.log("database content:", JSON.stringify(snap.val()));
        });
    }

}

