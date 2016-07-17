import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {StringInsertOperation} from "../../ops/StringInsertOperation";
import {StringSetOperation} from "../../ops/StringSetOperation";

export var StringInsertSetOTF: OperationTransformationFunction<StringInsertOperation, StringSetOperation> =
  (s: StringInsertOperation, c: StringSetOperation) => {
    // S-IS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };