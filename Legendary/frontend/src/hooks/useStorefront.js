import { useContext } from 'react';
import { StorefrontContext } from '../services/storefrontContext';
export function useStorefront() { return useContext(StorefrontContext); }
