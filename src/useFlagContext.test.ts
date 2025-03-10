import { renderHook } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import FlagProvider from "./FlagProvider";
import { useFlagContext } from "./useFlagContext";

test("logs an error if used outside of a FlagProvider", () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderHook(() => useFlagContext());
    expect(consoleSpy).toHaveBeenCalledWith("useFlagContext hook must be used within a FlagProvider");
    
    consoleSpy.mockRestore();
});

test("does not log an error if used inside of a FlagProvider", () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useFlagContext(), { wrapper: FlagProvider });
    
    expect(consoleSpy).not.toHaveBeenCalled();
    expect(result.current).not.toBeNull();
    
    consoleSpy.mockRestore();
});
