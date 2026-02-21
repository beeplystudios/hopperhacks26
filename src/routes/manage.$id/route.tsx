import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/$id")({
  component: ManageLayout,
});

function ManageLayout() {
  const { id } = Route.useParams();
  return (
    <div className="grid grid-rows-[2rem_1fr] h-screen overflow-none p-3 gap-3">
      <div className="flex gap-3 items-center">
        <Link
          to="/manage/$id"
          params={{ id }}
          activeOptions={{
            exact: true,
          }}
          className="bg-lime-100 text-lime-800 rounded-sm p-1 transition-colors"
          activeProps={{
            className: "bg-lime-600 !text-lime-100 pointer-events-none",
          }}
        >
          Home
        </Link>
        <Link
          to="/manage/$id/menus"
          params={{ id }}
          activeOptions={{
            exact: true,
          }}
          className="bg-lime-100 text-lime-800 rounded-sm p-1 transition-colors"
          activeProps={{
            className: "bg-lime-600 !text-lime-100 pointer-events-none",
          }}
        >
          Menus
        </Link>
        <Link
          to="/manage/$id/settings"
          params={{ id }}
          activeOptions={{
            exact: true,
          }}
          className="bg-lime-100 text-lime-800 rounded-sm p-1 transition-colors"
          activeProps={{
            className: "bg-lime-600 !text-lime-100 pointer-events-none",
          }}
        >
          Settings
        </Link>
      </div>
      <div className="h-full inset-shadow-sm overflow-auto rounded-md bg-lime-100 p-2">
        <Outlet />
      </div>
    </div>
  );
}
