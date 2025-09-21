'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { 
  NavigationMenu, 
  NavigationMenuItem, 
  NavigationMenuList
} from "@/components/ui/navigation-menu"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  Home, 
  Send, 
  History, 
  MessageCircle, 
  Menu, 
  Sun, 
  Moon, 
  LogOut,
  User,
  Settings
} from "lucide-react"

interface NavigationProps {
  user?: {
    name: string
    email: string
  }
}

export default function Navigation({ user }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        router.push('/login')
        router.refresh()
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Transfer', href: '/transfer', icon: Send },
    { name: 'Transactions', href: '/transactions', icon: History },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
  ]

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-primary-foreground font-bold text-lg">N</span>
              </div>
              <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">NextBank</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <NavigationMenu>
              <NavigationMenuList>
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <Link
                      href={item.href}
                      className="group relative inline-flex h-10 w-max items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-primary/15 data-[state=open]:bg-primary/15"
                    >
                      <item.icon className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      <span className="relative z-10">{item.name}</span>
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* User Menu & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-3">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative h-10 w-10 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 group-hover:scale-110" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:scale-110" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/10 hover:scale-105 transition-all duration-300 group">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                      <AvatarImage src="/placeholder-avatar.jpg" alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-3 p-3 bg-muted/50 rounded-lg mx-2 mt-2">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarImage src="/placeholder-avatar.jpg" alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-xs">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="w-[200px] truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary transition-colors duration-200">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary transition-colors duration-200">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative h-10 w-10 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 group-hover:scale-110" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:scale-110" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
            
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300 group">
                  <Menu className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-primary-foreground font-bold text-lg">N</span>
                    </div>
                    <span className="text-xl font-bold">NextBank</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  
                  {user && (
                    <>
                      <Separator className="my-4" />
                      <div className="px-4 py-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                            <AvatarImage src="/placeholder-avatar.jpg" alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group"
                        onClick={() => {
                          handleLogout()
                          setIsMenuOpen(false)
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        Log out
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
