import { EvalConsole } from "./EvalConsole";
import { Database } from "./Database";
import { View, AnyView } from "./View";
import { Output } from "./Output";
import { Type } from "./Types";
import { Eval } from "./Eval";
import { RomanView } from "./views/RomanView";
import { Expression } from './Expression';
import "firebase";


class App {
	//output: Output;
	evalConsole: EvalConsole;
	database: Database;
	reload: number;
	evalContext: Eval;

	run() {

		this.detectIncrementReload();
		this.initEval();
		this.initConsole();
		console.log("firebase", firebase);

		var provider = new firebase.auth.GoogleAuthProvider();

		var authContainer = document.getElementById("auth-container");
		var output = new Output(this.evalContext, authContainer);

		output.printNavbar({});
		//output.printBreadcrump({});
		output.printJumbotron({ title: "Title", description: "Description" });
		// output.printAsync("span", { class: "eval-login" }, "...", (elt, output) => {
		// 	var userOutput: Output;
		// 	var userName = "...";
		// 	var userId = null;

		// 	var updateUser = () => {
		// 		if (!userOutput) return;
		// 		userOutput.printText(userName);
		// 		userOutput.domReplace();
		// 	}
		// 	output.printAsync("span", {}, "...", (elt, output) => {
		// 		userOutput = output;
		// 		updateUser();
		// 	});


		// 	firebase.auth().onAuthStateChanged((user) => {
		// 		userName = user && user.displayName;
		// 		userId = user && user.uid;
		// 		if (userName && userId) {
		// 			console.log("doc-auth", "signed in", userName, userId);
		// 			this.evalContext.userName = userName;
		// 			this.evalContext.userId = userId;
		// 			updateUser();
		// 			if (userId) {
		// 				this.evalContext.database.on("users/" + userId + "/messages", (data, error) => {
		// 					// message here
		// 					// alert("Message added")
		// 				})
		// 			}
		// 		}
		// 	}, (err) => {
		// 		console.log("doc-auth", "onAuthStateChanged", "error", err);
		// 		// error
		// 	}, () => {
		// 		console.log("doc-auth", "onAuthStateChanged", "completed");
		// 		// completed
		// 	})

		// 	output.printButton({ buttonText: "Sign in" }, (ev) => {
		// 		try {
		// 			console.log("doc-auth", "signInWithRedirect");
		// 			firebase.auth().signInWithRedirect(provider);
		// 		} catch (error) {
		// 			console.log("doc-auth", "signInWithRedirect", "error", error);
		// 		}
		// 	});

		// 	output.printButton({ buttonText: "Sign out" }, (ev) => {
		// 		try {
		// 			console.log("doc-auth", "signOut");
		// 			firebase.auth().signOut().then(function (a) {
		// 				// Sign-out successful.
		// 				console.log("doc-auth", "signOut", "success", a);
		// 			}).catch(function (error) {
		// 				// An error happened
		// 				console.log("doc-auth", "signOut", "error", error);
		// 			})
		// 		} catch (error) {
		// 			console.log("doc-auth", "signOut", "error2", error);
		// 		}
		// 	});

		//    output.domReplace();
		// });

		output.domReplace();


	}

	detectIncrementReload() {
		var reloadString = document.body.getAttribute("data-reload");
		this.reload = (typeof reloadString === "string") ? parseInt(reloadString) + 1 : 0;
		document.body.setAttribute("data-reload", this.reload.toString());
	}

	initEval() {
		this.evalContext = new Eval();
		this.evalContext.registerView("roman", (parent: AnyView, name: string) => new RomanView(this.evalContext, parent, name));
		this.evalContext.registerType("roman", { _kind: "number", printView: "roman" });
	}

	initConsole() {
		var consoleElt = document.getElementById("console1") as HTMLElement;
		if (consoleElt) {
			consoleElt.remove();
		}
		// console is first to display the rest of the initializations

		this.evalConsole = new EvalConsole(this.evalContext);

		var outputElt = document.getElementById("output1") as HTMLDivElement;
		this.evalConsole.initialize(outputElt, false);

		var onHashChange = () => {
			var hash = window.location.hash;
			if (hash.indexOf(' ') == -1) {
				try {
					// spaces in the hash are returned as %20 in Firefox (at least)
					var hash2 = decodeURIComponent(hash);
					if (hash2.length < hash.length) hash = hash2;
				} catch (e) { }
			}
			this.evalConsole.processCommand(hash.substring(1));
		};

		$(window).on('hashchange', () => onHashChange());

		if (window.location.hash.length <= 1) {
			window.location.hash = "Welcome";
		} else {
			onHashChange();
		}
	}


}

export var app: App;
var $: any = (window as any).$;

$(function () {
	app = new App();
	(window as any).app = app;
	app.run();
});
