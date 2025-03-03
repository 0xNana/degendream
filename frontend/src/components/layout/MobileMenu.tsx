'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { ConnectButton } from '@/components/web3/ConnectButton'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  navigation: Array<{ name: string; href: string }>
}

export function MobileMenu({ navigation }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-left bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Degen Dream
          </SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex flex-col gap-6">
          <nav className="flex flex-col gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === item.href 
                    ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text font-bold"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
            <ConnectButton />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 