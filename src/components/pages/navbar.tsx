import { useTRPC } from "@/lib/trpc-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Menu, MenuTrigger } from "react-aria-components";
import { ChevronDownIcon } from "../ui/icons";
import { ModalPopover } from "../ui/modal-popover";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/components/ui/menu-item";
import { signInOptions, signOutOptions } from "@/lib/auth-client";

export const Navbar: React.FC = () => {
  const trpc = useTRPC();
  const user = useQuery(trpc.me.queryOptions());

  const signIn = useMutation(signInOptions);
  const signOut = useMutation(signOutOptions);

  return (
    <nav className="w-full flex items-center px-8 pt-5 pb-8 absolute top-0 left-0 z-10">
      <h1 className="font-medium text-2xl">Restrauntzulsàveplated</h1>

      <div className="ml-auto">
        {user.data && (
          <div>
            <MenuTrigger>
              <Button>
                {user.data.name} <ChevronDownIcon />
              </Button>
              <ModalPopover
                popoverProps={{
                  placement: "bottom right",
                }}
              >
                <Menu className="focus:outline-none min-w-42">
                  <MenuItem
                    onAction={() => {
                      navigator.geolocation.getCurrentPosition(() => {});
                    }}
                  >
                    Enable Location Services
                  </MenuItem>
                  <MenuItem
                    onAction={() => {
                      signOut.mutate();
                    }}
                  >
                    Sign Out
                  </MenuItem>
                </Menu>
              </ModalPopover>
            </MenuTrigger>
          </div>
        )}
        {user.status === "success" && !user.data && (
          <Button onClick={() => signIn.mutate()}>Sign In</Button>
        )}
      </div>
    </nav>
  );
};
