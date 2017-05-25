import { Output } from "./Output";
import { SelectEntry, Type, Visibility } from "./Types";
import { Eval } from "./Eval";
import { View, AnyView } from "./View";
import { ArrayView } from "./views/ArrayView";
import { ObjectView } from "./views/ObjectView";
import { Notification } from "./commands/Notification"

export abstract class Theme {

	abstract createOutput(elt?: HTMLElement, parentOutput?: Output): Output;

	constructor(public readonly evalContext: Eval) { }
	abstract initialize(output: Output): void;
	abstract getArrayEntriesIndex(element: HTMLElement): string[];
	abstract refreshView(view: AnyView, refreshOptions: RefreshOptions): void;

}

export interface RefreshOptions {
	valueChanged?: boolean;
	validationStatusChanged?: boolean;
	validationTextChanged?: boolean;
	descriptionChanged?: boolean;
}

export type ElementAttributes = { [key: string]: string };

export class PrintArgs {
	addHeaderCallback?: (key: string, label: string) => void;
}

export class PropertyPrintArgs extends PrintArgs {
	printLabel?: ((output: Output, printArgs: PrintArgs) => void);
	label?: string;
	visibility: Visibility;
}

export class ArrayPrintArgs extends PrintArgs {
	deletable?: boolean;
	frozenDynamic?: boolean;
}

export class ArrayEntryPrintArgs extends PrintArgs {
	id: string;
	label: string;
	deletable: boolean;
	frozenDynamic: boolean;
	entriesElementId: string;
	active: boolean;
}

export class PagePrintArgs extends PrintArgs {
	title?: string;
}

export class GroupOptions extends PrintArgs {
	title?: string;
}

export class SectionPrintArgs extends PrintArgs {
	name: string;
	title?: string;
	orphans?: boolean;
	active?: boolean;
}

export class BreadcrumpPrintArgs extends PrintArgs {

}

export class JumbotronPrintArgs extends PrintArgs {
	title: string;
	description: string;
}

export class NavbarPrintArgs extends PrintArgs {

}

export class InputPrintArgs extends PrintArgs {
	id: string;
	//inputType: string;
}

export class SelectPrintArgs extends PrintArgs {
	entries: SelectEntry[];
	id: string;
}

export class CategoryPrintArgs extends PrintArgs {
	path: string;
	id: string;
	categoryName: string;
}

export class VariantPrintArgs extends PrintArgs {
	freezeType: boolean;
	entries: SelectEntry[];
	id: string;
}

export class ButtonPrintArgs extends PrintArgs {
	id?: string;
	buttonText: string;
	class?: string;
}

export class ButtonGroupPrintArgs extends PrintArgs {
	buttonText: string;
	entries: SelectEntry[];
}

export class NotificationPrintArgs extends PrintArgs {

}

export class FormButton {
	text: string;
}