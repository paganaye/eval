import { TypeDefinition, Type, BooleanDefinition, StringDefinition, NumberDefinition, ObjectDefinition } from "./Types";
import { View } from "./View";
import { Command } from "./Command";
import { JSONView } from "./views/JSONView";
import { ObjectView } from "./views/Object";
import { Print } from "./commands/Print";
import { Hello } from "./commands/Hello";
import { Assign } from "./commands/Assign";
import { EvalFunction } from "./EvalFunction";
import { AbsFunction, RoundFunction, RandomFunction } from './functions/Math';
import { NowFunction } from './functions/Time';
import { Alert } from "./commands/Alert";
import { Expression } from './Expression';
import { Output } from './Output';
import { InputView } from './views/Input';
import { Input } from './commands/Input';

export class Eval {
   jsonView: JSONView;
   inputView: InputView;
   objectView: ObjectView;

   types: { [key: string]: TypeDefinition } = {};
   commands: { [key: string]: (Eval) => Command } = {};
   functions: { [key: string]: (Eval) => EvalFunction<any> } = {};
   variables: { [key: string]: any } = {};

   booleanType: BooleanDefinition;
   stringType: StringDefinition;
   numberType: NumberDefinition;
   objectType: ObjectDefinition;
   output: Output;
   outputElt: HTMLElement;

   constructor() {
      this.output = new Output(this);

      this.jsonView = new JSONView();
      this.objectView = new ObjectView();
      this.inputView = new InputView();

      this.registerNativeType(this.booleanType = { type: "boolean", view: this.jsonView });
      this.registerNativeType(this.stringType = { type: "string", view: this.jsonView });
      this.registerNativeType(this.numberType = { type: "number", view: this.jsonView });
      this.registerNativeType(this.objectType = { type: "object", view: this.objectView });

      this.registerCommand("print", () => new Print());
      this.registerCommand("hello", () => new Hello());
      this.registerCommand("hi", () => new Hello());
      this.registerCommand("assign", () => new Assign());
      this.registerCommand("alert", () => new Alert());
      this.registerCommand("input", () => new Input());

      this.registerFunctions("abs", () => new AbsFunction());
      this.registerFunctions("round", () => new RoundFunction());
      this.registerFunctions("random", () => new RandomFunction());
      this.registerFunctions("now", () => new NowFunction());

   }

   renderOutput() {
      if (this.outputElt) {
         var html = this.output.toString();
         this.outputElt.innerHTML = html;
         this.output.clear();
      }
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

   registerOutput(output: HTMLElement) {
      this.outputElt = output;
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

   stringify(expr: Expression<any>, type?: Type): string {
      return JSON.stringify(expr);
   }

}