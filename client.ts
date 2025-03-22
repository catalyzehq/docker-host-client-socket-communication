import {join} from "node:path";

const SOCKET = join(Bun.env.SOCKETS_DIR, 'catalyst.sock');

Bun.serve({
  unix: SOCKET,
  async fetch(req) {
    console.log(await req.json());
    return Response.json({ hello: 'world' });
  },
});
