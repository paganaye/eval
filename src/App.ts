import { EvalConsole } from "./EvalConsole";
import { Database } from "./Database";
import { View, AnyView } from "./View";
import { Output } from "./Output";
import { Type } from "./Types";
import { Eval } from "./Eval";
import { RomanView } from "./views/RomanView";
import { YoutubeView } from "./views/YoutubeView";
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
		// 		this.tests();
		// 		this.renderOutput();
		console.log("firebase", firebase);


		var provider = new firebase.auth.GoogleAuthProvider();
		/*
		firebase.auth().signInWithPopup(googleProvider).then(function (result) {
			// This gives you a Google Access Token. You can use it to access the Google API.
			var token = result.credential.accessToken;
			// The signed-in user info.
			var user = result.user;
			// ...
		}).catch(function (error: any) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			// The email of the user's account used.
			var email = error.email;
			// The firebase.auth.AuthCredential type that was used.
			var credential = error.credential;
			// ...
		});
		*/

		//    <div id="auth-container"></div>
		var authContainer = document.getElementById("auth-container");
		var output = new Output(this.evalContext, authContainer);

		output.printAsync("div", {}, "...", (elt, output) => {
			var userOutput: Output;
			var userName = "...";
			var userId = null;

			var updateUser = () => {
				if (!userOutput) return;
				userOutput.printTag("span", {}, userName);
				userOutput.domReplace();
			}
			output.printAsync("div", {}, "...", (elt, output) => {
				userOutput = output;
				updateUser();
			});


			var f1 = firebase.auth().onAuthStateChanged((user) => {
				userName = user && user.displayName;
				userId = user && user.uid;
				if (userName && userId) {
					console.log("doc-auth", "signed in", userName, userId);
					this.evalContext.userName = userName;
					this.evalContext.userId = userId;
					updateUser();
					if (userId) {
						this.evalContext.database.on("users/" + userId + "/messages", (data, error) => {
							// message here
							// alert("Message added")
						})
					}
				}
			}, (err) => {
				console.log("doc-auth", "onAuthStateChanged", "error", err);
				// error
			}, () => {
				console.log("doc-auth", "onAuthStateChanged", "completed");
				// completed
			})


			firebase.auth().getRedirectResult().then(function (result) {
				// if (result.credential) {
				// 	// This gives you a Google Access Token. You can use it to access the Google API.
				// 	var token = result.credential.accessToken;
				// 	console.log("doc-auth", "redirectResult", result, "token:", token);
				// }
			}).catch(function (error: any) {
				console.log("doc-auth", "redirectResult", "error", error);
			});

			output.printButton({ buttonText: "Sign in" }, (ev) => {
				try {
					console.log("doc-auth", "signInWithRedirect");
					firebase.auth().signInWithRedirect(provider);
				} catch (error) {
					console.log("doc-auth", "signInWithRedirect", "error", error);
				}
			});

			output.printButton({ buttonText: "Sign out" }, (ev) => {
				try {
					console.log("doc-auth", "signOut");
					firebase.auth().signOut().then(function (a) {
						// Sign-out successful.
						console.log("doc-auth", "signOut", "success", a);
					}).catch(function (error) {
						// An error happened
						console.log("doc-auth", "signOut", "error", error);
					})
				} catch (error) {
					console.log("doc-auth", "signOut", "error2", error);
				}
			});

			output.printButton({ buttonText: "f1" }, (ev) => {
				try {
					console.log("doc-auth", "onAuthStateChanged", "f1");
					f1();
				} catch (error) {
					console.log("doc-auth", "onAuthStateChanged", "f1Error", error);
				}
			});

			output.domReplace();
		});

		output.domReplace();

		// 		  // We need to register an Observer on Firebase Auth to make sure auth is initialized.
		//   var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
		//     unsubscribe();
		//     // Check if we are already signed-in Firebase with the correct user.
		//     if (!isUserEqual(googleUser, firebaseUser)) {
		//       // Build Firebase credential with the Google ID token.
		//       var credential = firebase.auth.GoogleAuthProvider.credential(
		//           googleUser.getAuthResponse().id_token);
		//       // Sign in with credential from the Google user.
		//       firebase.auth().signInWithCredential(credential).catch(function(error) {
		//         // Handle Errors here.
		//         var errorCode = error.code;
		//         var errorMessage = error.message;
		//         // The email of the user's account used.
		//         var email = error.email;
		//         // The firebase.auth.AuthCredential type that was used.
		//         var credential = error.credential;
		//         // ...
		//       });
		//     } else {
		//       console.log('User already signed-in Firebase.');
		//     }

	}

	// public renderOutput() {
	// 	this.evalContext.renderOutput();
	// }

	detectIncrementReload() {
		var reloadString = document.body.getAttribute("data-reload");
		this.reload = (typeof reloadString === "string") ? parseInt(reloadString) + 1 : 0;
		document.body.setAttribute("data-reload", this.reload.toString());
	}

	initEval() {
		this.evalContext = new Eval();
		this.evalContext.registerView("roman", (parent: AnyView) => new RomanView(this.evalContext, parent));
		this.evalContext.registerView("youtube", (parent: AnyView) => new YoutubeView(this.evalContext, parent));

		this.evalContext.registerType("roman", { _kind: "number", printView: "roman" });
		this.evalContext.registerType("youtube", { _kind: "string", printView: "youtube" });
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
			window.location.hash = "update dog one";
		} else {
			onHashChange();
		}

		//this.evalConsole.processCommand("update table client");
		//this.evalConsole.processCommand("update client 1");
	}

	// 	tests() {
	// 		var tests = new Tests(this.evalConsole);

	// 		//this.testOutput();
	// 		//this.database.test();
	// 		try {
	// 			tests.selfTests();
	// 		} catch (e) {
	// 			this.evalConsole.error(e.toString());
	// 		}

	// 	}

	// 	testOutput() {
	// 		// this.output.print({
	// 		// 	x: "ABC",
	// 		// 	y2: { video: "YBJFirHSS5Q", width: 100, height: 100, type: "youtube" },
	// 		// 	y: "7Iweue-OcMo", z: 1111
	// 		// },
	// 		// 	{ type: "object", properties: { y: "youtube", z: "roman" } });
	// 	}

}

export var app: App;
var $: any = (window as any).$;

$(function () {
	app = new App();
	(window as any).app = app;
	app.run();
});
