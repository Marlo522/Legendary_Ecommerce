import { useState } from 'react';
import { useApiResource } from '../hooks/useApiResource';
import { StorefrontContext } from '../services/storefrontContext';

export function StorefrontProvider({ children }) {
  const metadata = useApiResource('catalog/filters', { authenticate: false });
  const cartResource = useApiResource('cart', { authenticate: false });
  const [cartOverride, setCartOverride] = useState(null);
  return <StorefrontContext.Provider value={{
    metadata, cart: cartOverride ?? cartResource.data?.data,
    cartLoading: cartResource.loading && !cartOverride, cartError: cartOverride ? null : cartResource.error,
    applyCart: setCartOverride, refreshCart: () => { setCartOverride(null); cartResource.retry(); },
  }}>{children}</StorefrontContext.Provider>;
}
