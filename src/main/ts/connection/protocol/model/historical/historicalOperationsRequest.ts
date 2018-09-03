import {OutgoingProtocolRequestMessage} from "../../protocol";
import {MessageBodySerializer} from "../../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../../protocol";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {ModelOperation} from "../../../../model/ot/applied/ModelOperation";
import {ModelOperationDeserializer} from "../appliedOperationData";

/**
 * @hidden
 * @internal
 */
export interface HistoricalOperationsRequest extends OutgoingProtocolRequestMessage {
  modelId: string;
  first: number;
  last: number;
}

/**
 * @hidden
 * @internal
 */
export const HistoricalOperationsRequestSerializer: MessageBodySerializer = (request: HistoricalOperationsRequest) => {
  return {
    m: request.modelId,
    f: request.first,
    l: request.last
  };
};

/**
 * @hidden
 * @internal
 */
export interface HistoricalOperationsResponse extends IncomingProtocolResponseMessage {
  operations: ModelOperation[];
}

/**
 * @hidden
 * @internal
 */
export const HistoricalOperationsResponseDeserializer: MessageBodyDeserializer<HistoricalOperationsResponse> =
  (body: any) => {
    return {
      operations: (<any[]> body.o).map((op) => {
        return ModelOperationDeserializer.deserialize(op);
      })
    };
  };
