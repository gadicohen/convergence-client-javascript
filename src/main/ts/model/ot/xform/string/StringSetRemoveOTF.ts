import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {StringSetOperation} from "../../ops/StringSetOperation";
import {StringRemoveOperation} from "../../ops/StringRemoveOperation";

export var StringSetRemoveOTF: OperationTransformationFunction<StringSetOperation, StringRemoveOperation> =
  (s: StringSetOperation, c: StringRemoveOperation) => {
    // S-SR-1
    return new OperationPair(s, c.copy({noOp: true}));
  };