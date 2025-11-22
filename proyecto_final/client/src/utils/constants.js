// Etiquetas definidas para el sistema
export const TAGS = [
  { id: 'fitness', name: 'Fitness', color: '#10b981' },
  { id: 'bajon', name: 'Bajón', color: '#f59e0b' },
  { id: 'veggie', name: 'Veggie', color: '#22c55e' },
  { id: 'salado', name: 'Salado', color: '#3b82f6' },
  { id: 'dulce', name: 'Dulce', color: '#ec4899' },
  { id: 'chatarra', name: 'Chatarra', color: '#f97316' }
];

// Mapeo para fácil acceso
export const TAG_MAP = TAGS.reduce((acc, tag) => {
  acc[tag.id] = tag;
  return acc;
}, {});