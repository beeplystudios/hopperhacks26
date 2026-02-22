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
          className="bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-full p-2 transition-colors"
          activeProps={{
            className: "bg-lime-700 !text-gray-200 pointer-events-none",
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
          className="bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-full p-2 transition-colors"
          activeProps={{
            className: "bg-lime-700 !text-gray-200 pointer-events-none",
          }}
        >
          Menus
        </Link>
        <Link
          to="/manage/$id/tables"
          params={{ id }}
          activeOptions={{
            exact: true,
          }}
          className="bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-full p-2 transition-colors"
          activeProps={{
            className: "bg-lime-700 !text-gray-200 pointer-events-none",
          }}
        >
          Tables
        </Link>
        <Link
          to="/manage/$id/settings"
          params={{ id }}
          activeOptions={{
            exact: true,
          }}
          className="bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-full p-2 transition-colors"
          activeProps={{
            className: "bg-lime-700 !text-gray-200 pointer-events-none",
          }}
        >
          Settings
        </Link>
      </div>
      <div className="h-full inset-shadow-sm overflow-auto rounded-md bg-gray-200 p-3">
        <Outlet />
      </div>
    </div>
  );
}
