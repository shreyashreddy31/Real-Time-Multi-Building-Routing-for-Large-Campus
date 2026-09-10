export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const fuzzyMatch = (query, items) => {
  if (!query) return [];
  const q = query.toLowerCase();
  
  return items.map(item => {
    let score = 0;
    const name = item.name.toLowerCase();
    const type = item.type.toLowerCase();
    const category = item.category.toLowerCase();

    if (name === q) score += 100;
    else if (name.startsWith(q)) score += 50;
    else if (name.includes(q)) score += 20;

    if (type === q) score += 30;
    else if (type.includes(q)) score += 10;

    if (category === q) score += 20;
    else if (category.includes(q)) score += 5;

    return { ...item, matchScore: score };
  })
  .filter(item => item.matchScore > 0)
  .sort((a, b) => b.matchScore - a.matchScore);
};
