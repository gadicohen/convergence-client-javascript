import {ModelReference} from "./ModelReference";
import {ReferenceFilter} from "./ReferenceFilter";

export class ReferenceMap {

  // stored by sessionId first, then key.
  private _references: {[key: string]: {[key: string]: ModelReference<any>}};

  constructor() {
    this._references = {};
  }

  public put(reference: ModelReference<any>): void {
    const sessionId: string = reference.sessionId();
    const key: string = reference.key();

    let sessionModels: {[key: string]: ModelReference<any>} = this._references[sessionId];
    if (sessionModels === undefined) {
      sessionModels = {};
      this._references[sessionId] = sessionModels;
    }

    if (sessionModels[key] !== undefined) {
      throw new Error("Model reference already exists");
    }

    sessionModels[key] = reference;
  }

  public get(sessionId: string, key: string): ModelReference<any> {
    const sessionModels: {[key: string]: ModelReference<any>} = this._references[sessionId];
    if (sessionModels !== undefined) {
      return sessionModels[key];
    } else {
      return;
    }
  }

  public getAll(filter?: ReferenceFilter): Array<ModelReference<any>> {
    if (typeof filter === "undefined") {
      filter = {};
    }

    const refs: Array<ModelReference<any>> = [];

    let sessionIds: string[];
    if (filter.sessionId !== undefined && filter.sessionId !== null) {
      sessionIds = [filter.sessionId];
    } else {
      sessionIds = Object.getOwnPropertyNames(this._references);
    }

    sessionIds.forEach((sid: string) => {
      const sessionRefs: {[key: string]: ModelReference<any>} = this._references[sid];
      const keys: string[] = filter.key !== undefined ? [filter.key] : Object.getOwnPropertyNames(sessionRefs);
      keys.forEach((k: string) => {
        const r: ModelReference<any> = sessionRefs[k];
        if (r !== undefined) {
          refs.push(r);
        }
      });
    });

    return refs;
  }

  public removeAll(): void {
    this._references = {};
  }

  public remove(sessionId: string, key: string): ModelReference<any> {
    const sessionModels: {[key: string]: ModelReference<any>} = this._references[sessionId];
    if (sessionModels !== undefined) {
      const current: ModelReference<any> = sessionModels[key];
      delete sessionModels[key];
      return current;
    } else {
      return;
    }
  }

  public removeBySession(sessionId: string): void {
    delete this._references[sessionId];
  }

  public removeByKey(key: string): void {
    const sessionIds: string[] = Object.getOwnPropertyNames(this._references);
    sessionIds.forEach((sessionId: string) => {
      delete this._references[sessionId][key];
    });
  }
}
