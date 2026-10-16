// Founder photo management utilities with localStorage persistence and cross-component sync

export const DEFAULT_FOUNDER_PHOTOS = {
  ram: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  sateesh: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
};

export const PRESET_FOUNDER_PHOTOS = {
  ram: [
    {
      id: 'ram-suit-1',
      label: 'Executive Navy Suit',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'ram-suit-2',
      label: 'Modern Tech Leader',
      url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'ram-suit-3',
      label: 'Studio Editorial',
      url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    },
  ],
  sateesh: [
    {
      id: 'sateesh-suit-1',
      label: 'Corporate Director',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'sateesh-suit-2',
      label: 'Hospitality Governance',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'sateesh-suit-3',
      label: 'Executive Black Blazer',
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    },
  ],
};

export function getFounderPhoto(founder: 'ram' | 'sateesh'): string {
  try {
    const saved = localStorage.getItem(`chefpulse_photo_${founder}`);
    if (saved && saved.trim().length > 0) {
      return saved;
    }
  } catch {
    // ignore localStorage access error in sandboxes
  }
  return DEFAULT_FOUNDER_PHOTOS[founder];
}

export function saveFounderPhoto(founder: 'ram' | 'sateesh', photoUrlOrData: string): void {
  try {
    localStorage.setItem(`chefpulse_photo_${founder}`, photoUrlOrData);
    window.dispatchEvent(new CustomEvent('chefpulse-founder-photos-updated', {
      detail: { founder, photo: photoUrlOrData },
    }));
  } catch {
    // ignore
  }
}

export function resetFounderPhoto(founder: 'ram' | 'sateesh'): void {
  try {
    localStorage.removeItem(`chefpulse_photo_${founder}`);
    window.dispatchEvent(new CustomEvent('chefpulse-founder-photos-updated', {
      detail: { founder, photo: DEFAULT_FOUNDER_PHOTOS[founder] },
    }));
  } catch {
    // ignore
  }
}
