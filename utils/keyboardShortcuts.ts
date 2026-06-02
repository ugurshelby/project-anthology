/**
 * Keyboard Shortcuts Handler
 * Provides keyboard navigation for the Anthology site
 */

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  condition?: () => boolean; // Optional condition to check if shortcut should be active
}

export const createKeyboardShortcuts = (
  handlers: {
    onEscape?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onSpace?: () => void;
    onQuestionMark?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
  }
): (() => void) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (
      (e.target as HTMLElement).tagName === 'INPUT' ||
      (e.target as HTMLElement).tagName === 'TEXTAREA' ||
      (e.target as HTMLElement).isContentEditable
    ) {
      return;
    }

    // Prevent default for our shortcuts
    const preventDefault = () => {
      e.preventDefault();
      e.stopPropagation();
    };

    switch (e.key) {
      case 'Escape':
        if (handlers.onEscape) {
          preventDefault();
          handlers.onEscape();
        }
        break;

      case 'ArrowLeft':
        if (handlers.onArrowLeft) {
          preventDefault();
          handlers.onArrowLeft();
        }
        break;

      case 'ArrowRight':
        if (handlers.onArrowRight) {
          preventDefault();
          handlers.onArrowRight();
        }
        break;

      case ' ': // Space
        if (handlers.onSpace && !e.shiftKey) {
          preventDefault();
          handlers.onSpace();
        }
        break;

      case '?':
        if (handlers.onQuestionMark && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
          preventDefault();
          handlers.onQuestionMark();
        }
        break;

      case 'Home':
        if (handlers.onHome && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
          preventDefault();
          handlers.onHome();
        }
        break;

      case 'End':
        if (handlers.onEnd && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
          preventDefault();
          handlers.onEnd();
        }
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
};

export const shortcutsList: Array<{ key: string; description: string }> = [
  { key: 'ESC', description: 'Close modal/menu' },
  { key: '← →', description: 'Navigate between stories' },
  { key: 'SPACE', description: 'Scroll down' },
  { key: '?', description: 'Show keyboard shortcuts' },
  { key: 'HOME', description: 'Scroll to top' },
  { key: 'END', description: 'Scroll to bottom' },
];
