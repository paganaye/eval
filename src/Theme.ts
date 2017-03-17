import { Output } from "./Output";
import { Type } from "./Types";
import { Eval } from "./Eval";
import { View } from "./View";
import { ArrayView } from "./views/ArrayView";
import { ObjectView } from "./views/ObjectView";


export abstract class Theme {
      constructor(public readonly evalContext: Eval) { }
      abstract initialize(output: Output): void;
      abstract printProperty(output: Output, objectView: ObjectView, options: ContentOptions, key: string, data: any, type: Type): View<any>;
      abstract printArrayEntry(output: Output, arrayView: ArrayView, options: ArrayEntryOptions, key: number, data: any, type: Type): View<any>;
      abstract printForm(output: Output, options: FormOptions, printContent: (options: ContentOptions) => void);
      abstract printPage(output: Output, options: PageOptions, printContent: (options: ContentOptions) => void);
      abstract printSection(output: Output, options: SectionOptions, printContent: (options: ContentOptions) => void);
      abstract printDynamicSection(output: Output, options: SectionOptions): Output;
      abstract getArrayEntriesIndex(element: HTMLElement): string[];

      abstract printInput(output: Output, options: InputOptions, data: any, type: Type);
      abstract printButton(output: Output, options: ButtonOptions, text: string, action: () => void);
}

export interface ContentOptions {
      attributes?: { [key: string]: string };
      [key: string]: any;
}

export interface ArrayEntryOptions extends ContentOptions {
      deletable: boolean;
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

export interface ButtonOptions extends ContentOptions {
}

export interface FormButton {
      text: string;
}