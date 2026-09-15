export const LAYOUT_TEMPLATES = [
  {
    id: 'slide_pembicara',
    label: 'Slide + Speaker',
    tag: 'Default',
    description: 'Top ~60% slide visual, bottom ~30% speaker webcam, bottom strip with captions. Ideal for training webinars & presentations.',
    aspect: '9:16 Vertical',
    suitableFor: 'Slide decks with talking head webcam',
  },
  {
    id: 'talking_head',
    label: 'Talking Head',
    tag: 'Creator',
    description: 'Center-cropped vertical framing with high-visibility captions. Ideal for podcasts, monologues & creator commentaries.',
    aspect: '9:16 Vertical',
    suitableFor: 'Interviews & creator direct-to-camera speech',
  },
  {
    id: 'slide_saja',
    label: 'Slide Only',
    tag: 'Direct Screen',
    description: 'Letterboxed 16:9 presentation slide centered on blurred backdrop with subtitle bar at bottom. Ideal for software walkthroughs.',
    aspect: '9:16 Vertical',
    suitableFor: 'Software tutorials, screen captures & diagrams',
  },
];

export const DEFAULT_LAYOUT_TEMPLATE = 'slide_pembicara';

export function getTemplateById(id) {
  return LAYOUT_TEMPLATES.find((t) => t.id === id) || null;
}
