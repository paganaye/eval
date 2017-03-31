import { Parser } from "./Parser";
import { Eval } from "./Eval";
import { app } from "./App";
import { Output } from "./Output";

export class EvalConsole {
  parser: Parser;
  outputElement: HTMLElement;

  constructor(private evalContext: Eval) {
    this.parser = new Parser(this.evalContext);
  }

  public initialize(outputElement: HTMLElement, visible: boolean): void {
    this.outputElement = outputElement;
  }

  public processCommand(commandString: string) {
    try {
      var res = this.parser.parseCommand(commandString)
      var output = new Output(this.evalContext, this.outputElement)
      this.evalContext.theme.printPage(output, { title: commandString }, () => res.run(output));
      output.render();
    } catch (error) {
      console.error(error);
    }
  }
}