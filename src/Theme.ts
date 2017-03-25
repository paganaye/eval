import { Output } from "./Output";
import { EnumEntry, Type } from "./Types";
import { Eval } from "./Eval";
import { View, LightView } from "./View";
import { ArrayView } from "./views/ArrayView";
import { ObjectView } from "./views/ObjectView";
import { MapView } from "./views/MapView";


export abstract class Theme {
      constructor(public readonly evalContext: Eval) { }
      abstract initialize(output: Output): void;

      abstract printForm(output: Output, attributes: FormAttributes, printContent: (attributes: ElementAttributes) => void);
      abstract printPage(output: Output, attributes: PageAttributes, printContent: (attributes: ElementAttributes) => void);
      abstract printSection(output: Output, attributes: SectionAttributes, printContent: (attributes: ElementAttributes) => void);
      abstract printProperty(output: Output, attributes: PropertyAttributes,
            printKey: string | ((output: Output, attributes: PropertyAttributes) => void), view: LightView);

      abstract printSectionAsync(output: Output, attributes: SectionAttributes): Output;
      abstract printArrayEntry(output: Output, arrayView: ArrayView<any>,
            attributes: ArrayAttributes, key: number, data: any, type: Type): View<any, Type, ElementAttributes>;
      abstract getArrayEntriesIndex(element: HTMLElement): string[];

      abstract printInput(output: Output, attributes: InputAttributes, data: any, type: Type);
      abstract printSelect(output: Output, attributes: SelectAttributes, data: string, type: Type, onChanged?: (string) => void);
      abstract printButton(output: Output, attributes: ButtonAttributes, text: string, action: () => void);
      abstract printButtonGroup(output: Output, attributes: ButtonGroupAttributes, text: string, action: (string) => void);
}

export type CssAttributes = { [key: string]: string };

export class ElementAttributes {
      id?: string;
      cssAttributes?: CssAttributes;
}

export class PropertyAttributes extends ElementAttributes {
      labelCssAttributes?: CssAttributes;
}

export class ArrayAttributes extends ElementAttributes {
      deletable?: boolean;
      frozenDynamic?: boolean;
}

export class MapAttributes extends ElementAttributes {
      deletable?: boolean;
      frozenDynamic?: boolean;
}

export class FormAttributes extends ElementAttributes {
      buttons?: (FormButton | string)[];
}

export class PageAttributes extends ElementAttributes {
      title?: string;
}

export class SectionAttributes extends ElementAttributes {
      name: string;
}

export class InputAttributes extends ElementAttributes {
}

export class SelectAttributes extends ElementAttributes {
      entries: EnumEntry[];
}

export class DynamicObjectAttributes extends ElementAttributes {
      freezeType: boolean;
      entries: EnumEntry[];
}

export class ButtonAttributes extends ElementAttributes {
}

export class ButtonGroupAttributes extends ElementAttributes {
      entries: EnumEntry[];
}

export class FormButton {
      text: string;
}