import { Parser } from "./Parser";
import { Tests } from "./Tests";
import { Eval } from "./Eval";
import { app } from "./App";
import { Output } from "./Output";

export class EvalConsole {
  parser: Parser;
  terminal: any;
  outputElement: HTMLElement;

  constructor(private evalContext: Eval) {
    this.parser = new Parser(this.evalContext);
  }

  echo(msg: string): void {
    if (typeof msg !== "string") msg = JSON.stringify(msg);
    this.terminal.echo(msg);
  }

  error(msg: string): void {
    if (typeof msg !== "string") {
      if (msg instanceof Error) {
        msg = (msg as Error).message;
      }
      else msg = JSON.stringify(msg);
    }
    this.terminal.error(msg);
  }

  public initialize(outputElement: HTMLElement, visible: boolean): void {
    this.outputElement = outputElement;

    var elt = document.createElement("div");
    elt.id = "console1";
    document.body.appendChild(elt);

    this.terminal = ($(elt) as any).terminal(
      (cmd) => this.processCommand(cmd),
      {
        greetings: "Eval v1.0",
        name: "evalContext",
        prompt: "ε ",
        height: "95px"
      });

    // the terminal do not like to be rendered in a hidden HTMLElement
    // so we hide it after
    elt.style.display = "none";

    $(document).keyup(function (e) {
      if (e.keyCode == 27) { // escape key maps to keycode `27`
        $(elt).toggle();
      }
    });

  }

  log(): void {
    var result = ">";
    for (var arg in arguments) {
      result += " " + arguments[arg]
    }
    this.echo(result);
  }

  public processCommand(commandString: string) {
    try {
      var res = this.parser.parseCommand(commandString)
      var output = new Output(this.evalContext, this.outputElement)
      this.evalContext.theme.printPage(output, { title: commandString }, () => res.run(output));
      output.render();
    } catch (error) {
      this.error(error);
    }
  }
}