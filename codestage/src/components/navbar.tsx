"use client"

import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Code2, Menu, X } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <Code2 className="h-4 w-4 text-background" />
          </div>
          <span className="font-semibold tracking-tight text-foreground">CodeStage</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="#features" to="." className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#how-it-works" to="." className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link href="/workspace" to=".." className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Workspace
          </Link>
          <Link href="#pricing" to="." className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <ModeToggle />
          <Link href="/admin" to="/admin" className="block">
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
              Admin Portal
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-4 md:hidden">
          <ModeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-b border-border bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="#features" to="." className="text-sm text-muted-foreground">
              Features
            </Link>
            <Link href="#how-it-works" to="." className="text-sm text-muted-foreground">
              How it works
            </Link>
            <Link href="/workspace" to=".." className="text-sm text-muted-foreground">
              Workspace
            </Link>
            <Link href="#pricing" to="." className="text-sm text-muted-foreground">
              Pricing
            </Link>
            <div className="pt-2">
              <Link href="/admin" to="/admin" className="block">
                <Button size="sm" className="w-full bg-foreground text-background">
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
