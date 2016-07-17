import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectSetOperation} from "../../ops/ObjectSetOperation";
import {ObjectAddPropertyOperation} from "../../ops/ObjectAddPropertyOperation";
import {OperationPair} from "../OperationPair";

export var ObjectSetAddPropertyOTF: OperationTransformationFunction<ObjectSetOperation, ObjectAddPropertyOperation> =
  (s: ObjectSetOperation, c: ObjectAddPropertyOperation) => {
    // O-SA-1
    return new OperationPair(s, c.copy({noOp: true}));
  };