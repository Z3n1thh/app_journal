export const ACHIEVEMENTS = [
  { id: 'streak-7', emoji: '🔥', titleKey: 'achievements.streak7', condition: (d) => d.loggingStreak >= 7 },
  { id: 'streak-30', emoji: '💎', titleKey: 'achievements.streak30', condition: (d) => d.loggingStreak >= 30 },
  { id: 'days-30', emoji: '📔', titleKey: 'achievements.days30', condition: (d) => d.totalDays >= 30 },
  { id: 'days-100', emoji: '🏆', titleKey: 'achievements.days100', condition: (d) => d.totalDays >= 100 },
  { id: 'habit-7', emoji: '✅', titleKey: 'achievements.habit7', condition: (d) => d.topHabitStreak >= 7 },
  { id: 'habit-30', emoji: '⭐', titleKey: 'achievements.habit30', condition: (d) => d.topHabitStreak >= 30 },
  { id: 'gratitude-10', emoji: '🙏', titleKey: 'achievements.gratitude10', condition: (d) => d.gratitudeDays >= 10 },
  { id: 'photo-5', emoji: '📸', titleKey: 'achievements.photo5', condition: (d) => d.photoDays >= 5 },
]
