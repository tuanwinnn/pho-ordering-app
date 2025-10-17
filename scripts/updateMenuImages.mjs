import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function updateMenuImages() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }
  
  const client = await MongoClient.connect(uri);
  const db = client.db();
  const menuItems = db.collection('menuitems');

  // Image mapping with EXACT Vietnamese names
  const imageMapping = {
    // Pho dishes
    'Phở Đặc Biệt': 'pho-dac-biet.jpg',
    'Phở Tái': 'pho-tai.jpg',
    'Phở Gà': 'pho-ga.jpg',
    'Phở Chay': 'pho-chay.jpg',
    
    // Bun dishes
    'Bún Bò Huế': 'bun-bo-hue.jpg',
    'Bún Thịt Nướng': 'bun-thit-nuong.jpg',
    'Bún Chả Giò': 'bun-cha-gio.jpg',
    'Bún Chay': 'bun-chay.jpg',
    
    // Com dishes
    'Cơm Tấm Sườn': 'com-tam-suon.jpg',
    'Cơm Gà Nướng': 'com-ga-nuong.jpg',
    'Cơm Chiên': 'com-chien.jpg',
    'Cơm Chay': 'com-chay.jpg',
    
    // Mi dishes
    'Mì Xào Giòn': 'mi-xao-gion.jpg',
    'Mì Hoành Thánh': 'mi-hoanh-thanh.jpg',
    'Mì Vịt Tiềm': 'mi-viet-tiem.jpg',
    
    // Appetizers
    'Chả Giò': 'cha-gio.jpg',
    'Gỏi Cuốn': 'goi-cuon.jpg',
    'Cánh Gà Chiên': 'canh-ga-chien.jpg',
    
    // Drinks (already updated)
    'Classic Milk Tea': 'classic-milk-tea.jpg',
    'Taro Milk Tea': 'taro-milk-tea.jpg',
    'Brown Sugar Milk Tea': 'brown-sugar-milk-tea.jpg',
    'Thai Tea': 'thai-tea.jpg',
  };

  console.log('Starting updates...\n');

  for (const [itemName, filename] of Object.entries(imageMapping)) {
    const result = await menuItems.updateOne(
      { name: itemName },
      { $set: { image: `/images/menu/${filename}` } }
    );
    
    if (result.matchedCount > 0) {
      console.log(`✅ Updated: ${itemName} → /images/menu/${filename}`);
    } else {
      console.log(`⚠️  Not found in DB: ${itemName}`);
    }
  }

  await client.close();
  console.log('\n🎉 All images updated successfully!');
}

updateMenuImages().catch(console.error);