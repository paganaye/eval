import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Output } from "../Output";
import 'jasmine';


class Player {
	nbPlay = 0;
	resume: any;
	play(song) {
		this.nbPlay++;
	}
}

class TestReporter implements jasmine.CustomReporter {
	private output: Output;
	private level: number = 1;

	setOutput(output: Output): void {
		this.output = output;
	}

	jasmineStarted?(suiteInfo: jasmine.SuiteInfo): void {
		//suiteInfo contains a property that tells how many specs have been defined
		this.output.printTag("p", {}, suiteInfo.totalSpecsDefined + " specs");
		this.level = 1;
	}

	//suiteStarted
	//suiteStarted is invoked when a describe starts to run
	suiteStarted?(result: jasmine.CustomReporterResult): void {
		//the result contains some meta data about the suite itself.		
		this.output.printTag("h" + this.level, {}, result.description);
	}

	passed = '✓';
	failed = '✗';

	statusText = {
		"passed": this.passed,
		"failed": this.failed
	}

	//specStarted
	//specStarted is invoked when an it starts to run (including associated beforeEach functions)
	specStarted?(result: jasmine.CustomReporterResult): void {
		// the result contains some meta data about the spec itself.
		this.level += 1;
		//var mark = this.statusText[result.status] || "-";
		//this.output.printTag("h5", {}, mark + " " + result.description);
	}
	//specDone
	//specDone is invoked when an it and its associated beforeEach and afterEach functions have been run.
	//While jasmine doesn't require any specific functions, not defining a specDone will make it impossible for a reporter to know when a spec has failed.

	specDone?(result: jasmine.CustomReporterResult): void {
		//The result here is the same object as in specStarted but with the addition of a status and lists of failed and passed expectations.
		var mark = this.statusText[result.status] || "-";
		this.output.printTag("h5", {}, mark + " " + result.description);
		//this.output.printTag("p", {}, "specDone:" + JSON.stringify(result));
		// for (var i = 0; i < result.passedExpectations.length; i++) {
		// 	this.output.printTag("p", {}, "passed:" + JSON.stringify(result.passedExpectations[i]));
		// }
		// for (var i = 0; i < result.failedExpectations.length; i++) {
		// 	this.output.printTag("p", {}, "failed:" + JSON.stringify(result.failedExpectations[i]));
		// }
	}

	//suiteDone
	//suiteDone is invoked when all of the child specs and suites for a given suite have been run
	//While jasmine doesn't require any specific functions, not defining a suiteDone will make it impossible for a reporter to know when a suite has failures in an afterAll.
	suiteDone?(result: jasmine.CustomReporterResult): void {
		this.level -= 1;
	}

	//jasmineDone
	//When the entire suite has finished execution jasmineDone is called
	jasmineDone?(runDetails: jasmine.RunDetails): void {
	}

};


export class Tests extends Command {

	extend(destination, source) {
		for (var property in source) destination[property] = source[property];
		return destination;
	}

	output: Output;
	jasmineEnvironment: jasmine.Env;
	testReporter: TestReporter;

	run(output: Output) {

		output.printAsync("div", {}, "...8", (output) => {
			var win = window as any;
			if (!win.jasmine) {
				var jasmineRequire: any = win.jasmineRequire;
				win.jasmine = jasmineRequire.core(jasmineRequire);
				this.jasmineEnvironment = jasmine.getEnv();
				var jasmineInterface = jasmineRequire.interface(jasmine, this.jasmineEnvironment);
				this.extend(window, jasmineInterface);

				this.jasmineEnvironment.specFilter = function (spec) {
					return true;
				};
				this.testReporter = new TestReporter();
				jasmine.getEnv().addReporter(this.testReporter);

				describe("Main Story", () => {
					var player: Player;

					beforeEach(() => {
						player = new Player();
					});

					it("should be able to play a Song", () => {
						player.play("song");
						expect(player.nbPlay).toEqual(1);
					});

					//demonstrates use of expected exceptions
					describe("Sub story", () => {
						it("should throw an exception if song is already playing", () => {
							player.play("song2");

							expect(() => {
								player.resume();
							}).toThrowError("player.resume is not a function");
						});

						it("should play otherwise", () => {
							player.play("song2");
							expect(player.nbPlay).toEqual(1);
						});

						it("should fail", () => {
							expect(true).toEqual(false);
						})
					});

				});
			}
			this.testReporter.setOutput(output);
			this.jasmineEnvironment.execute();
			output.domReplace();
		})
		//this.runTestSuite(this.evalContext);

	}
}
Command.registerCommand("tests",{
	getNew: () => new Tests(),
	description: new CommandDescription()
			.addParameter("data", "Expression")
});
