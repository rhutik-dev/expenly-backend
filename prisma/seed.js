import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


const tags = [
    // 🍽 Food & Dining
    { name: "Food & Dining", color: "#A3B18A" },
    { name: "Groceries", color: "#B5C99A" },
    { name: "Coffee & Tea", color: "#CDB4DB" },
    { name: "Snacks", color: "#E6CCB2" },

    // 🏠 Living & Utilities
    { name: "Rent", color: "#ADB5BD" },
    { name: "Electricity", color: "#B6C7D6" },
    { name: "Water Bill", color: "#CFE1E8" },
    { name: "Gas", color: "#D6CCC2" },
    { name: "Internet", color: "#C3D5E8" },

    // 🚗 Transport
    { name: "Transport", color: "#A0C4FF" },
    { name: "Fuel", color: "#BFD7EA" },
    { name: "Cab / Taxi", color: "#CDB4DB" },
    { name: "Parking", color: "#CED4DA" },

    // 🏥 Health
    { name: "Health", color: "#A8DADC" },
    { name: "Medical", color: "#B7E4C7" },
    { name: "Fitness", color: "#C1E1C1" },

    // 🛍 Shopping & Lifestyle
    { name: "Shopping", color: "#D8B4E2" },
    { name: "Clothing", color: "#EAC4D5" },
    { name: "Personal Care", color: "#E8DFF5" },

    // 🎬 Entertainment
    { name: "Entertainment", color: "#FFD6A5" },
    { name: "Movies", color: "#FFE5B4" },
    { name: "Subscriptions", color: "#EDEDE9" },

    // 💼 Work & Education
    { name: "Education", color: "#BDB2FF" },
    { name: "Office Expenses", color: "#C7D3DD" },

    // 💰 Finance
    { name: "EMI / Loans", color: "#D3D3D3" },
    { name: "Insurance", color: "#DEE2E6" },
    { name: "Savings", color: "#E9ECEF" },

    // 🎁 Misc
    { name: "Gifts", color: "#F1C0E8" },
    { name: "Miscellaneous", color: "#CED4DA" }
];

async function main() {
    console.log("Seeding tags...");
    for (const tag of tags) {
        await prisma.tag.upsert({
            where: { id: "" }, // We don't have IDs, so we check by name instead if we had a unique constraint
            // But since name is not unique in schema, we just create them
            // To avoid duplicates on re-run, I'll check if they exist first
            update: {},
            create: tag,
        });
    }

    // Realistically, since 'name' isn't unique in the schema, upsert with name won't work easily.
    // I'll just use a direct check.
    for (const tag of tags) {
        const existing = await prisma.tag.findFirst({
            where: { name: tag.name }
        });
        if (!existing) {
            await prisma.tag.create({ data: tag });
            console.log(`Created tag: ${tag.name}`);
        } else {
            console.log(`Tag already exists: ${tag.name}`);
        }
    }
    console.log("Seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
