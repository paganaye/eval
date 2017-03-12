import "jquery";
import { EvalConsole } from "./EvalConsole";
import { Database } from "./Database";
import { View } from "./View";
import { Output } from "./Output";
import { TypeDefinition, Type } from "./Types";
import { Tests } from "./Tests";
import { Eval } from "./Eval";
import { RomanView } from "./views/Roman";
import { YoutubeView } from "./views/Youtube";
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
		this.evalContext.registerView("roman", () => new RomanView(this.evalContext));
		this.evalContext.registerView("youtube", () => new YoutubeView(this.evalContext));

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
