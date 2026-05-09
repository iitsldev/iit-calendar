import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Read config
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Read data
const eventsPath = path.resolve(process.cwd(), 'src/data/events.json');
const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

const reflectionsPath = path.resolve(process.cwd(), 'src/data/reflections.json');
const reflectionsData = JSON.parse(fs.readFileSync(reflectionsPath, 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seed() {
  console.log('Starting seed...');
  
  // 1. Config
  const configRef = doc(db, 'configs', 'calendar');
  await setDoc(configRef, {
    calendar_name: eventsData.calendar_name,
    version: eventsData.version,
    supported_calendar_types: eventsData.supported_calendar_types,
    last_updated: new Date().toISOString()
  });
  console.log('Config seeded.');

  // 2. Events
  const categories = [
    { key: 'srilanka_events', name: 'srilanka' },
    { key: 'myanmar_events', name: 'myanmar' },
    { key: 'thai_events', name: 'thai' },
    { key: 'vietnam_events', name: 'vietnam' },
    { key: 'IIT_2027_schedule', name: 'IIT_2027_schedule' }
  ];

  let eventCount = 0;
  for (const cat of categories) {
    const items = eventsData[cat.key] || [];
    // Process in batches of 50
    for (let i = 0; i < items.length; i += 50) {
      const batch = writeBatch(db);
      const chunk = items.slice(i, i + 50);
      chunk.forEach((item: any) => {
        const eventRef = doc(collection(db, 'events'));
        batch.set(eventRef, { ...item, category: cat.name });
        eventCount++;
      });
      await batch.commit();
      console.log(`Seeded ${eventCount} events...`);
    }
  }

  // 3. Reflections
  for (let i = 0; i < reflectionsData.length; i += 50) {
    const batch = writeBatch(db);
    const chunk = reflectionsData.slice(i, i + 50);
    chunk.forEach((item: any) => {
      const refRef = doc(db, 'reflections', item.id);
      batch.set(refRef, {
        quote: item.quote,
        author: item.author,
        source: item.source || ''
      });
    });
    await batch.commit();
    console.log(`Seeded ${Math.min(i + 50, reflectionsData.length)} reflections...`);
  }

  console.log('Seed successful!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
