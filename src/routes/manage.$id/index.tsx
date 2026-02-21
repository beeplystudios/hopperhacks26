import { createFileRoute } from "@tanstack/react-router";
import ManageDashboard from "@/components/pages/Manage/Dashboard";

export const Route = createFileRoute("/manage/$id/")({
  component: ManageDashboard,
});
