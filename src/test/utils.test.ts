import { describe, it, expect } from 'vitest'
import { cn } from '../app/components/ui/utils'

describe('cn (className utility)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('removes duplicate Tailwind classes, keeping the last', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'active')).toBe('base active')
  })

  it('returns empty string for no input', () => {
    expect(cn()).toBe('')
  })
})
