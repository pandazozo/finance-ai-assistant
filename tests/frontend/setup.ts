import '@testing-library/jest-dom'
import { vi } from 'vitest'

global.fetch = vi.fn()

Storage.prototype.getItem = vi.fn((key: string) => {
  const store: Record<string, string> = {}
  return store[key] || null
})

Storage.prototype.setItem = vi.fn((key: string, value: string) => {
  const store: Record<string, string> = {}
  store[key] = value
})

Storage.prototype.removeItem = vi.fn((key: string) => {
  const store: Record<string, string> = {}
  delete store[key]
})
