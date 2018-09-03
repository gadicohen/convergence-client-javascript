import {Operation} from "./ops/Operation";

/**
 * @hidden
 * @internal
 */
export class UnprocessedOperationEvent {
  constructor(
    public clientId: string,
    public seqNo: number,
    public contextVersion: number,
    public timestamp: number,
    public operation: Operation) {
    Object.freeze(this);
  }
}
