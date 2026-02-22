import { Navbar } from "@/components/pages/navbar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_navlayout")({
  component: NavLayout,
});

function NavLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
