import {RichTextContent} from "./RichTextContent";

export abstract class RichTextNode implements RichTextContent {
  private _parent: RichTextElement;
  private _document: RichTextDocument;
  private _attributes: Map<string, any>;

  constructor(document: RichTextDocument, parent: RichTextElement, attributes?: Map<string, any>) {
    this._parent = parent;
    this._document = document;
    this._attributes = attributes || new Map<string, any>();
  }

  public parent(): RichTextElement {
    return this._parent;
  }

  public _setParent(parent: RichTextElement): void {
    this._parent = parent;
  }

  public index(): number {
    if (this._parent !== null) {
      const pos = this._parent.getChildIndex(this);
      return pos;
    } else {
      // fixme should this be an exception?
      return -1;
    }
  }

  public removeFromParent(): void {
    if (this._parent !== null) {
      this._parent.removeChild(this.index());
      this._setParent(null);
    }
  }

  public path(): RichTextPath {
    if (!this._parent) {
      return null;
    }

    const path = this._parent.path();
    if (path === null) {
      // We don't have a parent chain that goes all the way up to a
      // root element, therefore we have no path.
      return null;
    }

    const index = this.index();
    if (index < 0) {
      // We don't actually exist in our parent element.
      // todo this should be an error.
      return null;
    }

    path.push(index);

    return path;
  }

  public root(): RichTextRootElement {
    if (!Validation.isSet(this._parent)) {
      return null;
    } else {
      return this._parent.root();
    }
  }

  public document(): RichTextDocument {
    return this._document;
  }

  public attributes(): Map<string, any> {
    return new Map(this._attributes.entries());
  }

  public setAttribute(key: string, value: any): void {
    this._attributes.set(key, value);
  }

  public hasAttribute(key: string): boolean {
    return this._attributes.get(key) !== undefined;
  }

  public getAttribute(key: string): any {
    return this._attributes.get(key);
  }

  public removeAttribute(key: string): void {
    this._attributes.delete(key);
  }

  public abstract textContentLength(): number;

  public abstract type(): RichTextContentType;

  public abstract isA(type: RichTextContentType): boolean;
}

// Note: These import have to be down here for the circular dependency to work.
import {RichTextElement} from "./RichTextElement";
import {RichTextRootElement} from "./RichTextRootElement";
import {RichTextDocument} from "./RichTextDocument";
import {RichTextLocation, RichTextPath} from "./RichTextLocation";
import {RichTextContentType, RichTextContentTypes} from "./RichTextContentType";
import {Validation} from "../../../util/Validation";
