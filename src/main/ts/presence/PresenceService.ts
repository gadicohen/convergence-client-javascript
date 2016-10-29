import {Session} from "../Session";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {UserPresence} from "./UserPresence";
import {UserPresenceImpl} from "./UserPresenceImpl";
import {Observable} from "rxjs/Rx";
import {MessageType} from "../connection/protocol/MessageType";
import {RequestPresence} from "../connection/protocol/presence/requestPresence";
import {RequestPresenceResponse} from "../connection/protocol/presence/requestPresence";
import {PresenceSetState} from "../connection/protocol/presence/presenceState";
import {PresenceClearState} from "../connection/protocol/presence/presenceState";
import {SubscribePresenceRequest, SubscribePresenceResponse} from "../connection/protocol/presence/subscribePresence";
import {UnsubscribePresence} from "../connection/protocol/presence/unsubscribePresence";
import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {UserPresenceSubscription} from "./UserPresenceSubscription";
import {UserPresenceManager} from "./UserPresenceManager";
import {objectToMap} from "../util/ObjectUtils";

export class PresenceService extends ConvergenceEventEmitter<ConvergenceEvent> {

  private _connection: ConvergenceConnection;

  private _messageStream: Observable<MessageEvent>;

  private _localPresence: UserPresenceSubscription;
  private _localManager: UserPresenceManager;
  private _managers: Map<string, UserPresenceManager>;
  private _presenceStreams: Map<string, Observable<MessageEvent>>;

  constructor(connection: ConvergenceConnection, localPresence: UserPresence) {
    super();

    this._connection = connection;

    this._managers = new Map();
    this._presenceStreams = new Map();

    this._messageStream = this._connection.messages([
        MessageType.PRESENCE_AVAILABILITY_CHANGED,
        MessageType.PRESENCE_STATE_SET,
        MessageType.PRESENCE_STATE_CLEARED]);

    const username: string = this.session().username();

    const localStream =  this._streamForUsername(username);
    this._presenceStreams.set(username, localStream);

    this._localManager = new UserPresenceManager(localPresence, localStream, () => {});
    this._managers.set(username, this._localManager);

    this._localPresence = this._localManager.subscribe();
  }

  session(): Session {
    return this._connection.session();
  }

  isAvailable(): boolean {
    return this._localPresence.isAvailable();
  }

  set(state: Map<string, any>): void
  set(key: string, value: any): void
  set(): void {
    let state: Map<string, any>;
    if (arguments.length === 1) {
      state = arguments[0];
    } else if (arguments.length === 2) {
      state = new Map<string, any>();
      state.set(arguments[0], arguments[1]);
    }

    this._localManager.setState(state);

    const message: PresenceSetState = {
      type: MessageType.PRESENCE_SET_STATE,
      state: state,
      all: false
    };

    this._connection.send(message);
  }

  remove(key: string): void
  remove(keys: string[]): void
  remove(keys: string | string[]): void {
    let stateKeys = null;

    if (typeof keys === "string") {
      keys = [<string>keys];
    } else {
      stateKeys = <string[]>keys;
    }

    this._localManager.removeState(stateKeys);

    const message: PresenceClearState = {
      type: MessageType.PRESENCE_REMOVE_STATE,
      keys: stateKeys
    };

    this._connection.send(message);
  }

  clear(): void {
    this._localManager.clearState();

    const message: PresenceClearState = {
      type: MessageType.PRESENCE_CLEAR_STATE
    };

    this._connection.send(message);
  }

  state(): Map<string, any>
  state(key: string): any
  state(key?: string): any {
    return this._localPresence.state(key);
  }

  presence(username: string): Promise<UserPresence>
  presence(usernames: string[]): Promise<UserPresence[]>
  presence(usernames: string | string[]): Promise<UserPresence> | Promise<UserPresence[]> {
    if (typeof usernames === "string") {
      return this._get([usernames]).then(result => {
        return <UserPresence>result[0];
      });
    } else {
      return this._get(<string[]>usernames);
    }
  }

  subscribe(username: string): Promise<UserPresenceSubscription>
  subscribe(usernames: string[]): Promise<UserPresenceSubscription[]>
  subscribe(usernames: string | string[]): Promise<UserPresenceSubscription> | Promise<UserPresenceSubscription[]> {
    let requested: string[];
    if (typeof usernames === "string") {
      requested = [<string>usernames];
    } else {
      requested = usernames;
    }

    return this._subscribe(requested).then(() => {
      const subscriptions = requested.map(username => this._managers.get(username).subscribe());

      if (typeof usernames === "string") {
        return subscriptions[0];
      } else {
        return subscriptions;
      }
    });
  }


  /////////////////////////////////////////////////////////////////////////////
  // Private Methods
  /////////////////////////////////////////////////////////////////////////////

  private _get(usernames: string[]): Promise<UserPresence[]> {
    const message: RequestPresence = {
      type: MessageType.PRESENCE_REQUEST,
      usernames: usernames
    };

    return this._connection.request(message).then((response: RequestPresenceResponse) => {
      return response.userPresences.map(p =>
        new UserPresenceImpl(p.username, p.available, new Map(objectToMap(p.state)))
      );
    });
  }


  private _streamForUsername(username: string) {
    return this._messageStream.filter(m => m.message.username === username);
  }

  private _subscribe(usernames: string[]): Promise<void> {
    let notSubscribed = usernames.filter(username => {
      return this._presenceStreams.get(username) === undefined
    });

    if (notSubscribed.length > 0) {
      notSubscribed.forEach(username => {
        const stream = this._streamForUsername(username);
        this._presenceStreams.set(username, stream);
      });

      const message = SubscribePresenceRequest = {
        type: MessageType.PRESENCE_SUBSCRIBE_REQUEST,
        usernames: notSubscribed
      };

      return this._connection.request(message).then((response: SubscribePresenceResponse) => {
        response.userPresences.forEach(presence => {
          const manager = new UserPresenceManager(
            presence,
            this._presenceStreams.get(presence.username()),
            (username) => this._unsubscribe(username)
          );
          this._managers.set(presence.username(), manager);
        });
      });
    } else {
      return Promise.resolve();
    }
  }

  private _unsubscribe(username: string): void {
    const message: UnsubscribePresence = {
      type: MessageType.PRESENCE_UNSUBSCRIBE,
      username: username
    };

    this._connection.send(message);

    this._managers.delete(username);
    this._presenceStreams.delete(username);
  };
}
