import React from 'react'

import { cn } from '@/lib/utils'
import { ExternalLink } from '@/components/external-link'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      AI chatbot built by{' '}
      <ExternalLink href="https://www.linkedin.com/in/steph-tien-ng">Stephanie Ng.</ExternalLink>
    </p>
  )
}