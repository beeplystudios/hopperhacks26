import Restaurant from "@/components/pages/Restaurants/Restaurant";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/restaurants/$id")({
  component: Restaurant,
});
