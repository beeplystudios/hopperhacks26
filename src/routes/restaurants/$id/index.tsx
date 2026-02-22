import Restaurants from "@/components/pages/Restaurants";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/restaurants/$id/")({
  component: Restaurants,
});
