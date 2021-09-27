import { renderHook, act } from '@testing-library/react-hooks'
import useFlag from './useFlag'

describe('should increment counter', () => {
  const { result } = renderHook(() => useFlag('Test'))

  act(() => {
    result.current.increment()
  })

  expect(result.current.count).toBe(1)
})