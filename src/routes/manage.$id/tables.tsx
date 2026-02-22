import { createFileRoute } from "@tanstack/react-router";
import Tables from "@/components/pages/Manage/Tables";

export const Route = createFileRoute("/manage/$id/tables")({
  component: Tables,
});
