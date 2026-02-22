import { cn } from "@/lib/cn";

export default function Reservations({
  reservations,
}: {
  reservations: any[];
}) {
  return (
    <div>
      {reservations.map((reservation) => (
        <div key={reservation.id} className="w-full flex flex-col gap-2 px-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col items-start justify-start">
              <p className="font-medium">
                {new Date(reservation.startTime).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                -{" "}
                {new Date(reservation.endTime).toLocaleString("en-US", {
                  timeStyle: "short",
                })}
              </p>
              <p className="text-sm text-zinc-500">
                {reservation.numberOfSeats} Seat
                {reservation.numberOfSeats !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center px-2 gap-2 border border-zinc-300 rounded-xl">
              <span
                className={cn(
                  "rounded-full h-2 aspect-square",
                  reservation.status === "PENDING"
                    ? "bg-yellow-500"
                    : reservation.status === "CONFIRMED"
                      ? "bg-green-500"
                      : reservation.status === "CANCELLED"
                        ? "bg-red-500"
                        : reservation.status === "UNPAID"
                          ? "bg-orange-500"
                          : "bg-gray-500",
                )}
              ></span>
              <p className="text-sm text-gray-700">
                {reservation.status.charAt(0).toUpperCase() +
                  reservation.status.slice(1).toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
