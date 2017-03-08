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
	evalConsole: EvalConsole;
	database: Database;
	output1: HTMLDivElement;
	reload: number;
	evalContext: Eval;


	initialize() {
		this.detectIncrementReload();
		this.initEval();
		this.initConsole();
		// 		this.tests();
		// 		this.renderOutput();
	}

	public renderOutput() {
		this.evalContext.renderOutput();
	}

	detectIncrementReload() {
		var reloadString = document.body.getAttribute("data-reload");
		this.reload = (typeof reloadString === "string") ? parseInt(reloadString) + 1 : 0;
		document.body.setAttribute("data-reload", this.reload.toString());
	}

	initEval() {
		this.evalContext = new Eval();

		this.evalContext.registerType("roman", { type: "object", view: new RomanView() });
		this.evalContext.registerType("youtube", { type: "object", view: new YoutubeView() });

		this.output1 = document.getElementById("output1") as HTMLDivElement;
		this.evalContext.registerOutput(this.output1);

		this.output1.innerHTML = "";
	}

	initConsole() {
		var consoleElt = document.getElementById("console1") as HTMLElement;
		if (consoleElt) {
			consoleElt.remove();
		}
		// console is first to display the rest of the initializations
		this.evalConsole = new EvalConsole(this.evalContext);
		consoleElt = this.evalConsole.initialize();
		consoleElt.id = "console1";
		consoleElt.style.display = "block";
		document.body.appendChild(consoleElt);


		$(document).keyup(function (e) {
			if (e.keyCode == 27) { // escape key maps to keycode `27`
				$(consoleElt).toggle();
			}
		});
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
