import "server-only";

import { createClient } from "redis";

type AppRedisClient = ReturnType<typeof createClient>;

const globalForRedis = globalThis as unknown as {
  redisClient?: AppRedisClient;
  redisClientPromise?: Promise<AppRedisClient>;
};

function getRedisUrl() {
  return process.env.REDIS_URL?.trim() ?? "";
}

export function hasRedisConfig() {
  return Boolean(getRedisUrl());
}

async function getRedisClient() {
  const redisUrl = getRedisUrl();

  if (!redisUrl) {
    throw new Error("Redis is not configured.");
  }

  if (!globalForRedis.redisClient) {
    const client = createClient({
      url: redisUrl,
    });

    client.on("error", (error) => {
      console.error("Redis client error.", error);
    });

    globalForRedis.redisClient = client;
  }

  if (globalForRedis.redisClient.isOpen) {
    return globalForRedis.redisClient;
  }

  if (!globalForRedis.redisClientPromise) {
    globalForRedis.redisClientPromise = globalForRedis.redisClient.connect()
      .then(() => {
        if (!globalForRedis.redisClient) {
          throw new Error("Redis client is not available after connection.");
        }

        return globalForRedis.redisClient;
      })
      .catch((error) => {
        globalForRedis.redisClientPromise = undefined;
        throw error;
      });
  }

  return globalForRedis.redisClientPromise;
}

export async function incrementRedisKey(key: string) {
  const client = await getRedisClient();
  return client.incr(key);
}

export async function expireRedisKey(key: string, ttlSeconds: number) {
  const client = await getRedisClient();
  return client.expire(key, ttlSeconds);
}

export async function deleteRedisKeys(keys: string[]) {
  const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));

  if (uniqueKeys.length === 0) {
    return 0;
  }

  const client = await getRedisClient();
  return client.del(uniqueKeys);
}
