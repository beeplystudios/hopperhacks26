import z from "zod/v4";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc-client";
import { useParams } from "@tanstack/react-router";

const TablesFormSchema = z.object({
  tables: z
    .object({
      name: z.string(),
      maxSeats: z.number(),
      maxReservationLength: z.number(), // in minutes
    })
    .array(),
});

const Number = z.coerce.number();

export default function Tables() {
  const params = useParams({ from: "/manage/$id/tables" });
  const trpc = useTRPC();
  const tablesQuery = useSuspenseQuery(
    trpc.table.getByRestaurant.queryOptions({ restaurantId: params.id }),
  );
  const createTables = useMutation(trpc.table.bulkUpdate.mutationOptions());
  const tableForm = useForm({
    defaultValues: {
      tables: tablesQuery.data.map((t) => ({
        name: t.name,
        maxSeats: t.maxSeats,
        maxReservationLength: t.maxReservationLength,
      })),
    },
    validators: {
      onChange: TablesFormSchema,
    },
    async onSubmit({ value, formApi }) {
      await createTables.mutateAsync({
        restaurantId: params.id,
        tables: value.tables,
      });
      await tablesQuery.refetch();
      // FIXME: this is a hack to reset the form's dirty state after tablesQuery is refetched to
      // prevent a flicker
      setTimeout(() => {
        formApi.reset();
      });
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Tables</h1>
      <h3 className="text-lg">Configure available tables</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          tableForm.handleSubmit();
        }}
      >
        <tableForm.Field name="tables" mode="array">
          {(field) => {
            return (
              <div className="space-y-2">
                <div className="flex flex-col gap-2">
                  {field.state.value.map((_, i) => (
                    <div
                      key={i + "-table"}
                      className="w-full flex items-center gap-1"
                    >
                      <tableForm.Field name={`tables[${i}].name`}>
                        {(subField) => (
                          <div>
                            <Label>
                              <p>Name</p>
                              <Input
                                value={subField.state.value}
                                type="string"
                                onChange={(e) =>
                                  subField.handleChange(e.target.value)
                                }
                              />
                            </Label>
                          </div>
                        )}
                      </tableForm.Field>
                      <tableForm.Field name={`tables[${i}].maxSeats`}>
                        {(subField) => (
                          <div>
                            <Label>
                              <p>Seats</p>
                              <Input
                                value={subField.state.value}
                                type="number"
                                onChange={(e) =>
                                  subField.handleChange(
                                    Number.parse(e.target.value),
                                  )
                                }
                              />
                            </Label>
                          </div>
                        )}
                      </tableForm.Field>
                      <tableForm.Field
                        name={`tables[${i}].maxReservationLength`}
                      >
                        {(subField) => (
                          <div>
                            <Label>
                              <p>Max Minutes</p>
                              <Input
                                value={subField.state.value}
                                type="number"
                                step={15}
                                onChange={(e) =>
                                  subField.handleChange(
                                    Number.parse(e.target.value),
                                  )
                                }
                              />
                            </Label>
                          </div>
                        )}
                      </tableForm.Field>

                      <div className="mt-4 flex gap-1">
                        <Button
                          onClick={() => {
                            const name = field.state.value[i].name;

                            // if name ends with a number, increment that number, otherwise add " copy" to the end
                            if (name.split(" ").slice(-1)[0].match(/^\d+$/)) {
                              const parts = name.split(" ");
                              const num = Number.parse(parts.pop()!) + 1;
                              field.insertValue(i + 1, {
                                ...field.state.value[i],
                                name: [...parts, num].join(" "),
                              });
                            } else {
                              field.insertValue(i + 1, {
                                ...field.state.value[i],
                                name: name + " copy",
                              });
                            }
                          }}
                        >
                          Duplicate
                        </Button>
                        <Button
                          onClick={() => {
                            field.removeValue(i);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="w-full flex gap-1">
                  <Button
                    onClick={() =>
                      field.pushValue({
                        name: `Table ${field.state.value.length + 1}`,
                        maxSeats: 4,
                        maxReservationLength: 60,
                      })
                    }
                    type="button"
                  >
                    Add Table
                  </Button>
                  <tableForm.Subscribe
                    selector={(state) => [
                      state.canSubmit,
                      state.isSubmitting,
                      state.isDirty,
                    ]}
                    children={([canSubmit, isSubmitting, dirty]) => (
                      <Button
                        variant={dirty ? "danger" : "primary"}
                        type="submit"
                        aria-disabled={!canSubmit || isSubmitting}
                        isLoading={isSubmitting}
                      >
                        {isSubmitting ? "..." : "Save"}
                      </Button>
                    )}
                  />
                </div>
              </div>
            );
          }}
        </tableForm.Field>
      </form>
    </div>
  );
}
