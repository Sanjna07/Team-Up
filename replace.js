const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/ADMIN/Downloads/Team-Up/frontend/src';

const files = [
  'Matchmaking.jsx',
  'components/CreateRoomModal.jsx',
  'FriendsChat.jsx',
  'Dashboard.jsx',
  'CommunityChat.jsx'
];

files.forEach(file => {
  const p = path.join(dir, file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    
    // Ensure API_URL is defined if it's missing (usually CreateRoomModal or Matchmaking might miss it)
    if (!content.includes('const API_URL')) {
      content = content.replace(/(import .* from .*;?[\r\n]+)+/, match => {
        return match + '\nconst API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";\n';
      });
    }
    
    // Replace hardcoded URLs
    content = content.replace(/['"]http:\/\/localhost:5000(.*?)['"]/g, '`${API_URL}$1`');
    content = content.replace(/`http:\/\/localhost:5000(.*?)`/g, '`${API_URL}$1`');
    
    fs.writeFileSync(p, content);
    console.log(`Replaced in ${file}`);
  }
});
