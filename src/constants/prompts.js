export const JOURNAL_PROMPTS = [
  { id: 1, en: 'What made you smile today?', sv: 'Vad fick dig att le idag?' },
  { id: 2, en: 'What are you looking forward to?', sv: 'Vad ser du fram emot?' },
  { id: 3, en: 'What challenged you today?', sv: 'Vad utmanade dig idag?' },
  { id: 4, en: 'Who are you grateful for?', sv: 'Vem är du tacksam för?' },
  { id: 5, en: 'What did you learn today?', sv: 'Vad lärde du dig idag?' },
  { id: 6, en: 'How did you take care of yourself?', sv: 'Hur tog du hand om dig själv?' },
  { id: 7, en: 'What would make tomorrow great?', sv: 'Vad skulle göra imorgon fantastisk?' },
  { id: 8, en: 'What emotion showed up most today?', sv: 'Vilken känsla dominerade idag?' },
  { id: 9, en: 'What boundary did you set or need?', sv: 'Vilken gräns satte eller behöver du?' },
  { id: 10, en: 'What small win can you celebrate?', sv: 'Vilken liten seger kan du fira?' },
  { id: 11, en: 'What drained your energy?', sv: 'Vad tömde din energi?' },
  { id: 12, en: 'What restored your energy?', sv: 'Vad återställde din energi?' },
  { id: 13, en: 'What are you proud of this week?', sv: 'Vad är du stolt över denna vecka?' },
  { id: 14, en: 'What habit served you well?', sv: 'Vilken vana hjälpte dig?' },
  { id: 15, en: 'What would you tell your past self?', sv: 'Vad skulle du säga till ditt tidigare jag?' },
  { id: 16, en: 'What do you need to let go of?', sv: 'Vad behöver du släppa?' },
  { id: 17, en: 'What brought you peace today?', sv: 'Vad gav dig ro idag?' },
  { id: 18, en: 'How did you show kindness?', sv: 'Hur visade du vänlighet?' },
  { id: 19, en: 'What surprised you today?', sv: 'Vad överraskade dig idag?' },
  { id: 20, en: 'What are three things going well?', sv: 'Vilka tre saker går bra?' },
  { id: 21, en: 'What fear came up and how did you handle it?', sv: 'Vilken rädsla dök upp och hur hanterade du den?' },
  { id: 22, en: 'What does your body need right now?', sv: 'Vad behöver din kropp just nu?' },
  { id: 23, en: 'Who did you connect with today?', sv: 'Vem kopplade du ihop med idag?' },
  { id: 24, en: 'What would rest look like tonight?', sv: 'Hur skulle vila se ut ikväll?' },
  { id: 25, en: 'What intention do you want to carry forward?', sv: 'Vilken intention vill du bära med dig?' },
  { id: 26, en: 'What made today meaningful?', sv: 'Vad gjorde dagen meningsfull?' },
  { id: 27, en: 'What pattern are you noticing?', sv: 'Vilket mönster märker du?' },
  { id: 28, en: 'What would self-compassion say?', sv: 'Vad skulle självmedkänsla säga?' },
  { id: 29, en: 'What are you curious about?', sv: 'Vad är du nyfiken på?' },
  { id: 30, en: 'How aligned do you feel with your values?', sv: 'Hur i linje känner du dig med dina värderingar?' },
  { id: 31, en: 'What one thing would improve your mood tomorrow?', sv: 'Vad skulle förbättra ditt humör imorgon?' },
  { id: 32, en: 'What did you avoid and why?', sv: 'Vad undvek du och varför?' },
]

export function getDailyPrompt(lang = 'en') {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const prompt = JOURNAL_PROMPTS[dayOfYear % JOURNAL_PROMPTS.length]
  if (lang === 'sv') return prompt.sv
  if (lang === 'es') return prompt.en // fallback to en for other langs without translation
  if (lang === 'fr') return prompt.en
  if (lang === 'de') return prompt.en
  if (lang === 'nl') return prompt.en
  return prompt.en
}
