import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let definitionMap: Map<string, string> | null = null;

export function getWordByDefinition(definition: string): string {
  if (!definitionMap) {
    definitionMap = new Map();
    // Resolve path to the backend reference_data directory relative to this file
    // tests/e2e/dictionary.ts -> ../../.. -> Spelling-Scholar -> Spelling Bee Dev -> Spelling-Coach
    const dataDir = path.resolve(__dirname, '../../../Spelling-Coach/reference_data');
    
    try {
      const files = ['words.generated.json', 'words.foreign.generated.json', 'words.custom.generated.json'];
      for (const file of files) {
        const filePath = path.join(dataDir, file);
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (Array.isArray(data)) {
            for (const item of data) {
              if (item.words && Array.isArray(item.words)) {
                for (const w of item.words) {
                  if (w.definition && w.word) {
                    definitionMap.set(w.definition.trim(), w.word);
                  }
                }
              } else if (item.definition && item.word) {
                definitionMap.set(item.definition.trim(), item.word);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to load dictionary:", e);
    }
    
    // Fallbacks for mockNextWord (when backend is down)
    definitionMap.set("A person you like and trust.", "friend");
    definitionMap.set("For the reason that.", "because");
    definitionMap.set("A regular repeated pattern of sound or movement.", "rhythm");
    definitionMap.set("Needed; required.", "necessary");
    definitionMap.set("A word that imitates the sound it represents, like 'buzz' or 'sizzle'.", "onomatopoeia");
    definitionMap.set("Careful and thorough; guided by conscience.", "conscientious");
  }
  
  return definitionMap.get(definition.trim()) || "";
}
