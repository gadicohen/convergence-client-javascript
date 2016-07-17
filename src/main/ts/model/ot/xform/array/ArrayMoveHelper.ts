import {ArrayMoveOperation} from "../../ops/ArrayMoveOperation";
import {RangeRelationshipUtil} from "../../util/RangeRelationshipUtil";
import {RangeRangeRelationship} from "../../util/RangeRelationshipUtil";
import {RangeIndexRelationship} from "../../util/RangeRelationshipUtil";

export class ArrayMoveHelper {

  /**
   * Determines if a move op is in the forward direction. For this to be true the from
   * index must be strictly less than the to index.
   *
   * @param op
   *            The op to evaluate
   * @return true if fromIndex < toIndex, false otherwise.
   */
  static isForwardMove(op: ArrayMoveOperation): boolean {
    return op.fromIndex < op.toIndex;
  }

  /**
   * Determines if a move op is in the backward direction. For this to be true the from
   * index must be strictly greater than the to index.
   *
   * @param op
   *            The op to evaluate
   * @return true if fromIndex > toIndex, false otherwise.
   */
  static isBackwardMoveMove(op: ArrayMoveOperation): boolean {
    return op.fromIndex > op.toIndex;
  }

  /**
   * Determines if a move op is an empty range. This means that the from and to indices are
   * equal.
   *
   * @param op
   *            The op to evaluate
   * @return true if fromIndex == toIndex, false otherwise.
   */
  static isIdentityMove(op: ArrayMoveOperation): boolean {
    return op.fromIndex === op.toIndex;
  }

  /**
   * Determines the direction of the move.
   *
   * @param op The operation to evaluate.
   *
   * @return The direction of the move.
   */
  static getMoveDirection(op: ArrayMoveOperation): MoveDirection {
    if (this.isForwardMove(op)) {
      return MoveDirection.Forward;
    } else if (this.isBackwardMoveMove(op)) {
      return MoveDirection.Backward;
    } else {
      return MoveDirection.Identity;
    }
  }

  /**
   * Determines if an index is entirely before a range.
   *
   * @param op
   *            The op that represents the range.
   * @param index
   *            The index to evaluate
   * @return True if index < min(fromIndex, toIndex), false otherwise.
   */
  static indexBeforeRange(op: ArrayMoveOperation, index: number): boolean {
    return index < this.getRangeMin(op);
  }

  /**
   * Determines if an index is entirely after a range.
   *
   * @param op
   *            The op that represents the range.
   * @param index
   *            The index to evaluate
   * @return True if index > max(fromIndex, toIndex), false otherwise.
   */
  static indexAfterRange(op: ArrayMoveOperation, index: number): boolean {
    return index > this.getRangeMax(op);
  }

  /**
   *
   * Determines if an index is within a range.
   *
   * @param op
   *            The op that represents the range.
   * @param index
   *            The index to evaluate
   * @return True if index < max(fromIndex, toIndex) && index > min(fromIndex, toIndex), false
   *         otherwise.
   */
  static indexWithinRange(op: ArrayMoveOperation, index: number): boolean {
    return index > this.getRangeMin(op) && index < this.getRangeMax(op);
  }

  static getRangeIndexRelationship(op: ArrayMoveOperation, index: number): RangeIndexRelationship {
    return RangeRelationshipUtil.getRangeIndexRelationship(this.getRangeMin(op), this.getRangeMax(op), index);
  }

  /**
   * Gets the range relationship of two array move operations.  The evaluation
   * will be in the form of op1 <verb> op2. For example if op1 <precedes> op2
   * the Precedes will be returned.
   *
   * @param op1 The first array move operation
   * @param op2 The second array move operation
   *
   * @return The interval that matched op1 <verb> op2
   */
  static getRangeRelationship(op1: ArrayMoveOperation, op2: ArrayMoveOperation): RangeRangeRelationship {
    return RangeRelationshipUtil.getRangeRangeRelationship(
      this.getRangeMin(op1), this.getRangeMax(op1), this.getRangeMin(op2), this.getRangeMax(op2));
  }

  /**
   * Returns the lesser of the fromIndex and the toIndex of the ArrayMoveOperation
   *
   * @param op
   *            The op to get the minimum index for
   * @return min(fromIndex, toIndex)
   */
  static getRangeMin(op: ArrayMoveOperation): number {
    return Math.min(op.fromIndex, op.toIndex);
  }

  /**
   * Returns the greater of the fromIndex and the toIndex of the ArrayMoveOperation
   *
   * @param op
   *            The op to get the minimum index for
   * @return max(fromIndex, toIndex)
   */
  static getRangeMax(op: ArrayMoveOperation): number {
    return Math.max(op.fromIndex, op.toIndex);
  }
}

export enum MoveDirection {
  Forward, Backward, Identity
}
