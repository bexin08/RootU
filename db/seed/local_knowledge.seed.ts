import { embedText } from "../../server/src/lib/embed";
import { supabaseAdmin } from "../../server/src/lib/supabaseAdmin";

const sampleKnowledge = [
  {
    city: "Mangaluru",
    category: "transit",
    title: "Auto Apps",
    content: "In Deralakatte/Yenepoya area, Namma Yatri and standard Uber often have long wait times. Local students prefer using the 'Tu-Tu' auto stand right outside the campus main gate or the campus shuttle. Always agree on fare before getting in if not using a meter.",
    source: "Student Guide 2025"
  },
  {
    city: "Mangaluru",
    category: "food",
    title: "Vegetarian Options near Campus",
    content: "For pure vegetarian food near Yenepoya, 'Sagar Ratna' is highly recommended by seniors. The campus mess has a separate veg section, but it closes strictly at 9 PM.",
    source: "Student Guide 2025"
  },
  {
    city: "Mangaluru",
    category: "community_culture",
    title: "Monsoon Preparedness",
    content: "Mangaluru experiences heavy monsoon from June to September. Always carry an umbrella. The roads near Deralakatte can get waterlogged, so leave 15 mins early for classes.",
    source: "General Knowledge"
  }
];

async function seed() {
  console.log("Seeding local knowledge...");
  for (const item of sampleKnowledge) {
    try {
      const embedding = await embedText(item.content);
      const { error } = await supabaseAdmin.from("local_knowledge").insert({
        city: item.city,
        category: item.category,
        title: item.title,
        content: item.content,
        source: item.source,
        embedding
      });
      if (error) console.error("Error inserting:", item.title, error);
      else console.log("Inserted:", item.title);
    } catch (err) {
      console.error("Embedding error for:", item.title, err);
    }
  }
  console.log("Seeding complete.");
}

seed();
