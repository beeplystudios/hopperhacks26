import { createFileRoute } from "@tanstack/react-router";
import logo from "../logo.svg";
import { useMutation, useQuery } from "@tanstack/react-query";
import { signInOptions, signOutOptions } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc-client";
import { signOut } from "better-auth/api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const trpc = useTRPC();
  const user = useQuery(trpc.me.queryOptions());

  const signIn = useMutation(signInOptions);
  const signOut = useMutation(signOutOptions);

  return (
    <div className="text-center">
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
    </div>
  );
}
