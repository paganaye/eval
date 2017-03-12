import { Parser } from "./Parser";
import { Tests } from "./Tests";
import { Eval } from "./Eval";
import { app } from "./App";
import { Output } from "./Output";

export class EvalConsole {
  parser: Parser;
  terminal: any;

  constructor(private evalContext: Eval, private readonly parentElement: HTMLElement) {
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

  public initialize(): HTMLElement {
    var elt = document.createElement("div");
    this.terminal = ($(elt) as any).terminal(
      (cmd) => this.processCommand(cmd),
      {
        greetings: "Eval v1.0",
        name: "evalContext",
        prompt: "ε ",
        height: "95px"
      });
    this.parser = new Parser(this.evalContext);
    return elt;

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
      var output = new Output(this.evalContext, this.parentElement)
      this.evalContext.theme.printSection(output, { type: "page" }, () => res.run(output));
      output.render();
    } catch (error) {
      this.error(error);
    }
  }
}