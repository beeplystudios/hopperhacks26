import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/$id/menus')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/$id/menus"!</div>
}
