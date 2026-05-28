/**
 * Currency utility for Córdobas Nicaragüenses (NIO)
 * All prices in the system are stored and displayed in Córdobas
 */

export const CURRENCY = {
  code: 'NIO',
  symbol: 'C$',
  name: 'Córdoba Nicaragüense',
  decimals: 2,
};

/**
 * Format a number as Córdobas currency
 * @param amount - The amount in Córdobas
 * @param showSymbol - Whether to show the C$ symbol (default: true)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, showSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency: 'NIO',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  // The Intl format includes the currency code, so we'll customize it
  if (showSymbol) {
    // Replace the formatted currency with our custom format
    return `C$ ${amount.toFixed(2)}`;
  }

  return amount.toFixed(2);
}

/**
 * Parse currency string to number
 * @param value - Currency string (e.g., "C$ 100.00")
 * @returns Number value
 */
export function parseCurrency(value: string): number {
  // Remove C$, spaces, and parse as float
  const cleaned = value.replace(/[C$\s]/g, '').trim();
  return parseFloat(cleaned) || 0;
}

/**
 * Format price for display in product lists
 */
export function formatPrice(price: number): string {
  return `C$ ${price.toFixed(2)}`;
}

/**
 * Format price range
 */
export function formatPriceRange(min: number, max: number): string {
  return `C$ ${min.toFixed(2)} - C$ ${max.toFixed(2)}`;
}

/**
 * Get display label for currency
 */
export function getCurrencyLabel(): string {
  return `${CURRENCY.symbol} ${CURRENCY.name}`;
}

/**
 * Calculate tax amount
 */
export function calculateTax(amount: number, taxRate: number = 15): number {
  return (amount * taxRate) / 100;
}

/**
 * Calculate total with tax
 */
export function calculateTotal(subtotal: number, taxRate: number = 15, shippingCost: number = 0, discount: number = 0): number {
  const tax = calculateTax(subtotal, taxRate);
  return subtotal + tax + shippingCost - discount;
}

/**
 * Format order total for display
 */
export function formatOrderTotal(subtotal: number, taxRate: number, shippingCost: number, discount: number = 0): {
  subtotal: string;
  tax: string;
  shipping: string;
  discount: string;
  total: string;
  breakdown: { label: string; amount: string }[];
} {
  const tax = calculateTax(subtotal, taxRate);
  const total = calculateTotal(subtotal, taxRate, shippingCost, discount);

  const breakdown = [
    { label: 'Subtotal', amount: formatPrice(subtotal) },
    { label: `Impuesto (${taxRate}%)`, amount: formatPrice(tax) },
    { label: 'Envío', amount: formatPrice(shippingCost) },
  ];

  if (discount > 0) {
    breakdown.push({ label: 'Descuento', amount: `-${formatPrice(discount)}` });
  }

  return {
    subtotal: formatPrice(subtotal),
    tax: formatPrice(tax),
    shipping: formatPrice(shippingCost),
    discount: formatPrice(discount),
    total: formatPrice(total),
    breakdown,
  };
}

/**
 * Convert USD to NIO (for reference, actual rate depends on day)
 * Current approximate rate: 1 USD ≈ 35 NIO
 */
export const USD_TO_NIO_RATE = 35;

export function convertUsdToNio(usd: number): number {
  return usd * USD_TO_NIO_RATE;
}

export function convertNioToUsd(nio: number): number {
  return nio / USD_TO_NIO_RATE;
}
