import "jquery";
import { EvalConsole } from "./EvalConsole";
import { Database } from "./Database";
import { View, AnyView } from "./View";
import { Output } from "./Output";
import { Type } from "./Types";
import { Tests } from "./Tests";
import { Eval } from "./Eval";
import { RomanView } from "./views/RomanView";
import { YoutubeView } from "./views/YoutubeView";
import { Expression } from './Expression';

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

		this.evalContext.registerType("roman", { _kind: "number", view: "roman" });
		this.evalContext.registerType("youtube", { _kind: "string", view: "youtube" });
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
			this.evalConsole.processCommand(window.location.hash.substring(1));
		};

		$(window).on('hashchange', () => onHashChange());

		if (window.location.hash.length <= 1) {
			window.location.hash = "update table 1";
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

$(function () {
	app = new App();
	(window as any).app = app;
	app.run();
});
