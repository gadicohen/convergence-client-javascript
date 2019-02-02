import {ChatChannelInfo, ChatChannel} from "./ChatChannel";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {IChatEvent} from "./events/";
import {Observable} from "rxjs";
import {IdentityCache} from "../identity/IdentityCache";
import {domainUserIdToProto} from "../connection/ProtocolUtil";
import {DomainUserId} from "../identity/DomainUserId";
import {DomainUserIdentifier} from "../identity";

export class MembershipChatChannel extends ChatChannel {

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              identityCache: IdentityCache,
              messageStream: Observable<IChatEvent>,
              info: MembershipChatChannelInfo) {
    super(connection, identityCache, messageStream, info);
  }

  public info(): MembershipChatChannelInfo {
    return super.info() as MembershipChatChannelInfo;
  }

  public leave(): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      leaveChatChannelRequest: {
        channelId: this._info.channelId
      }
    }).then(() => {
      return;
    });
  }

  public remove(user: DomainUserIdentifier): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      removeUserFromChatChannelRequest: {
        channelId: this._info.channelId,
        userToRemove: domainUserIdToProto(DomainUserId.toDomainUserId(user))
      }
    }).then(() => {
      return;
    });
  }
}

export type ChatChannelMembership = "public" | "private";

export interface MembershipChatChannelInfo extends ChatChannelInfo {
  readonly channelMembership: ChatChannelMembership;
}
