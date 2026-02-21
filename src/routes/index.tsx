import { createFileRoute } from "@tanstack/react-router";
import logo from "../logo.svg";
import { useMutation, useQuery } from "@tanstack/react-query";
import { signInOptions, signOutOptions } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc-client";
import { signOut } from "better-auth/api";

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
      <button onClick={() => signIn.mutate()}>Sign In</button>
      <p>{JSON.stringify(user.data)}</p>
      <button onClick={() => signOut.mutate()}>Sign Out</button>
    </div>
  );
}
