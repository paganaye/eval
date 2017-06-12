import { Output } from "./Output";
import { SelectEntry, Type, Visibility } from "./Types";
import { Eval } from "./Eval";
import { View, AnyView } from "./View";
import { ArrayView } from "./views/ArrayView";
import { ObjectView } from "./views/ObjectView";
import { Notification } from "./commands/Notification"

export class Theme {
	constructor(public readonly evalContext: Eval) { }

	createOutput(elt?: HTMLElement, parentOutput?: Output): Output {
		var result = new Output(this.evalContext, elt, parentOutput);
		return result;
	}

	initialize(output: Output): void {

	}

	getArrayEntriesIndex(element: HTMLElement): string[] {
		var children = element.children;
		var result = [];
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			result.push(child.id);
		}
		return result;
	}

	refreshView(view: AnyView, refreshOptions: RefreshOptions): void {
		if (refreshOptions.validationTextChanged) {
			var elt = document.getElementById(view.getId() + "-validation");
			elt.innerText = view.getValidationText();
		}
		if (refreshOptions.validationStatusChanged) {
		}
		if (refreshOptions.valueChanged) {
			var input = document.getElementById(view.getId()) as HTMLInputElement;
			input.value = view.getValue();
		}
		if (refreshOptions.descriptionChanged) {
			var elt = document.getElementById(view.getId() + "-description");
			elt.innerText = view.getValidationText();
		}
	}

}

export interface RefreshOptions {
	valueChanged?: boolean;
	validationStatusChanged?: boolean;
	validationTextChanged?: boolean;
	descriptionChanged?: boolean;
}

export type ElementAttributes = { [key: string]: string };

export class PrintArgs {
}

export class ModalPrintArgs {
	id: string;
	title: string;
	buttons: string[]
}


export class TabPagePrintArgs {
	id: string;
	title: string;
	active: boolean;
	modal: boolean;
}

export class PropertyPrintArgs extends PrintArgs {
	label?: string;
	visibility: Visibility;
	description: string;
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

export class TablePrintArgs extends PrintArgs {
	deletable?: boolean;
	frozenDynamic?: boolean;
}

export class TableRowPrintArgs extends PrintArgs {
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
	viewAsLink?: boolean;
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

