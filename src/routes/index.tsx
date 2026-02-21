import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { signInOptions, signOutOptions } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc-client";
import { signOut } from "better-auth/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MenuItem, MenuTrigger, SubmenuItem } from "@/components/ui/menu-item";
import { ModalPopover } from "@/components/ui/modal-popover";
import { Key, Menu } from "react-aria-components";
import {
  Select,
  SelectBody,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useState } from "react";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectBody,
  MultiSelectItem,
} from "@/components/ui/multi-select";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const trpc = useTRPC();
  const user = useQuery(trpc.me.queryOptions());

  const signIn = useMutation(signInOptions);
  const signOut = useMutation(signOutOptions);

  const [selectedKeys, setSelectedKeys] = useState(new Set<Key>());

  return (
    <div className="text-center flex flex-col items-center">
      <Button onClick={() => signIn.mutate()}>Sign In</Button>
      <p>{JSON.stringify(user.data)}</p>
      <Button onClick={() => signOut.mutate()}>Sign Out</Button>

      <div className="space-x-2 my-4">
        <Button variant="brand">Brand</Button>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>

        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>

      <div>
        <Checkbox />
      </div>

      <div>
        <MenuTrigger>
          <Button>Menu</Button>
          <ModalPopover
            popoverProps={{
              placement: "bottom left",
            }}
          >
            <Menu className="focus:outline-none min-w-42">
              <SubmenuItem
                delay={10}
                icon={<p>T</p>}
                label="Title & Description"
              >
                <ModalPopover>Hi there!</ModalPopover>
              </SubmenuItem>
              <MenuItem>Hi there</MenuItem>
            </Menu>
          </ModalPopover>
        </MenuTrigger>
      </div>

      <div>
        <Select>
          <SelectTrigger btnProps={{ variant: "outline", isCircular: false }} />
          <SelectBody>
            <SelectItem>Item</SelectItem>
            <SelectItem>Item 2</SelectItem>
          </SelectBody>
        </Select>
      </div>

      <div>
        <MultiSelect
          selectedKeys={selectedKeys}
          setSelectedKeys={setSelectedKeys}
        >
          <Label>Collaborators</Label>
          <MultiSelectTrigger
            btnProps={{
              placeholder: "Add Collaborators...",
            }}
          >
            <MultiSelectBody>
              <MultiSelectItem value="hi">Hi</MultiSelectItem>
              <MultiSelectItem value="be">Be</MultiSelectItem>
            </MultiSelectBody>
          </MultiSelectTrigger>
        </MultiSelect>
      </div>

      <div className="space-y-2">
        <div className="items-start flex flex-col">
          <Label>Label</Label>
          <Input placeholder="Input" />
        </div>
        <Input
          placeholder="Input"
          leadingVisual={
            <p className="text-xs mb-0.5 pl-1 pr-0.5 text-zinc-500 font-medium">
              https://
            </p>
          }
        />
        <Input
          placeholder="Input"
          trailingVisual={
            <p className="text-xs mb-0.5 pl-1 pr-0.5 text-zinc-500 font-medium">
              .com
            </p>
          }
        />
      </div>
    </div>
  );
}
