FROM oven/bun:1.2.5-alpine

WORKDIR /app

COPY client.ts ./

CMD ["bun", "run", "client.ts"]
