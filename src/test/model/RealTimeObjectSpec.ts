/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ModelOperationEvent} from "../../main/model/ModelOperationEvent";
import {RealTimeObject, RealTimeModel} from "../../main/model/rt";
import {ObjectSetOperation} from "../../main/model/ot/ops/ObjectSetOperation";
import {IDataValue, IObjectValue, IStringValue} from "../../main/model/";
import {DataValueFactory} from "../../main/model/DataValueFactory";
import {TestIdGenerator} from "./TestIdGenerator";
import {RealTimeWrapperFactory} from "../../main/model/rt/RealTimeWrapperFactory";
import {Model} from "../../main/model/internal/Model";
import {ModelEventCallbacks} from "../../main/model/internal/ModelEventCallbacks";
import {ObjectNode} from "../../main/model/internal/ObjectNode";
import {ObjectSetValueEvent} from "../../main/model/events";
import {DomainUser, DomainUserType} from "../../main/identity";
import {IdentityCache} from "../../main/identity/IdentityCache";
import {ConvergenceSession, ModelPermissions} from "../../main";

import {expect} from "chai";
import {SinonSpy, spy, createStubInstance} from "sinon";

describe("RealTimeObject", () => {

  // TODO most of this set up is common.
  const sessionId: string = "mySession";
  const username: string = "myUser";
  const user = new DomainUser(DomainUserType.NORMAL, username, "", "", "", "");
  const version: number = 1;
  const timestamp = new Date();

  let callbacks: ModelEventCallbacks;

  const gen: TestIdGenerator = new TestIdGenerator();

  const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
    return gen.id();
  });

  const model = createStubInstance(Model) as any as Model;
  const identityCache = createStubInstance(IdentityCache) as any as IdentityCache;
  const session = createStubInstance(ConvergenceSession) as any as ConvergenceSession;
  const rtModel = createStubInstance(RealTimeModel) as any as RealTimeModel;
  rtModel.emitLocalEvents = () => {
    return false;
  };
  rtModel.permissions = () => {
    return  new ModelPermissions(true, true, true, true);
  };

  const initialValue = dataValueFactory.createDataValue({num: 5}) as IObjectValue;

  const setValue: { [key: string]: IDataValue } = {
    string: dataValueFactory.createDataValue("test")
  };

  beforeEach(() => {
    callbacks = {
      sendOperationCallback: spy(),
      referenceEventCallbacks: {
        onShare: spy(),
        onUnShare: spy(),
        onSet: spy(),
        onClear: spy()
      }
    };
  });

  it("Get on missing value return UndefinedNode", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ObjectNode = new ObjectNode(initialValue, () => [], model, session, dataValueFactory);
    const myObject: RealTimeObject = wrapperFactory.wrap(delegate) as RealTimeObject;
    expect(myObject.get("nonExistent").id()).to.deep.equal(undefined);
  });

  it("Value is correct after creation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ObjectNode = new ObjectNode(initialValue, () => [], model, session, dataValueFactory);
    const myObject: RealTimeObject = wrapperFactory.wrap(delegate) as RealTimeObject;
    expect(myObject.value()).to.deep.equal({num: 5});
  });

  it("Value is correct after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ObjectNode = new ObjectNode(initialValue, () => [], model, session, dataValueFactory);
    const myObject: RealTimeObject = wrapperFactory.wrap(delegate) as RealTimeObject;
    myObject.value({string: "test"});
    expect(myObject.value()).to.deep.equal({string: "test"});
  });

  it("Value is correct after setProperty", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ObjectNode = new ObjectNode(initialValue, () => [], model, session, dataValueFactory);
    const myObject: RealTimeObject = wrapperFactory.wrap(delegate) as RealTimeObject;
    myObject.set("num", 10);
    expect(myObject.get("num").value()).to.deep.equal(10);
  });

  it("Correct operation is sent after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ObjectNode = new ObjectNode(initialValue, () => [], model, session, dataValueFactory);
    const myObject: RealTimeObject = wrapperFactory.wrap(delegate) as RealTimeObject;
    myObject.value({string: "test"});

    const expectedDataValue: { [key: string]: IDataValue } = {
      string: {id: myObject.get("string").id(), type: "string", value: "test"} as IStringValue
    };

    const opSpy  = callbacks.sendOperationCallback as SinonSpy;
    expect(opSpy.called).to.be.true;
    const expectedOp: ObjectSetOperation = new ObjectSetOperation(myObject.id(), false, expectedDataValue);
    expect(opSpy.args[0][0]).to.deep.equal(expectedOp);
  });

  it("Value is correct after ObjectSetOperation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ObjectNode = new ObjectNode(initialValue, () => [], model, session, dataValueFactory);
    const myObject: RealTimeObject = wrapperFactory.wrap(delegate) as RealTimeObject;

    const incomingOp: ObjectSetOperation = new ObjectSetOperation(initialValue.id, false, setValue);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myObject.value()).to.deep.equal({string: "test"});
  });

  it("Correct Event is fired after ObjectSetOperation", () => {
    const eventCallback: SinonSpy = spy();
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ObjectNode = new ObjectNode(initialValue, () => [], model, session, dataValueFactory);
    const myObject: RealTimeObject = wrapperFactory.wrap(delegate) as RealTimeObject;
    myObject.on(RealTimeObject.Events.VALUE, eventCallback);

    const incomingOp: ObjectSetOperation = new ObjectSetOperation(initialValue.id, false, setValue);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: ObjectSetValueEvent = {
      element: myObject,
      name: RealTimeObject.Events.VALUE,
      sessionId,
      user,
      local: false
    };
    expect(eventCallback.lastCall.args[0]).to.deep.equal(expectedEvent);
  });
});
