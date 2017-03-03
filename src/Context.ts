import { TypeDefinition, Type, BooleanDefinition, StringDefinition, NumberDefinition, ObjectDefinition } from './Types';
import { app } from './App';
import { View } from './View';
import { Command, CommandParameter } from './Command';
import { JSONView } from './views/JSONView';
import { ObjectView } from './views/Object';
import { Print } from './commands/Print';
import { Hello } from './commands/Hello';
import { Assign } from './commands/Assign';

export class Context {
   jsonView: JSONView
   objectView: JSONView

   types: { [key: string]: TypeDefinition } = {};
   commands: { [key: string]: Command<any> } = {};
   variables: { [key: string]: any } = {};

   booleanType: BooleanDefinition;
   stringType: StringDefinition;
   numberType: NumberDefinition;
   objectType: ObjectDefinition;


   constructor() {
      this.jsonView = new JSONView();
      this.objectView = new ObjectView();

      this.registerNativeType(this.booleanType = { type: "boolean", view: this.jsonView });
      this.registerNativeType(this.stringType = { type: "string", view: this.jsonView });
      this.registerNativeType(this.numberType = { type: "number", view: this.jsonView });
      this.registerNativeType(this.objectType = { type: "object", view: this.objectView });

      this.registerCommand("print", new Print());
      this.registerCommand("hello", new Hello())
      this.registerCommand("hi", new Hello())
      this.registerCommand("assign", new Assign())
   }


   registerCommand(name: string, command: Command<any>) {
      this.commands[name] = command;
   }

   registerNativeType(typeDefinition: TypeDefinition) {
      this.types[typeDefinition.type] = typeDefinition;
   }

   registerType<T>(name: string, typeDefinition: TypeDefinition) {
      this.types[name] = typeDefinition;
   }

   getParameter<T>(parameter: CommandParameter<T>): T {
      return null;
   }

   getVariable(variableName: string): any {
      var result = this.variables[variableName];
      if (result == null) {

      }
      return result;
   }

   setVariable(variableName: string, value: any): void {
      this.variables[variableName] = value;
   }

   print(model: any, type?: Type) {
      app.print(model, type);
   }
}