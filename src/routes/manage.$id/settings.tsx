import Settings from "@/components/pages/Manage/Settings";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/$id/settings")({
  component: Settings,
});
