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
import { DialogTrigger, Key, Menu } from "react-aria-components";
import {
  Select,
  SelectBody,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectBody,
  MultiSelectItem,
} from "@/components/ui/multi-select";
import {
  Modal,
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalHeading,
} from "@/components/ui/modal";
import RestaurantCard from "@/components/pages/Restaurants/RestaurantCard";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const trpc = useTRPC();
  const restrauntQuery = useQuery(trpc.restaurant.getAll.queryOptions());

  return (
    <div className="text-center flex flex-col items-center w-full py-8">
      <h2 className="text-6xl font-bold text-left w-full px-8">Welcome!</h2>
      <div className="flex items-center w-full px-6 overflow-scroll gap-4 py-6">
        {restrauntQuery.data?.map((r) => (
          <RestaurantCard
            key={r.id}
            title={r.name}
            description={r.description ?? ""}
            logo={r.logoImage}
            id={r.id}
          />
        ))}
      </div>
    </div>
  );
}
