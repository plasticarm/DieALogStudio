import fs from 'fs';
fs.writeFileSync('env.json', JSON.stringify(process.env));
