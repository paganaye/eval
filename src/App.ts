import "jquery";
import { EvalConsole } from "./EvalConsole";
import { Database } from "./Database";
import { View } from "./View";
import { Output } from "./Output";
import { TypeDefinition, Type } from "./Types";
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


	initialize() {
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
		this.evalContext.registerView("roman", (id:string) => new RomanView(this.evalContext,id));
		this.evalContext.registerView("youtube", (id:string) => new YoutubeView(this.evalContext,id));

		this.evalContext.registerType("roman", { type: "object", view: "roman" });
		this.evalContext.registerType("youtube", { type: "object", view: "youtube" });

		//this.output = new Output(this.evalContext, outputElt);
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

		$(window).on('hashchange', () => {
			this.evalConsole.processCommand(window.location.hash.substring(1));
		});

		//this.evalConsole.processCommand("update table client");
		this.evalConsole.processCommand("update client 1");
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
	app.initialize();
});
