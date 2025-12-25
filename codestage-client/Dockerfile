FROM oven/bun:1 AS build

WORKDIR /app
COPY package.json .
COPY bun.lock .
RUN bun install

FROM oven/bun:1

WORKDIR /app
COPY --from=build /app/node_modules node_modules
COPY . .

ARG VITE_PUBLIC_SERVER_URL
ENV VITE_PUBLIC_SERVER_URL=${VITE_PUBLIC_SERVER_URL}

RUN bun run build
RUN bun install -g serve

EXPOSE 3001
CMD ["serve", "-s", "dist" ,"-p", "3001"]