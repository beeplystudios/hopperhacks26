import z from "zod/v4";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const TablesFormSchema = z.object({
  tables: z
    .object({
      maxSeats: z.number(),
      maxReservationLength: z.number(), // in minutes
    })
    .array(),
});

const Number = z.coerce.number();

export default function Tables() {
  const tableForm = useForm({
    defaultValues: {
      tables: [{ maxSeats: 3, maxReservationLength: 180 }],
    },
    validators: {
      onChange: TablesFormSchema,
    },
    onSubmit({ value }) {
      console.log(value);
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
                <div className="grid grid-cols-3 gap-2 w-[75%]">
                  {field.state.value.map((_, i) => (
                    <div
                      key={i + "-table"}
                      className="grid grid-cols-subgrid col-span-full gap-2"
                    >
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
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            field.insertValue(i + 1, field.state.value[i]);
                          }}
                        >
                          Duplicate
                        </Button>
                        <Button>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="w-full flex gap-3">
                  <Button
                    onClick={() =>
                      field.pushValue({
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
                        aria-disabled={!canSubmit}
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
