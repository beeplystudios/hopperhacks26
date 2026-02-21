import ManageMenus from "@/components/pages/Manage/ManageMenus";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/$id/menus")({
  component: ManageMenus,
});
