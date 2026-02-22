import { Navbar } from "@/components/pages/navbar";
import {
  HomeIcon,
  MenuTabIcon,
  SettingsIcon,
  TablesIcon,
} from "@/components/ui/icons";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/$id")({
  component: ManageLayout,
});

function ManageLayout() {
  const { id } = Route.useParams();
  return (
    <>
      <Navbar />
      <div className="flex gap-12 h-screen pt-20 pb-8 w-full pl-8 pr-8">
        <div className="flex flex-col gap-3 items-center">
          <ManageTab to="/manage/$id" id={id} Icon={HomeIcon}>
            Today
          </ManageTab>
          <ManageTab to="/manage/$id/menus" id={id} Icon={MenuTabIcon}>
            Menus
          </ManageTab>
          <ManageTab to="/manage/$id/tables" id={id} Icon={TablesIcon}>
            Tables
          </ManageTab>
          <ManageTab to="/manage/$id/settings" id={id} Icon={SettingsIcon}>
            Settings
          </ManageTab>
        </div>
        <div className="border-l border-black/30 h-full"></div>
        <div className="h-full overflow-auto w-full">
          <Outlet />
        </div>
      </div>
    </>
  );
}

const ManageTab: React.FC<
  React.PropsWithChildren<{
    id: string;
    to: string;
    Icon: React.FC;
  }>
> = ({ id, to, Icon, children }) => {
  return (
    <Link
      to={to}
      params={{ id }}
      activeOptions={{
        exact: true,
      }}
      className="text-gray-800 py-2 transition-colors w-full text-left"
      activeProps={{
        className: "font-bold pointer-events-none",
      }}
    >
      <span className="flex items-center gap-2">
        <Icon />
        {children}
      </span>
      <span className="flex items-center gap-2 h-0 opacity-0 font-bold pointer-events-none">
        <Icon />
        {children}
      </span>
    </Link>
  );
};
