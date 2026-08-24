import { CATEGORIES } from '@/components/layout/navbar/constants'
import { Link, ShoppingBag } from 'lucide-react'
import React from 'react'

const page = () => {
  return (
    <main>
        {/* Mobile: scrollable category pill strip */}
        <div className="lg:hidden border-t border-border bg-background overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 px-4 py-2 w-max">
            {CATEGORIES.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors whitespace-nowrap"
              >
                <Icon className="size-3.5 shrink-0" strokeWidth={1.7} />
                {label}
              </Link>
            ))}
            <Link
              href="/products"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium whitespace-nowrap hover:bg-primary/90 transition-colors"
            >
              <ShoppingBag className="size-3.5 shrink-0" />
              All
            </Link>
          </div>
        </div>
    </main>
  )
}

export default page