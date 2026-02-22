import { publicProcedure, router } from "../trpc-config";
import { db } from "@/server/db";
import { reservation, restaurant, table } from "@/server/db/schema";
import { z } from "zod";
import { and, asc, eq, gt, gte, lt } from "drizzle-orm";
import { authedProcedure } from "../middleware/auth-middleware";

const timeStringToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
const minutesToTimeString = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:00`;
};

export const reservationRouter = router({
  createPending: authedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        tableId: z.string(),
        startTime: z.date(),
        endTime: z.date(),
        numberOfSeats: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const newReservation = await db.insert(reservation).values({
        restaurantId: input.restaurantId,
        tableId: input.tableId,
        startTime: input.startTime,
        endTime: input.endTime,
        numberOfSeats: input.numberOfSeats,
        status: "PENDING",
        userId: ctx.user.id,
      });
      return newReservation;
    }),
  getAvailableTimes: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        date: z.date(),
        partySize: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const tables = await db
        .select()
        .from(table)
        .where(
          and(
            eq(table.restaurantId, input.restaurantId),
            gte(table.maxSeats, input.partySize),
          ),
        )
        .orderBy(asc(table.maxSeats));

      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(input.date);
      endOfDay.setHours(23, 59, 59, 999);
      const existingReservations = await db
        .select()
        .from(reservation)
        .where(
          and(
            eq(reservation.restaurantId, input.restaurantId),
            eq(reservation.status, "CONFIRMED"),
            gt(reservation.startTime, startOfDay),
            lt(reservation.startTime, endOfDay),
          ),
        );

      const restaurantTimes = (
        await db
          .select({
            openTime: restaurant.openTime,
            closeTime: restaurant.closeTime,
          })
          .from(restaurant)
          .where(eq(restaurant.id, input.restaurantId))
          .limit(1)
      )[0];
      const startMinutes = timeStringToMinutes(restaurantTimes.openTime);
      const closeMinutes = timeStringToMinutes(restaurantTimes.closeTime);

      const timesToTable: Record<
        string,
        { time: string; maxSeats: number; available: boolean }
      > = {};

      for (const table of tables) {
        let time = startMinutes;
        while (time < closeMinutes) {
          const isReserved = existingReservations.some(
            (res) =>
              res.tableId === table.id &&
              res.startTime.getUTCHours() * 60 +
                res.startTime.getUTCMinutes() ===
                time,
          );
          if (
            !(time in timesToTable) ||
            (!timesToTable[time].available && !isReserved)
          ) {
            timesToTable[time] = {
              time: minutesToTimeString(time),
              maxSeats: table.maxSeats,
              available: !isReserved,
            };
          }

          time += table.maxReservationLength;
        }
      }

      return Object.values(timesToTable);
    }),
});
