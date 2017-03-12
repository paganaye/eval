import { Output } from "./Output";
import { Type } from "./Types";
import { Eval } from "./Eval";


export abstract class Theme {
      constructor(public readonly evalContext: Eval) { }
      abstract initialize(output: Output): void;
      abstract printProperty(output: Output, options: ContentOptions, key: string, data: any, type: Type): void;
      abstract printForm(output: Output, options: FormOptions, printContent: (options: ContentOptions) => void);
      abstract printPage(output: Output, options: PageOptions, printContent: (options: ContentOptions) => void);
      abstract printSection(output: Output, options: SectionOptions, printContent: (options: ContentOptions) => void);
      abstract printInput(output: Output, options: InputOptions, data: any, type: Type);
}

export interface ContentOptions {
      attributes?: { [key: string]: string };
      [key: string]: any;
}

export interface FormOptions extends ContentOptions {
      buttons?: (FormButton | string)[];
}

export interface PageOptions extends ContentOptions {
      title?: string;
}

export interface SectionOptions extends ContentOptions {
      name: string;
}

export interface InputOptions extends ContentOptions {
}

export interface FormButton {
      text: string;
}