import { Eval } from "./Eval";

export enum TokenType {
      Number,
      String,
      Operator,
      Keyword,
      EOF
}

interface IHasValue<T> {
      getValue(evalContext: Eval): T;
      addObserver(IObserver): void;
      removeObserver(IObserver): void;
}

interface IObserver {
      valueChanged<T>(value: IHasValue<T>);
}

export interface Token {
      position: number;
      type: TokenType;
      stringValue?: string;
      numberValue?: number;
}

export class Tokenizer {
      source: string;
      position: number;
      length: number;
      curChar: string;

      constructor(source: string) {
            this.source = source;
            this.position = -1;
            this.length = this.source.length;
            this.nextChar();
      }


      public nextChar(): void {
            this.position += 1;
            this.curChar = this.position < this.length
                  ? this.source.charAt(this.position)
                  : this.curChar = null;
      }


      public skipSpaces(): void {
            while (this.curChar === " " || this.curChar === "\t") {
                  this.nextChar();
            }
      }

      private stringFrom(from: number): string {
            var result = this.source.substring(from, this.position);
            return result;
      }

      public nextToken(): Token {
            if (!this.curChar)
                  return { position: this.position, type: TokenType.EOF };
            this.skipSpaces();

            var startPos = this.position;

            if ((this.curChar >= "A" && this.curChar <= "Z")
                  || (this.curChar >= "a" && this.curChar <= "z")
                  || (this.curChar >= "\xA0" && this.curChar <= "\uFFFF")
                  || (this.curChar === "_")
                  || (this.curChar === "$")) {
                  var firstPosition = this.position;
                  do {
                        this.nextChar();
                  } while ((this.curChar >= "A" && this.curChar <= "Z")
                  || (this.curChar >= "a" && this.curChar <= "z")
                  || (this.curChar >= "\xA0" && this.curChar <= "\uFFFF")
                  || (this.curChar && this.curChar >= "0" && this.curChar <= "9")
                  || (this.curChar === "_")
                        || (this.curChar === "$"));
                  return {
                        position: startPos,
                        type: TokenType.Keyword,
                        stringValue: this.stringFrom(firstPosition)
                  };
            } else if ((this.curChar && this.curChar >= "0" && this.curChar <= "9") || this.curChar === ".") {
                  var firstPosition = this.position;
                  while (this.curChar && this.curChar >= "0" && this.curChar <= "9") this.nextChar();
                  if (this.curChar === ".") {
                        this.nextChar();
                        while (this.curChar && this.curChar >= "0" && this.curChar <= "9") this.nextChar();
                        var str = this.stringFrom(firstPosition);
                        if (str === ".") {
                              return {
                                    position: startPos,
                                    type: TokenType.Operator,
                                    stringValue: str
                              }
                        } else {
                              return {
                                    position: startPos,
                                    type: TokenType.Number,
                                    numberValue: parseFloat(str)
                              }
                        }
                  } else {
                        return {
                              type: TokenType.Number,
                              position: startPos,
                              numberValue: parseInt(this.stringFrom(firstPosition))
                        };
                  }
            } else if ((this.curChar === "+") || (this.curChar === "-")
                  || (this.curChar === "*") || (this.curChar === "/")
                  || (this.curChar === ":") || (this.curChar === ",")
                  || (this.curChar === "(") || (this.curChar === ")")
                  || (this.curChar === "[") || (this.curChar === "]")
                  || (this.curChar === "{") || (this.curChar === "}")) {
                  var op = this.curChar;
                  this.nextChar();
                  return {
                        position: startPos,
                        type: TokenType.Operator,
                        stringValue: op
                  };
            } else if ((this.curChar === "<") || (this.curChar === ">")) {
                  var op = this.curChar;
                  this.nextChar();
                  if (this.curChar as string === "=") {
                        op += "=";
                        this.nextChar();
                  }
                  return {
                        position: startPos,
                        type: TokenType.Operator,
                        stringValue: op
                  };
            } else if (this.curChar === "!") {
                  var op = this.curChar;
                  this.nextChar();
                  if (this.curChar as string === "=") {
                        op += "=";
                        this.nextChar();
                  }
                  return {
                        position: startPos,
                        type: TokenType.Operator,
                        stringValue: op
                  };
            } else if (this.curChar === "=") {
                  var op = this.curChar;
                  this.nextChar();
                  if (this.curChar as string === "=") {
                        op += "=";
                        this.nextChar();
                  }
                  return {
                        position: startPos,
                        type: TokenType.Operator,
                        stringValue: op
                  };
            } else if (this.curChar === "&" || this.curChar === "|") {
                  var op = this.curChar;
                  this.nextChar();
                  if (this.curChar as string == op) {
                        op += op;
                        this.nextChar();
                  }
                  return {
                        position: startPos,
                        type: TokenType.Operator,
                        stringValue: op
                  };
            } else if (this.curChar === '"' || this.curChar === "'") {
                  var firstPosition = this.position;
                  var firstQuote = this.curChar;
                  this.nextChar();
                  while (this.curChar) {
                        if (this.curChar == firstQuote) {
                              var result = {
                                    position: startPos,
                                    type: TokenType.String,
                                    stringValue: this.stringFrom(firstPosition + 1)
                              };
                              this.nextChar();
                              return result;
                        } else if (this.curChar as string === "\\") {
                              this.nextChar();
                              if (this.curChar) this.nextChar();
                        } else {
                              this.nextChar();
                        }
                  }
                  this.unexpectedCharacter("End of quote for quote starting at position " + firstPosition + " was not found.");
            } else {
                  this.unexpectedCharacter();
            }
      }

      unexpectedCharacter(expected?: string) {
            throw "Unexpected character " + this.curChar
                  + " at position " + this.position + "."
                  + expected ? (" " + expected) : "";
      }
}

