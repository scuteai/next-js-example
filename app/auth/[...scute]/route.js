import { cookies, headers } from "next/headers";
import { ScuteHandler } from "@scute/nextjs-handlers";

const handler = ScuteHandler({ cookies, headers });

export { handler as GET, handler as POST };
