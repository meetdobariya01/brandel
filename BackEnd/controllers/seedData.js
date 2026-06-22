// seedData.js - Run this to add test data
const waitlistModel = require('./models/waitlistModel');

const testData = [
  {
    brandName: "Gheevo",
    yourName: "Abhishek Dixit",
    email: "work.gheevo@gmail.com",
    mobile: "+91 85951 67232",
    website: "https://gheevo.com/",
    category: "Artisanal Foods",
    aboutBrand: ""
  },
  {
    brandName: "Allure Shopping",
    yourName: "Muskaan Garg",
    email: "muskaanf231@gmail.com",
    mobile: "9058577602",
    website: "www.allureshopping.com",
    category: "Handmade & Crafts",
    aboutBrand: ""
  },
  {
    brandName: "The Hobbyt",
    yourName: "Pragnya",
    email: "pragnya.parchure@gmail.com",
    mobile: "9886577199",
    website: "https://www.instagram.com/thehobbyt?igsh=bHRnY3FmNG84YTA3",
    category: "Handmade & Crafts",
    aboutBrand: "The Hobbyt, inspired by the beauty of Mother Earth, is all things handmade. We offer one of a kind, colourful, quirky handmade crochet toys that will definately bring a smile to your face."
  },
  {
    brandName: "KAMVARA",
    yourName: "Kanishk Bhatia",
    email: "kanishkbhatiaa@gmail.com",
    mobile: "9210114095",
    website: "https://www.instagram.com/_kamvara.nutrition?igsh=dnczeWt1MHR3YmNi",
    category: "Organic & Wellness",
    aboutBrand: "A plant based Protein powder brand"
  }
];

// Function to seed data
const seedDatabase = () => {
  console.log('🌱 Seeding test data...');
  
  let addedCount = 0;
  let duplicateCount = 0;
  
  testData.forEach(data => {
    // Check if email already exists
    const existing = waitlistModel.getEntryByEmail(data.email);
    if (existing) {
      console.log(`⚠️ Email ${data.email} already exists, skipping...`);
      duplicateCount++;
      return;
    }
    
    // Add to waitlist
    const entry = waitlistModel.addToWaitlist(data);
    if (entry) {
      addedCount++;
      console.log(`✅ Added: ${data.brandName} (${data.email})`);
    }
  });
  
  console.log(`\n📊 Seeding complete!`);
  console.log(`✅ Added: ${addedCount} entries`);
  console.log(`⚠️ Skipped (duplicates): ${duplicateCount} entries`);
  console.log(`📈 Total entries in database: ${waitlistModel.getStats().total}`);
};

// Run the seed function
seedDatabase();

// Export for use in other files
module.exports = { seedDatabase };