export const calculateDiscount = (originalPrice, discountPercent) => {
  return originalPrice * (discountPercent / 100);
};

export const calculateDiscountedPrice = (originalPrice, discountPercent) => {
  return originalPrice - calculateDiscount(originalPrice, discountPercent);
};

export const calculateTax = (price, taxPercent = 18) => {
  return price * (taxPercent / 100);
};

export const calculateTotal = (price, quantity = 1, taxPercent = 18, discountPercent = 0) => {
  const subtotal = price * quantity;
  const discountAmount = calculateDiscount(subtotal, discountPercent);
  const priceAfterDiscount = subtotal - discountAmount;
  const taxAmount = calculateTax(priceAfterDiscount, taxPercent);
  return priceAfterDiscount + taxAmount;
};

export const calculateCartTotal = (items) => {
  return items.reduce((total, item) => {
    return total + calculateTotal(
      item.price,
      item.quantity,
      item.tax || 18,
      item.discount || 0
    );
  }, 0);
};

export const calculatePricePerUnit = (totalPrice, quantity, unit = 'kg') => {
  const pricePerUnit = totalPrice / quantity;
  return {
    price: pricePerUnit,
    unit: unit,
    formatted: `₹${pricePerUnit.toFixed(2)}/${unit}`
  };
};

export const comparePrices = (price1, price2) => {
  const difference = price1 - price2;
  const percentChange = (difference / price2) * 100;
  return {
    difference,
    percentChange,
    isHigher: difference > 0,
    isLower: difference < 0,
    isEqual: difference === 0
  };
};
