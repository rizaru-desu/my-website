import { Prisma } from "@prisma/client";

export function isMissingMessageTableError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2021";
  }

  return (
    error instanceof Error &&
    /42P01|relation .*message.* does not exist|table .*message.* does not exist/i.test(
      error.message,
    )
  );
}

export function isPrismaConnectionError(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    return true;
  }

  return (
    error instanceof Error &&
    /can't reach database server|connection refused|schema engine error|connect|localhost:5432/i.test(
      error.message,
    )
  );
}
