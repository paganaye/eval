import { TypeDefinition, Type, BooleanDefinition, StringDefinition, NumberDefinition, ObjectDefinition } from './Types';
import { View } from "./View";
import { Command } from "./Command";
import { JSONView } from "./views/JSONView";
import { ObjectView } from './views/Object';
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
import { Load } from './commands/Load';
import { Database } from './Database';
import { Crud } from './commands/Crud';

export class Eval {
      jsonView: JSONView;
      inputView: InputView;
      objectView: ObjectView;
      defaultViews: { [key: string]: View<any> } = {};
      defaultInputViews: { [key: string]: View<any> } = {};
      idCounter: number = 0;

      types: { [key: string]: TypeDefinition } = {};
      views: { [key: string]: View<any> } = {};
      commands: { [key: string]: (Eval) => Command } = {};
      functions: { [key: string]: (Eval) => EvalFunction<any> } = {};
      variables: { [key: string]: any } = {};
      afterClearList: (() => void)[] = []


      booleanType: BooleanDefinition;
      stringType: StringDefinition;
      numberType: NumberDefinition;
      objectType: ObjectDefinition;
      //output: Output;
      outputElt: HTMLElement;
      database: Database;

      constructor() {
            //this.output = new Output(this);

            this.jsonView = new JSONView();
            this.objectView = new ObjectView();
            this.inputView = new InputView();
            this.defaultViews = {
                  object: this.objectView
            }

            this.registerView("json", () => new JSONView());
            this.registerView("object", () => new ObjectView());
            this.registerView("input", () => new InputView());

            this.registerNativeType(this.booleanType = { type: "boolean", view: "json" });
            this.registerNativeType(this.stringType = { type: "string", view: "json" });
            this.registerNativeType(this.numberType = { type: "number", view: "json" });
            this.registerNativeType(this.objectType = { type: "object", view: "object" });

            this.registerCommand("print", () => new Print(this));
            this.registerCommand("hello", () => new Hello(this));
            this.registerCommand("hi", () => new Hello(this));
            this.registerCommand("assign", () => new Assign(this));
            this.registerCommand("alert", () => new Alert(this));
            this.registerCommand("input", () => new Input(this));
            this.registerCommand("create", () => new Crud(this, "create"));
            this.registerCommand("read", () => new Crud(this, "read"));
            this.registerCommand("update", () => new Crud(this, "update"));
            this.registerCommand("delete", () => new Crud(this, "delete"));

            this.registerFunctions("abs", (parent) => new AbsFunction(parent));
            this.registerFunctions("round", (parent) => new RoundFunction(parent));
            this.registerFunctions("random", (parent) => new RandomFunction(parent));
            this.registerFunctions("now", (parent) => new NowFunction(parent));

            this.database = new Database(this);

      }

      nextId(): string {
            return "elt" + this.idCounter++;
      }


      raise(actions: (() => void)[]): void {
            if (!actions) return;
            for (var action of actions) {
                  try {
                        action();
                  } catch (e) {
                        console.log(e);
                  }
            }
            actions.length = 0;
      }

      registerCommand(name: string, getNew: () => Command) {
            this.commands[name] = getNew;
      }

      registerView(name: string, getNew: () => View<any>) {
            this.views[name] = getNew();
      }

      registerFunctions(name: string, getNew: (parent: Expression<any>) => EvalFunction<any>) {
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

      stringify(expr: Expression<any>, type?: Type): string {
            return JSON.stringify(expr);
      }

      afterClear(action: () => void): void {
            this.afterClearList.push(action);
      }

      getTypeDef(data: any, type: Type): TypeDefinition {
            if (typeof type == "string") type = this.types[type];
            if (!type) type = this.types[typeof data] || this.objectType;
            return type;
      }


      getView(type: TypeDefinition): View<any> {
            var view: View<any> = this.views[type.view]
                  || this.defaultViews[type.type] || this.jsonView;
            return view;
      }

      getType(typeName: string, callback: (type: Type) => void): void {
            typeName = (typeName || "object").toLowerCase();
            this.database.on("types/" + typeName, (data, error) => {
                  var type = data as Type;
                  if (!type) {
                        switch (typeName) {
                              case "client":
                                    type = {
                                          type: "object",
                                          properties: {
                                                firstName: { type: "string" },
                                                lastName: { type: "string" },
                                                address: { type: "string", rows: 4 }
                                          }
                                    };
                                    break;
                              default:
                                    type = {
                                          type: "object",
                                          properties: {
                                                id: { type: "string" }
                                          }
                                    };
                                    break;
                        }
                  }
                  callback(type);
            });
      }
}