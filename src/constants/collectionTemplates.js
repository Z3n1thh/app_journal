export const COLLECTION_TEMPLATES = [
  {
    id: 'movies',
    titleKey: 'templates.movies',
    emoji: '🎬',
    items: ['Inception', 'Spirited Away', 'The Matrix'],
  },
  {
    id: 'books',
    titleKey: 'templates.books',
    emoji: '📚',
    items: ['Atomic Habits', 'The Midnight Library', 'Educated'],
  },
  {
    id: 'selfcare',
    titleKey: 'templates.selfcare',
    emoji: '🛁',
    items: ['Take a bath', 'Walk in nature', 'Call a friend', 'Journal for 10 min'],
  },
  {
    id: 'travel',
    titleKey: 'templates.travel',
    emoji: '✈️',
    items: ['Tokyo', 'Lisbon', 'Iceland', 'New Zealand'],
  },
  {
    id: 'recipes',
    titleKey: 'templates.recipes',
    emoji: '🍳',
    items: ['Overnight oats', 'Vegetable stir-fry', 'Banana bread'],
  },
  {
    id: 'gratitude-list',
    titleKey: 'templates.gratitude',
    emoji: '🙏',
    items: ['Family', 'Health', 'Morning coffee'],
  },
]

export function templateToCollection(template, t) {
  return {
    id: `col-${template.id}-${Date.now()}`,
    title: `${template.emoji} ${t(template.titleKey)}`,
    items: template.items.map((text, i) => ({
      id: `item-${Date.now()}-${i}`,
      text,
      done: false,
    })),
  }
}
