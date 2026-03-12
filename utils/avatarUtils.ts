
export const getAllAvailableAvatars = () => {
  const avatars: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('sessions_')) {
      try {
        const sessionsData = JSON.parse(localStorage.getItem(key) || '[]');
        if (Array.isArray(sessionsData)) {
          sessionsData.forEach((s: any) => {
            if (s.data && s.data.comics && Array.isArray(s.data.comics)) {
              s.data.comics.forEach((c: any) => {
                if (c.characters && Array.isArray(c.characters)) {
                  c.characters.forEach((char: any) => {
                    if (char.avatarUrl) avatars.push(char.avatarUrl);
                    else if (char.imageUrl) avatars.push(char.imageUrl);
                  });
                }
              });
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse session for avatars", e);
      }
    }
  }
  // Also check INITIAL_COMICS if we want, but they don't have images.
  // Remove duplicates
  return Array.from(new Set(avatars));
};

export const getRandomComicAvatar = () => {
  const avatars = getAllAvailableAvatars();
  if (avatars.length === 0) return null;
  return avatars[Math.floor(Math.random() * avatars.length)];
};
