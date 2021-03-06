import { View } from "../View";
import { Output } from "../Output";
import { Type, NumberType } from "../Types";
import { PrintArgs } from "../Theme";
import { Eval } from "../Eval";

export class RomanView extends View<number, NumberType, PrintArgs> {
	result: string;
	data: any;

	build(): void {
		var data = this.data;
		var num = typeof data === "number" ? data : parseInt(<any>data, 10);
		if (+num) {
			var digits = String(+num).split(""), key = [
				"", "C-", "C-C-", "C-C-C-", "C-D-", "D-", "D-C-", "D-C-C-", "D-C-C-C-", "C-M-",
				"", "X-", "X-X-", "X-X-X-", "X-L-", "L-", "L-X-", "L-X-X-", "L-X-X-X-", "X-C-",
				"", "M", "MM", "MMM", "MV", "V-", "V-M", "V-MM", "V-MMM", "MX-",
				"", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
				"", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
				"", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
			var roman = "";
			var i = 60;
			while ((i -= 10) >= 0)
				roman = (key[+digits.pop() + i] || "") + roman;
			this.result = (Array(+digits.join("") + 1).join("M-") + roman)
				.replace(/-/g, String.fromCharCode(773));

		}
	}

	onRender(output: Output): void {
		output.printText(this.result);
	}

	getValue(): any {
		return this.data;
	}
}
View.registerViewFactory("roman", () => new RomanView());
