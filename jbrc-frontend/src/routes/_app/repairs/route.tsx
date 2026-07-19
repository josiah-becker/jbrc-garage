import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/repairs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/repairs"!</div>
}
