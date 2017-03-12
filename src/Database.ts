import { app } from "./App";
import { Eval } from './Eval';
import { Output } from "./Output";
var firebase: any;

export class Database {
    config = {
        apiKey: "AIzaSyAYHldXbkmiClU-bw1MSr5-vMR_YDCP11A",
        authDomain: "ganaye-docs.firebaseapp.com",
        databaseURL: "https://ganaye-docs.firebaseio.com",
        storageBucket: "ganaye-docs.appspot.com",
        messagingSenderId: "435172815609"
    };


    constructor(private evalContext: Eval) {
        if (!firebase) {
            firebase = window["firebase"];
            firebase.initializeApp(this.config)
        }
    }


    on(path: string, callback: (data: any, error: string) => void) {
        var db = firebase.database().ref(path);
        var func = (snap, err) => {
            console.log("database content:", JSON.stringify(snap.val()));
            callback(snap.val(), err)
        };
        db.on("value", func);
        return {
            off: () => {
                db.off("value", func);
            }
        };
    }
}

