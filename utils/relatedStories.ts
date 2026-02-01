import { Story } from '../types';
import { storyMetadata } from '../data/storyMetadata';

/**
 * Find related stories based on various criteria
 */
export const findRelatedStories = (currentStory: Story, limit: number = 3): Story[] => {
  const currentIndex = storyMetadata.findIndex(s => s.id === currentStory.id);
  if (currentIndex === -1) return [];

  const related: Array<{ story: Story; score: number }> = [];

  storyMetadata.forEach((story, index) => {
    if (story.id === currentStory.id) return; // Skip current story

    let score = 0;

    // Same category: +3 points
    if (story.category === currentStory.category) {
      score += 3;
    }

    // Same year: +5 points
    if (story.year === currentStory.year) {
      score += 5;
    }

    // Adjacent years (±1 year): +2 points
    const currentYear = parseInt(currentStory.year);
    const storyYear = parseInt(story.year);
    if (Math.abs(currentYear - storyYear) === 1) {
      score += 2;
    }

    // Same decade: +1 point
    const currentDecade = Math.floor(currentYear / 10) * 10;
    const storyDecade = Math.floor(storyYear / 10) * 10;
    if (currentDecade === storyDecade) {
      score += 1;
    }

    // Adjacent in list (chronological proximity): +1 point
    if (Math.abs(index - currentIndex) <= 2) {
      score += 1;
    }

    // Extract pilot names from title/subtitle for better matching
    // This is a simple heuristic - can be improved
    const currentText = `${currentStory.title} ${currentStory.subtitle}`.toLowerCase();
    const storyText = `${story.title} ${story.subtitle}`.toLowerCase();
    
    // Common F1 names to check
    const commonNames = ['senna', 'schumacher', 'hamilton', 'hunt', 'lauda', 'massa', 'button', 'fangio', 'villeneuve', 'arnoux', 'häkkinen', 'hakkinen'];
    commonNames.forEach(name => {
      if (currentText.includes(name) && storyText.includes(name)) {
        score += 4; // Same pilot/character mentioned
      }
    });

    if (score > 0) {
      related.push({ story: { ...story, content: [] }, score });
    }
  });

  // Sort by score (highest first), then by year proximity
  related.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const currentYear = parseInt(currentStory.year);
    const aYear = parseInt(a.story.year);
    const bYear = parseInt(b.story.year);
    return Math.abs(aYear - currentYear) - Math.abs(bYear - currentYear);
  });

  return related.slice(0, limit).map(r => r.story);
};
