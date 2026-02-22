import { useTRPC } from "@/lib/trpc-client";
import { useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { hex2oklch, oklch2hex } from "colorizr";

const safeOklch2hex = (color: string) => {
  try {
    return oklch2hex(color.split(" ").map(Number) as [number, number, number]);
  } catch (err) {
    return "#000000";
  }
};

const convertHexToOklch = (hex: string) => {
  const oklch = hex2oklch(hex);
  return `${oklch.l} ${oklch.c} ${oklch.h}`;
};

export default function Settings() {
  const params = useParams({ from: "/manage/$id/settings" });
  const trpc = useTRPC();

  const restaurantQuery = useSuspenseQuery(
    trpc.restaurant.getById.queryOptions({ restaurantId: params.id }),
  );

  const patch = useMutation(trpc.restaurant.patchById.mutationOptions());

  const [form, setForm] = useState({
    name: "",
    address: "",
    description: "",
    color: "",
    bannerImageUrl: "",
    logoImageUrl: "",
    openTime: "",
    closeTime: "",
  });

  useEffect(() => {
    if (!restaurantQuery.data) return;
    const r = restaurantQuery.data;
    setForm({
      name: r.name ?? "",
      address: r.address ?? "",
      description: r.description ?? "",
      color: r.color ?? "",
      bannerImageUrl: r.bannerImage ?? "",
      logoImageUrl: r.logoImage ?? "",
      openTime: r.openTime ?? "",
      closeTime: r.closeTime ?? "",
    });
  }, [restaurantQuery.data]);

  const handleBlur = async () => {
    try {
      await patch.mutateAsync({
        restaurantId: params.id,
        name: form.name,
        description: form.description,
        address: form.address,
        color: form.color,
        bannerImageUrl: form.bannerImageUrl,
        logoImageUrl: form.logoImageUrl,
        openTime: form.openTime,
        closeTime: form.closeTime,
      });
      await restaurantQuery.refetch();
    } catch (err) {
      console.error("Failed to patch restaurant", err);
    }
  };

  return (
    <div className="col-span-2 flex flex-col items-center justify-start gap-6 rounded-xl p-4 border-zinc-300/50 border-[0.0125rem]">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <Label>
          <p className="text-sm">Name</p>
          <Input
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            onBlur={handleBlur}
            className="w-full"
          />
        </Label>

        <Label>
          <p className="text-sm">Address</p>
          <textarea
            value={form.address}
            onChange={(e) =>
              setForm((s) => ({ ...s, address: e.target.value }))
            }
            onBlur={handleBlur}
            rows={3}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </Label>

        <Label className="col-span-1 md:col-span-2">
          <p className="text-sm">Description</p>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((s) => ({ ...s, description: e.target.value }))
            }
            onBlur={handleBlur}
            rows={4}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </Label>

        <Label>
          <p className="text-sm">Color</p>
          <div className="flex items-center gap-2">
            <input
              aria-label="restaurant color"
              type="color"
              value={safeOklch2hex(form.color)}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  color: convertHexToOklch(e.target.value),
                }))
              }
              onBlur={handleBlur}
              className="w-10 h-10 border-gray-300"
            />
            <Input
              value={safeOklch2hex(form.color)}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  color: convertHexToOklch(e.target.value),
                }))
              }
              onBlur={handleBlur}
              className="w-28"
            />
          </div>
        </Label>

        <Label>
          <p className="text-sm">Banner Image URL</p>
          <Input
            value={form.bannerImageUrl}
            onChange={(e) =>
              setForm((s) => ({ ...s, bannerImageUrl: e.target.value }))
            }
            onBlur={handleBlur}
            className="w-full"
          />
        </Label>

        <Label>
          <p className="text-sm">Logo Image URL</p>
          <Input
            value={form.logoImageUrl}
            onChange={(e) =>
              setForm((s) => ({ ...s, logoImageUrl: e.target.value }))
            }
            onBlur={handleBlur}
            className="w-full"
          />
        </Label>

        <Label>
          <p className="text-sm">Open Time</p>
          <Input
            type="time"
            value={form.openTime}
            onChange={(e) =>
              setForm((s) => ({ ...s, openTime: e.target.value }))
            }
            onBlur={handleBlur}
            className="w-full"
          />
        </Label>

        <Label>
          <p className="text-sm">Close Time</p>
          <Input
            type="time"
            value={form.closeTime}
            onChange={(e) =>
              setForm((s) => ({ ...s, closeTime: e.target.value }))
            }
            onBlur={handleBlur}
            className="w-full"
          />
        </Label>
      </div>
    </div>
  );
}
