export const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return `₹${num.toLocaleString("en-IN")}`;
};