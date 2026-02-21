import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/restaurants/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/restaurants/$id"!</div>
}
