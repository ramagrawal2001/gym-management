// Invoice generation service
// This is a basic implementation - can be extended with PDF generation libraries

export const generateInvoiceNumber = async (gymId, Invoice) => {
  const year = new Date().getFullYear();
  const count = await Invoice.countDocuments({ gymId });
  return `INV-${year}-${String(count + 1).padStart(6, '0')}`;
};

export const calculateInvoiceTotal = (items, taxRate = 0, discount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax - discount;
  
  return {
    subtotal,
    tax,
    discount,
    total
  };
};

