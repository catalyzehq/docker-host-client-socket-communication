FROM oven/bun:1.2.5-alpine

WORKDIR /app

COPY host.ts ./

CMD ["bun", "run", "host.ts"]
