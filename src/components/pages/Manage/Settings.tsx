/**
 * Tables, what ingredients, location, color,
 */
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

export default function Settings() {
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
                <table className="space-y-2">
                  <tbody>
                    {field.state.value.map((_, i) => (
                      <tr key={i + "-table"}>
                        <tableForm.Field name={`tables[${i}].maxSeats`}>
                          {(subField) => (
                            <td>
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
                            </td>
                          )}
                        </tableForm.Field>
                        <tableForm.Field
                          name={`tables[${i}].maxReservationLength`}
                        >
                          {(subField) => (
                            <td>
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
                            </td>
                          )}
                        </tableForm.Field>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
