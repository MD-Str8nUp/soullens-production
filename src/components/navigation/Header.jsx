'use client'

import { useState } from 'react'
import { Menu, X, Settings, MessageSquare, BarChart3, BookOpen, Target } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Chat', href: '/', icon: MessageSquare },
    { name: 'Programs', href: '/programs', icon: Target },
    { name: 'Insights', href: '/insights', icon: BarChart3 },
    { name: 'Journal', href: '/journal', icon: BookOpen },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <header className="bg-brand-white shadow-sm border-b border-brand-gray">
      <nav className="container mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/primary_logo_w_tagline.jpg"
              alt="SoulLens.AI - See Yourself Clearly"
              width={200}
              height={40}
              className="h-8 w-auto md:h-10 object-contain hover:opacity-90 transition-opacity"
              style={{ width: 'auto' }}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 text-gray-600 hover:text-brand-navy transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-brand-gray"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-brand-gray"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        )}
      </nav>
    </header>
  )
}