export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  if (amount === null || amount === undefined) return '';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (_) {
    return `$${amount.toFixed(2)}`;
  }
};

export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined) return '';

  try {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  } catch (_) {
    return number.toFixed(decimals);
  }
};

