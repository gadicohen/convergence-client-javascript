import {EventEmitter} from "../../../../../util/";
import {RichTextDocument, RichTextRootElement, RichTextRange, RichTextLocation} from "../../model/";
import {QuillDeltaConverter} from "./QuillDeltaConverter";
import {QuillDelta} from "./QuillDelta";

/**
 * @hidden
 * @internal
 */
export class RealTimeQuillDocument extends EventEmitter {
  public static Events = {
    DELTA: "delta"
  };

  private readonly _doc: RichTextDocument;
  private readonly _root: RichTextRootElement;

  constructor(document: RichTextDocument) {
    super();
    this._doc = document;
    this._root = QuillDeltaConverter.getRoot(document);
  }

  public getValue(): QuillDelta {
    return QuillDeltaConverter.docToDelta(this._doc);
  }

  public setValue(delta: QuillDelta): void {
    const root: RichTextRootElement = QuillDeltaConverter.deltaToRoot(delta, this._doc);
    this._doc.replaceRoot(root);
  }

  public updateContents(delta: QuillDelta) {
    const deltaOps = delta.ops as any[];
    let cursor = 0;
    deltaOps.forEach((deltaOp) => {
      if (typeof deltaOp.retain === "number") {
        const endIndex = cursor + deltaOp.retain;
        const range: RichTextRange = new RichTextRange(
          RichTextLocation.ofTextOffset(this._root, cursor),
          RichTextLocation.ofTextOffset(this._root, endIndex)
        );
        if (deltaOp.attributes !== undefined) {
          Object.keys(deltaOp.attributes).forEach((key) => {
            const value = deltaOp.attributes[key];
            if (value !== null) {
              this._doc.setAttribute(range, key, value);
              console.log(`SetAttribute: ${range}, ${JSON.stringify(deltaOp.attributes)}`);
            } else {
              console.log(`RemoveAttribute: ${range}, ${JSON.stringify(deltaOp.attributes)}`);
              this._doc.removeAttribute(range, key);
            }
          });
        }
        cursor += deltaOp.retain;
      } else if (typeof deltaOp.delete === "number") {
        const endIndex = cursor + deltaOp.delete;
        const range: RichTextRange = new RichTextRange(
          RichTextLocation.ofTextOffset(this._root, cursor),
          RichTextLocation.ofTextOffset(this._root, endIndex)
        );
        this._doc.removeRange(range);
        console.log(`Delete(${range})`);
        cursor += deltaOp.delete;
      } else if (deltaOp.insert !== undefined) {
        const node = QuillDeltaConverter.convertInsertOp(deltaOp, this._root);
        const location = RichTextLocation.ofTextOffset(this._root, cursor);
        console.log(`Insert(${location}, ${node})`);
        this._doc.insert(location, node);
        cursor += deltaOp.insert.length;
      }
    });
  }
}
