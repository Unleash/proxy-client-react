import { renderHook } from '@testing-library/react-hooks/native';
import FlagProvider from "./FlagProvider";
import { useFlagContext } from "./useFlagContext";

test("throws an error if used outside of a FlagProvider", () => {
    const { result } = renderHook(() => useFlagContext());
    
    expect(result.error).toEqual(
        Error("This hook must be used within a FlagProvider")
    );
});

test("does not throw an error if used inside of a FlagProvider", () => {
    const { result } = renderHook(() => useFlagContext(), { wrapper: FlagProvider });
    
    expect(result.error).toBeUndefined();
});
