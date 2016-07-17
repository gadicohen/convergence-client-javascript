import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {StringSetOperation} from "../../ops/StringSetOperation";
import {StringInsertOperation} from "../../ops/StringInsertOperation";

export var StringSetInsertOTF: OperationTransformationFunction<StringSetOperation, StringInsertOperation> =
  (s: StringSetOperation, c: StringInsertOperation) => {
    // S-SI-1
    return new OperationPair(s, c.copy({noOp: true}));
  };
