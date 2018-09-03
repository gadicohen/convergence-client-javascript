/**
 * @hidden
 * @internal
 */
export class RichTextFragment {
  private readonly _children: RichTextNode[];

  constructor(document: RichTextDocument, children: RichTextNode[]) {
    this._children = children;
  }

  public getChildren(): RichTextNode[] {
    return this._children;
  }

  public textContentLength(): number {
    let length = 0;
    this._children.forEach(c => length += c.textContentLength());
    return length;
  }
}

import {RichTextNode} from "./RichTextNode";
import {RichTextDocument} from "./RichTextDocument";
