import { GeneratedPanelScript, ComicProfile } from "../types";

export const downloadCSV = (comicName: string, script: GeneratedPanelScript[]) => {
  const headers = ['Panel', 'Character', 'Dialogue', 'Visual Note'];
  
  const rows = script.flatMap(panel => {
    // If no dialogue, still output the visual description
    if (panel.dialogue.length === 0) {
      return [[panel.panelNumber, 'NO_DIALOGUE', '', `"${panel.visualDescription.replace(/"/g, '""')}"`]];
    }
    return panel.dialogue.map(line => [
      panel.panelNumber,
      `"${line.character}"`,
      `"${line.text.replace(/"/g, '""')}"`,
      `"${panel.visualDescription.replace(/"/g, '""')}"`
    ]);
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${comicName.replace(/\s+/g, '_')}_dialogue.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};