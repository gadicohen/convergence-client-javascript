import {IndexRange} from "../../../reference/RangeReference";
import {IndexTransformer} from "./IndexTransformer";

export class RangeTransformer {
  static handleInsert(ranges: IndexRange[], insertIndex: number, length: number): IndexRange[] {
    return ranges.map(range => {
      const indices: number[] = RangeTransformer._rangeToTuple(range);
      const xFormed: number[] = IndexTransformer.handleInsert(indices, insertIndex, length);
      return RangeTransformer._tupleToRange(xFormed);
    });
  }

  static handleReorder(ranges: IndexRange[], fromIndex: number, toIndex: number): IndexRange[] {
    return ranges.map(range => {
      const indices: number[] = RangeTransformer._rangeToTuple(range);
      const xFormed: number[] = IndexTransformer.handleReorder(indices, fromIndex, toIndex);
      return RangeTransformer._tupleToRange(xFormed);
    });
  }

  static handleRemove(ranges: IndexRange[], removeIndex: number, length: number): IndexRange[] {
    return ranges.map(range => {
      const indices: number[] = RangeTransformer._rangeToTuple(range);
      const xFormed: number[] = IndexTransformer.handleRemove(indices, removeIndex, length);
      return RangeTransformer._tupleToRange(xFormed);
    });
  }

  private static _rangeToTuple(range: IndexRange): number[] {
    return [range.start, range.end];
  }

  private static _tupleToRange(tuple: number[]): IndexRange {
    return {start: tuple[0], end: tuple[1]};
  }
}