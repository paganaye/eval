import { Parser } from './Parser';
import { Tests } from './Tests';
import { Context } from './Context';
import { CommandParameter } from './Command';
import { app } from './App';

export class EvalConsole {
   parser: Parser;
   originalConsole: Console;
   terminal: any;

   constructor(private context: Context) { }

   echo(msg: string): void {
      if (typeof msg !== "string") msg = JSON.stringify(msg);
      this.terminal.echo(msg);
   }
   error(msg: string): void {
      if (typeof msg !== "string") {
         if (msg instanceof Error) {
            msg = (msg as Error).name + " " + (msg as Error).message;
            this.originalConsole.error(msg)
            return;
         }
         msg = JSON.stringify(msg);
      }
      this.terminal.error(msg);
   }

   public initialize(): HTMLElement {
      var elt = document.createElement('div');
      this.terminal = ($(elt) as any).terminal(
         (cmd) => this.processCommand(cmd),
         {
            greetings: 'Eval v1.0',
            name: 'eval',
            prompt: '$ ',
            height: '180px'
         });
      this.parser = new Parser(this.context);
      this.originalConsole = (window as any).console;
      (window as any).console = this;
      return elt;

   }

   log(): void {
      for (var arg in arguments) {
         this.echo(arg + "> " + arguments[arg]);
      }
      this.originalConsole.log(arguments);
   }

   public processCommand(commandString: string) {
      try {
         var res = this.parser.parseCommand(commandString)
         res.run(this.context);
      } catch (error) {
         this.error(error);
      }
      app.renderOutput();      
   }
}