import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/$id/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/$id/settings"!</div>
}
