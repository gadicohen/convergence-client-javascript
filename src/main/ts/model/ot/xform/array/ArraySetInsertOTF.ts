import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArraySetOperation} from "../../ops/ArraySetOperation";
import {ArrayInsertOperation} from "../../ops/ArrayInsertOperation";

/**
 * @hidden
 * @internal
 */
export const ArraySetInsertOTF: OperationTransformationFunction<ArraySetOperation, ArrayInsertOperation> =
  (s: ArraySetOperation, c: ArrayInsertOperation) => {
    // A-SI-1
    return new OperationPair(s, c.copy({noOp: true}));
  };
