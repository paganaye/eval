import { Command } from './Command';

export class CommandCall {

   constructor(private source: string, private command: Command<any>, private parameters: any) {
   }

   getSource() {
      return this.source;
   }

   getCommand(): Command<any> {
      return this.command;
   }

   getParameters(): any {
      return this.parameters;
   }
}
