import { Route } from "@/routes/manage.$id/ingredients";

export default function Ingredients() {
  const { ingredients } = Route.useLoaderData();
  return (
    <div>
      {ingredients.map(({ ingredientName: name, ingredientId }) => (
        <div key={ingredientId + name}>
          <p>{name}</p>
        </div>
      ))}
    </div>
  );
}
