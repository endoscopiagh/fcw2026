import "dotenv/config";

import { MatchPhase, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Falta DATABASE_URL para ejecutar el reordenamiento.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

type OrderedFixture = {
  group: string;
  home: string;
  away: string;
};

const GROUP_STAGE_MATCH_ORDER: OrderedFixture[] = [
  { group: "A", home: "México", away: "Sudáfrica" },
  { group: "A", home: "Corea del Sur", away: "Chequia" },
  { group: "B", home: "Canadá", away: "Bosnia y Herzegovina" },
  { group: "D", home: "Estados Unidos", away: "Paraguay" },
  { group: "B", home: "Catar", away: "Suiza" },
  { group: "C", home: "Brasil", away: "Marruecos" },
  { group: "C", home: "Haití", away: "Escocia" },
  { group: "D", home: "Australia", away: "Turquía" },
  { group: "E", home: "Alemania", away: "Curazao" },
  { group: "F", home: "Países Bajos", away: "Japón" },
  { group: "E", home: "Costa de Marfil", away: "Ecuador" },
  { group: "F", home: "Suecia", away: "Túnez" },
  { group: "H", home: "España", away: "Cabo Verde" },
  { group: "G", home: "Bélgica", away: "Egipto" },
  { group: "H", home: "Arabia Saudita", away: "Uruguay" },
  { group: "G", home: "Irán", away: "Nueva Zelanda" },
  { group: "I", home: "Francia", away: "Senegal" },
  { group: "I", home: "Irak", away: "Noruega" },
  { group: "J", home: "Argentina", away: "Argelia" },
  { group: "J", home: "Austria", away: "Jordania" },
  { group: "K", home: "Portugal", away: "República Democrática del Congo" },
  { group: "L", home: "Inglaterra", away: "Croacia" },
  { group: "L", home: "Ghana", away: "Panamá" },
  { group: "K", home: "Uzbekistán", away: "Colombia" },
  { group: "A", home: "Chequia", away: "Sudáfrica" },
  { group: "B", home: "Suiza", away: "Bosnia y Herzegovina" },
  { group: "B", home: "Canadá", away: "Catar" },
  { group: "A", home: "México", away: "Corea del Sur" },
  { group: "D", home: "Estados Unidos", away: "Australia" },
  { group: "C", home: "Escocia", away: "Marruecos" },
  { group: "C", home: "Brasil", away: "Haití" },
  { group: "D", home: "Turquía", away: "Paraguay" },
  { group: "F", home: "Países Bajos", away: "Suecia" },
  { group: "E", home: "Alemania", away: "Costa de Marfil" },
  { group: "E", home: "Ecuador", away: "Curazao" },
  { group: "F", home: "Túnez", away: "Japón" },
  { group: "H", home: "España", away: "Arabia Saudita" },
  { group: "G", home: "Bélgica", away: "Irán" },
  { group: "H", home: "Uruguay", away: "Cabo Verde" },
  { group: "G", home: "Nueva Zelanda", away: "Egipto" },
  { group: "I", home: "Francia", away: "Irak" },
  { group: "I", home: "Noruega", away: "Senegal" },
  { group: "J", home: "Argentina", away: "Austria" },
  { group: "J", home: "Jordania", away: "Argelia" },
  { group: "K", home: "Portugal", away: "Uzbekistán" },
  { group: "L", home: "Inglaterra", away: "Ghana" },
  { group: "L", home: "Panamá", away: "Croacia" },
  { group: "K", home: "Colombia", away: "República Democrática del Congo" },
  { group: "A", home: "Sudáfrica", away: "Corea del Sur" },
  { group: "A", home: "Chequia", away: "México" },
  { group: "B", home: "Suiza", away: "Canadá" },
  { group: "B", home: "Bosnia y Herzegovina", away: "Catar" },
  { group: "D", home: "Paraguay", away: "Australia" },
  { group: "D", home: "Turquía", away: "Estados Unidos" },
  { group: "C", home: "Brasil", away: "Escocia" },
  { group: "C", home: "Marruecos", away: "Haití" },
  { group: "F", home: "Túnez", away: "Países Bajos" },
  { group: "F", home: "Japón", away: "Suecia" },
  { group: "E", home: "Ecuador", away: "Alemania" },
  { group: "E", home: "Curazao", away: "Costa de Marfil" },
  { group: "G", home: "Nueva Zelanda", away: "Bélgica" },
  { group: "G", home: "Egipto", away: "Irán" },
  { group: "H", home: "Uruguay", away: "España" },
  { group: "H", home: "Cabo Verde", away: "Arabia Saudita" },
  { group: "I", home: "Noruega", away: "Francia" },
  { group: "I", home: "Senegal", away: "Irak" },
  { group: "L", home: "Panamá", away: "Inglaterra" },
  { group: "L", home: "Croacia", away: "Ghana" },
  { group: "K", home: "Colombia", away: "Portugal" },
  { group: "K", home: "República Democrática del Congo", away: "Uzbekistán" },
  { group: "J", home: "Argelia", away: "Austria" },
  { group: "J", home: "Jordania", away: "Argentina" },
];

function fixtureKey(group: string, home: string, away: string) {
  return `${group}|${home}|${away}`;
}

async function main() {
  if (GROUP_STAGE_MATCH_ORDER.length !== 72) {
    throw new Error(`El orden esperado de grupos debe contener 72 partidos y contiene ${GROUP_STAGE_MATCH_ORDER.length}.`);
  }

  const matches = await prisma.matches.findMany({
    where: {
      phase: MatchPhase.GROUP_STAGE,
    },
    include: {
      home_team: { select: { name: true } },
      away_team: { select: { name: true } },
    },
  });

  if (matches.length !== 72) {
    throw new Error(`Se esperaban 72 partidos de grupos en BD y se encontraron ${matches.length}.`);
  }

  const matchByKey = new Map<string, (typeof matches)[number]>();
  for (const match of matches) {
    const key = fixtureKey(
      match.group_letter ?? "",
      match.home_team?.name ?? "",
      match.away_team?.name ?? "",
    );
    matchByKey.set(key, match);
  }

  const orderedMatches = GROUP_STAGE_MATCH_ORDER.map((item) => {
    const key = fixtureKey(item.group, item.home, item.away);
    const match = matchByKey.get(key);
    if (!match) {
      throw new Error(`No se encontró en BD el partido: ${item.home} vs ${item.away} (${item.group}).`);
    }
    return match;
  });

  for (const [index, match] of orderedMatches.entries()) {
    await prisma.matches.update({
      where: { id: match.id },
      data: { match_number: 1000 + index + 1 },
    });
  }

  for (const [index, match] of orderedMatches.entries()) {
    await prisma.matches.update({
      where: { id: match.id },
      data: { match_number: index + 1 },
    });
  }

  console.log("Reordenamiento aplicado: partidos de fase de grupos ahora van del 1 al 72 según el orden definido.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Error al reordenar partidos:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
