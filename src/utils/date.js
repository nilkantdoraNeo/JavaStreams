function toDateOnlyString(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function daysBetween(dateA, dateB) {
  const a = new Date(toDateOnlyString(dateA));
  const b = new Date(toDateOnlyString(dateB));
  const diffMs = b.getTime() - a.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

module.exports = {
  toDateOnlyString,
  daysBetween
};
