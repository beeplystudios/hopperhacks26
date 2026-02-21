import ManageDashboard from "@/components/pages/Manage/ManageDashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/$id")({
  component: ManageDashboard,
});
