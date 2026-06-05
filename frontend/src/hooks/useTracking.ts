import { useCallback } from 'react';

interface TrackingEvent {
  event: string;
  timestamp: number;
  value?: number;
  currency?: string;
}

export function useTracking() {
  const trackViewContent = useCallback((productSlug: string) => {
    const event: TrackingEvent = {
      event: 'ViewContent',
      timestamp: Date.now(),
    };
    
    // Fire pixels (deferred to next paint)
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_name: productSlug,
        content_type: 'product',
      });
    }
  }, []);

  const trackAddToCart = useCallback((productSlug: string, value: number) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'AddToCart', {
        content_name: productSlug,
        value: value,
        currency: 'MAD',
      });
    }
  }, []);

  const trackInitiateCheckout = useCallback((value: number, cartSize: number) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        value: value,
        currency: 'MAD',
        num_items: cartSize,
      });
    }
  }, []);

  const trackPurchase = useCallback((orderNumber: string, value: number) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', {
        value: value,
        currency: 'MAD',
        content_name: orderNumber,
      });
    }
  }, []);

  return {
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
  };
}
