import {Session} from "../Session";
import {ActivityEvent} from "./events";
import {Observable} from "rxjs/Rx";
import {ActivityParticipant} from "./ActivityParticipant";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";

export declare interface ActivityEvents {
  SESSION_JOINED: string;
  SESSION_LEFT: string;
  STATE_SET: string;
  STATE_REMOVED: string;
  STATE_CLEARED: string;
}

export declare class Activity extends ConvergenceEventEmitter<ActivityEvent> {

  public static readonly Events: ActivityEvents;

  public session(): Session;

  public id(): string;

  public leave(): void;
  public isJoined(): boolean;

  public setState(state: {[key: string]: any}): void;
  public setState(key: string, value: any): void;

  public removeState(key: string): void;
  public removeState(keys: string[]): void;

  public clearState(): void;

  // TODO
  // replaceState(state: Map<string, any>);

  public state(key: string): any;
  public state(): {[key: string]: any};

  public participant(sessionId: string): ActivityParticipant;
  public participants(): ActivityParticipant[];

  public participantsAsObservable(): Observable<ActivityParticipant[]>;
}
