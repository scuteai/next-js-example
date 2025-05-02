import {
  ScuteTokenPayload,
  UniqueIdentifier,
  ScuteUserData,
} from "@scute/nextjs-handlers";

type ScuteMagicLinkTokenPayload = {
  uuid: UniqueIdentifier;
  user_status: ScuteUserData["status"];
  webauthnEnabled?: boolean;
};

export type ScutePayload = {
  authPayload: ScuteTokenPayload;
  magicPayload: ScuteMagicLinkTokenPayload;
};
