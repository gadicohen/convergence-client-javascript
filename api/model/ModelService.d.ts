import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {Session} from "../Session";
import {RealTimeModel} from "./rt/RealTimeModel";
import {ModelQuery} from "./query/ModelQuery";
import {HistoricalModel} from "./historical/HistoricalModel";
import {ModelResult} from "../../src/main/ts/model/query/ModelResult";

export declare class ModelService extends ConvergenceEventEmitter {
  session(): Session;

  query(query: ModelQuery): Promise<ModelResult>;

  open(collectionId: string, modelId: string, initializer?: () => any): Promise<RealTimeModel>;

  create(collectionId: string, modelId: string, data: Map<string, any>): Promise<void>;

  remove(collectionId: string, modelId: string): Promise<void>;

  history(collectionId: string, modelId: string): Promise<HistoricalModel>;
}


