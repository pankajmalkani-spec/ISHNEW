import { cpSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'node_modules', 'tinymce');
const dest = join(root, 'public', 'tinymce');

mkdirSync(join(root, 'public'), { recursive: true });
cpSync(src, dest, { recursive: true, force: true });
