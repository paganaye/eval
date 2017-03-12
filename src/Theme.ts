import { Output } from "./Output";
import { Type } from "./Types";
import { Eval } from "./Eval";

export abstract class Theme {
      constructor(public readonly evalContext: Eval) { }
      abstract initialize(output: Output): void;
      abstract printProperty(output: Output, key: string, data: any, type: Type): void;
      abstract printForm(output: Output, options: FormOptions, printContent: () => void);
      abstract printPage(output: Output, options: PageOptions, printContent: () => void);
      abstract printSection(output: Output, options: SectionOptions, printContent: () => void);
}

export interface FormOptions {
      buttons?: (FormButton | string)[];
      formAttributes?: any;
}

export interface PageOptions {
      title?: string;
      formAttributes?: any;
}

export interface SectionOptions {
      name: string;
      [key: string]: any;
}

export interface FormButton {
      text: string;
}