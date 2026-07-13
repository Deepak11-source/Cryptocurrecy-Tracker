export default function formatNumber(x) {
  const parsedNumber = parseFloat(x);
  if (isNaN(parsedNumber)) {
    return 'Invalid Number';
  }
  return parsedNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
