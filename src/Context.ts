import { TypeDefinition, Type, BooleanDefinition, StringDefinition, NumberDefinition, ObjectDefinition } from "./Types";
import { app } from "./App";
import { View } from "./View";
import { Command } from "./Command";
import { JSONView } from "./views/JSONView";
import { ObjectView } from "./views/Object";
import { Print } from "./commands/Print";
import { Hello } from "./commands/Hello";
import { Assign } from "./commands/Assign";
import { EvalFunction } from "./EvalFunction";
//import { AbsFunction, RoundFunction, RandomFunction } from './functions/Math';
import { AbsFunction } from './functions/Math';
//import { NowFunction } from "./functions/Time";
import { Alert } from "./commands/Alert";
import { Expression } from './Expression';

export class Context {
   jsonView: JSONView
   objectView: JSONView

   types: { [key: string]: TypeDefinition } = {};
   commands: { [key: string]: (Context) => Command } = {};
   functions: { [key: string]: (Context) => EvalFunction<any> } = {};
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

      this.registerCommand("print", () => new Print());
      this.registerCommand("hello", () => new Hello());
      this.registerCommand("hi", () => new Hello());
      this.registerCommand("assign", () => new Assign());
      this.registerCommand("alert", () => new Alert());

      this.registerFunctions("abs", () => new AbsFunction());
      // this.registerFunctions("round", () => new RoundFunction());
      // this.registerFunctions("random", () => new RandomFunction());
      // this.registerFunctions("now", () => new NowFunction());
   }


   registerCommand(name: string, getNew: () => Command) {
      this.commands[name] = getNew;
   }

   registerFunctions(name: string, getNew: () => EvalFunction<any>) {
      this.functions[name] = getNew;
   }

   registerNativeType(typeDefinition: TypeDefinition) {
      this.types[typeDefinition.type] = typeDefinition;
   }

   registerType<T>(name: string, typeDefinition: TypeDefinition) {
      this.types[name] = typeDefinition;
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

   print(expr: Expression<any>, type?: Type) {
      app.printE(expr, type);
   }

   stringify(expr: Expression<any>, type?: Type): string {
      return app.stringify(expr, type);
   }
}