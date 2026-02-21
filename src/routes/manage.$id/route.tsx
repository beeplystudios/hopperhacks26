import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/$id")({
  component: Dashboard,
});

function Dashboard() {
  return <div>Hello "/manage/$id"!</div>;
}
