import { auth } from "@/server/auth";
import {
  createTRPCMiddleware,
  publicProcedure,
} from "@/server/trpc/trpc-config";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const extractAuth = createTRPCMiddleware(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: ctx.request.headers,
  });

  return next({
    ctx: {
      user: session?.user,
    },
  });
});

export const authedProcedure = publicProcedure
  .use(extractAuth)
  .use(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        user: ctx.user,
      },
    });
  });

export const restaurantOwnerProcedure = authedProcedure
  .input(z.object({ restaurantId: z.string() }))
  .use(async ({ ctx, next }) => {
    // FIXME: this doesnt actually do anything, this just checks if the user is an "admin" user.
    // i.e. one of us
    const ADMIN_LIST = process.env.ADMIN_USERS?.split(",") ?? [];

    if (!ADMIN_LIST.includes(ctx.user.email))
      throw new TRPCError({ code: "UNAUTHORIZED" });

    return next({
      ctx: {
        user: ctx.user,
      },
    });
  });
