import { useContext } from 'react';
import FlagContext from './FlagContext';

export function useFlagContext() {
    const context = useContext(FlagContext);
    if (!context) {
      console.error('This hook must be used within a FlagProvider');
      return null;
    }
    return context;
}
