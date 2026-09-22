import type { ReactNode } from 'react'
import { Card, CardBody, CardHeader } from './card'

/** A titled card section, for content that is not a form or a table. */
export function PageSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardBody>{children}</CardBody>
    </Card>
  )
}
