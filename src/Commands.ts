import { Command } from './Command';


export class Commands {
   commands: { [key: string]: Command } = {};

   constructor() {

   }

   registerCommand(name: string, command: Command) {
      this.commands[name] = command;
   }
}
