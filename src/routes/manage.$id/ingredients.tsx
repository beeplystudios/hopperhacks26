import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/$id/ingredients')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/$id/ingredients"!</div>
}
