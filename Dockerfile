# Build frontend dist.
FROM node:20-alpine AS frontend
WORKDIR /frontend-build

COPY . .

WORKDIR /frontend-build/web

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate && pnpm i --frozen-lockfile

RUN pnpm build

# Build backend exec file.
FROM golang:1.22-alpine AS backend
WORKDIR /backend-build

COPY . .

RUN CGO_ENABLED=0 go build -o memos ./bin/memos/main.go

# Make workspace with above generated files.
FROM alpine:latest AS monolithic
WORKDIR /usr/local/memos

LABEL org.opencontainers.image.title="MindMemo" \
  org.opencontainers.image.description="A private, self-hosted home for capturing and revisiting your thoughts." \
  org.opencontainers.image.source="https://github.com/baduyifei/mindmemo" \
  org.opencontainers.image.version="0.1.0" \
  org.opencontainers.image.licenses="MIT"

RUN apk add --no-cache tzdata
ENV TZ="UTC"

COPY --from=frontend /frontend-build/web/dist /usr/local/memos/dist
COPY --from=backend /backend-build/memos /usr/local/memos/

EXPOSE 5230

# Directory to store the data, which can be referenced as the mounting point.
RUN mkdir -p /var/opt/memos
VOLUME /var/opt/memos

ENV MEMOS_MODE="prod"
ENV MEMOS_PORT="5230"

ENTRYPOINT ["./memos"]
