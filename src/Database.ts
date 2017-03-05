import { app } from "./App";
var firebase: any;

export class Database {
    config = {
        apiKey: "AIzaSyAYHldXbkmiClU-bw1MSr5-vMR_YDCP11A",
        authDomain: "ganaye-docs.firebaseapp.com",
        databaseURL: "https://ganaye-docs.firebaseio.com",
        storageBucket: "ganaye-docs.appspot.com",
        messagingSenderId: "435172815609"
    };


    constructor(reload: number) {
        if (!firebase) firebase = window["firebase"];
        if (!reload) {
            firebase.initializeApp(this.config)
        }
        var db = firebase.database().ref();
        db.on("value", function (snap) {
            console.log("database content:", JSON.stringify(snap.val()));
        });
    }

    test() {

        //app.printE("hi");
    }

}

