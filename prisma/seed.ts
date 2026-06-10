import "dotenv/config";

import { MatchPhase, MatchStatus, PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { hashPassword } from "../lib/auth/password";
import { GROUP_STAGE_DEADLINE_CDMX_ISO, TOURNAMENT_PHASE_ORDER } from "../lib/constants/tournament";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Falta DATABASE_URL para ejecutar el seed.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

type TeamSeed = {
  name: string;
  short_name: string;
  flag_emoji: string;
};

const GROUPS: Record<string, TeamSeed[]> = {
  A: [
    { name: "México", short_name: "MEX", flag_emoji: "🇲🇽" },
    { name: "Sudáfrica", short_name: "RSA", flag_emoji: "🇿🇦" },
    { name: "Corea del Sur", short_name: "KOR", flag_emoji: "🇰🇷" },
    { name: "Chequia", short_name: "CZE", flag_emoji: "🇨🇿" },
  ],
  B: [
    { name: "Canadá", short_name: "CAN", flag_emoji: "🇨🇦" },
    { name: "Bosnia y Herzegovina", short_name: "BIH", flag_emoji: "🇧🇦" },
    { name: "Catar", short_name: "QAT", flag_emoji: "🇶🇦" },
    { name: "Suiza", short_name: "SUI", flag_emoji: "🇨🇭" },
  ],
  C: [
    { name: "Brasil", short_name: "BRA", flag_emoji: "🇧🇷" },
    { name: "Marruecos", short_name: "MAR", flag_emoji: "🇲🇦" },
    { name: "Haití", short_name: "HAI", flag_emoji: "🇭🇹" },
    {
      name: "Escocia",
      short_name: "SCO",
      flag_emoji: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
    },
  ],
  D: [
    { name: "Estados Unidos", short_name: "USA", flag_emoji: "🇺🇸" },
    { name: "Paraguay", short_name: "PAR", flag_emoji: "🇵🇾" },
    { name: "Australia", short_name: "AUS", flag_emoji: "🇦🇺" },
    { name: "Turquía", short_name: "TUR", flag_emoji: "🇹🇷" },
  ],
  E: [
    { name: "Alemania", short_name: "GER", flag_emoji: "🇩🇪" },
    { name: "Curazao", short_name: "CUW", flag_emoji: "🇨🇼" },
    { name: "Costa de Marfil", short_name: "CIV", flag_emoji: "🇨🇮" },
    { name: "Ecuador", short_name: "ECU", flag_emoji: "🇪🇨" },
  ],
  F: [
    { name: "Países Bajos", short_name: "NED", flag_emoji: "🇳🇱" },
    { name: "Japón", short_name: "JPN", flag_emoji: "🇯🇵" },
    { name: "Suecia", short_name: "SWE", flag_emoji: "🇸🇪" },
    { name: "Túnez", short_name: "TUN", flag_emoji: "🇹🇳" },
  ],
  G: [
    { name: "Bélgica", short_name: "BEL", flag_emoji: "🇧🇪" },
    { name: "Egipto", short_name: "EGY", flag_emoji: "🇪🇬" },
    { name: "Irán", short_name: "IRN", flag_emoji: "🇮🇷" },
    { name: "Nueva Zelanda", short_name: "NZL", flag_emoji: "🇳🇿" },
  ],
  H: [
    { name: "España", short_name: "ESP", flag_emoji: "🇪🇸" },
    { name: "Cabo Verde", short_name: "CPV", flag_emoji: "🇨🇻" },
    { name: "Arabia Saudita", short_name: "KSA", flag_emoji: "🇸🇦" },
    { name: "Uruguay", short_name: "URU", flag_emoji: "🇺🇾" },
  ],
  I: [
    { name: "Francia", short_name: "FRA", flag_emoji: "🇫🇷" },
    { name: "Senegal", short_name: "SEN", flag_emoji: "🇸🇳" },
    { name: "Irak", short_name: "IRQ", flag_emoji: "🇮🇶" },
    { name: "Noruega", short_name: "NOR", flag_emoji: "🇳🇴" },
  ],
  J: [
    { name: "Argentina", short_name: "ARG", flag_emoji: "🇦🇷" },
    { name: "Argelia", short_name: "ALG", flag_emoji: "🇩🇿" },
    { name: "Austria", short_name: "AUT", flag_emoji: "🇦🇹" },
    { name: "Jordania", short_name: "JOR", flag_emoji: "🇯🇴" },
  ],
  K: [
    { name: "Portugal", short_name: "POR", flag_emoji: "🇵🇹" },
    { name: "República Democrática del Congo", short_name: "COD", flag_emoji: "🇨🇩" },
    { name: "Uzbekistán", short_name: "UZB", flag_emoji: "🇺🇿" },
    { name: "Colombia", short_name: "COL", flag_emoji: "🇨🇴" },
  ],
  L: [
    {
      name: "Inglaterra",
      short_name: "ENG",
      flag_emoji: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
    },
    { name: "Croacia", short_name: "CRO", flag_emoji: "🇭🇷" },
    { name: "Ghana", short_name: "GHA", flag_emoji: "🇬🇭" },
    { name: "Panamá", short_name: "PAN", flag_emoji: "🇵🇦" },
  ],
};

type GroupStageFixtureSeed = {
  group: keyof typeof GROUPS;
  home: string;
  away: string;
  kickoffEtIso: string;
  venue: string;
  city: string;
};

type GroupStageMatchOrderSeed = {
  group: keyof typeof GROUPS;
  home: string;
  away: string;
};

// Fuente: calendario FIFA 2026 fase de grupos (horarios ET), convertido a ISO con offset -04:00.
const GROUP_STAGE_FIXTURES: GroupStageFixtureSeed[] = [
  { group: "A", home: "México", away: "Sudáfrica", kickoffEtIso: "2026-06-11T15:00:00-04:00", venue: "Estadio Ciudad de México", city: "Ciudad de México" },
  { group: "A", home: "Corea del Sur", away: "Chequia", kickoffEtIso: "2026-06-11T22:00:00-04:00", venue: "Estadio Guadalajara", city: "Guadalajara" },
  { group: "A", home: "Chequia", away: "Sudáfrica", kickoffEtIso: "2026-06-18T12:00:00-04:00", venue: "Atlanta Stadium", city: "Atlanta" },
  { group: "A", home: "México", away: "Corea del Sur", kickoffEtIso: "2026-06-18T21:00:00-04:00", venue: "Estadio Guadalajara", city: "Guadalajara" },
  { group: "A", home: "Chequia", away: "México", kickoffEtIso: "2026-06-24T21:00:00-04:00", venue: "Estadio Ciudad de México", city: "Ciudad de México" },
  { group: "A", home: "Sudáfrica", away: "Corea del Sur", kickoffEtIso: "2026-06-24T21:00:00-04:00", venue: "Estadio Monterrey", city: "Monterrey" },

  { group: "B", home: "Canadá", away: "Bosnia y Herzegovina", kickoffEtIso: "2026-06-12T15:00:00-04:00", venue: "Toronto Stadium", city: "Toronto" },
  { group: "B", home: "Catar", away: "Suiza", kickoffEtIso: "2026-06-13T15:00:00-04:00", venue: "San Francisco Bay Area Stadium", city: "San Francisco Bay Area" },
  { group: "B", home: "Suiza", away: "Bosnia y Herzegovina", kickoffEtIso: "2026-06-18T15:00:00-04:00", venue: "Los Angeles Stadium", city: "Los Ángeles" },
  { group: "B", home: "Canadá", away: "Catar", kickoffEtIso: "2026-06-18T18:00:00-04:00", venue: "BC Place Vancouver", city: "Vancouver" },
  { group: "B", home: "Suiza", away: "Canadá", kickoffEtIso: "2026-06-24T15:00:00-04:00", venue: "BC Place Vancouver", city: "Vancouver" },
  { group: "B", home: "Bosnia y Herzegovina", away: "Catar", kickoffEtIso: "2026-06-24T15:00:00-04:00", venue: "Seattle Stadium", city: "Seattle" },

  { group: "C", home: "Brasil", away: "Marruecos", kickoffEtIso: "2026-06-13T18:00:00-04:00", venue: "Nueva York Nueva Jersey Stadium", city: "Nueva York / Nueva Jersey" },
  { group: "C", home: "Haití", away: "Escocia", kickoffEtIso: "2026-06-13T21:00:00-04:00", venue: "Boston Stadium", city: "Boston" },
  { group: "C", home: "Escocia", away: "Marruecos", kickoffEtIso: "2026-06-19T18:00:00-04:00", venue: "Boston Stadium", city: "Boston" },
  { group: "C", home: "Brasil", away: "Haití", kickoffEtIso: "2026-06-19T21:00:00-04:00", venue: "Philadelphia Stadium", city: "Philadelphia" },
  { group: "C", home: "Brasil", away: "Escocia", kickoffEtIso: "2026-06-24T18:00:00-04:00", venue: "Miami Stadium", city: "Miami" },
  { group: "C", home: "Marruecos", away: "Haití", kickoffEtIso: "2026-06-24T18:00:00-04:00", venue: "Atlanta Stadium", city: "Atlanta" },

  { group: "D", home: "Estados Unidos", away: "Paraguay", kickoffEtIso: "2026-06-12T21:00:00-04:00", venue: "Los Angeles Stadium", city: "Los Ángeles" },
  { group: "D", home: "Australia", away: "Turquía", kickoffEtIso: "2026-06-13T00:00:00-04:00", venue: "BC Place Vancouver", city: "Vancouver" },
  { group: "D", home: "Estados Unidos", away: "Australia", kickoffEtIso: "2026-06-19T15:00:00-04:00", venue: "Seattle Stadium", city: "Seattle" },
  { group: "D", home: "Turquía", away: "Paraguay", kickoffEtIso: "2026-06-19T00:00:00-04:00", venue: "San Francisco Bay Area Stadium", city: "San Francisco Bay Area" },
  { group: "D", home: "Turquía", away: "Estados Unidos", kickoffEtIso: "2026-06-25T22:00:00-04:00", venue: "Los Angeles Stadium", city: "Los Ángeles" },
  { group: "D", home: "Paraguay", away: "Australia", kickoffEtIso: "2026-06-25T22:00:00-04:00", venue: "San Francisco Bay Area Stadium", city: "San Francisco Bay Area" },

  { group: "E", home: "Alemania", away: "Curazao", kickoffEtIso: "2026-06-14T13:00:00-04:00", venue: "Houston Stadium", city: "Houston" },
  { group: "E", home: "Costa de Marfil", away: "Ecuador", kickoffEtIso: "2026-06-14T19:00:00-04:00", venue: "Philadelphia Stadium", city: "Philadelphia" },
  { group: "E", home: "Alemania", away: "Costa de Marfil", kickoffEtIso: "2026-06-20T16:00:00-04:00", venue: "Toronto Stadium", city: "Toronto" },
  { group: "E", home: "Ecuador", away: "Curazao", kickoffEtIso: "2026-06-20T22:00:00-04:00", venue: "Kansas City Stadium", city: "Kansas City" },
  { group: "E", home: "Curazao", away: "Costa de Marfil", kickoffEtIso: "2026-06-25T16:00:00-04:00", venue: "Philadelphia Stadium", city: "Philadelphia" },
  { group: "E", home: "Ecuador", away: "Alemania", kickoffEtIso: "2026-06-25T16:00:00-04:00", venue: "New York New Jersey Stadium", city: "Nueva York / Nueva Jersey" },

  { group: "F", home: "Países Bajos", away: "Japón", kickoffEtIso: "2026-06-14T16:00:00-04:00", venue: "Dallas Stadium", city: "Dallas" },
  { group: "F", home: "Suecia", away: "Túnez", kickoffEtIso: "2026-06-14T22:00:00-04:00", venue: "Estadio Monterrey", city: "Monterrey" },
  { group: "F", home: "Países Bajos", away: "Suecia", kickoffEtIso: "2026-06-20T13:00:00-04:00", venue: "Houston Stadium", city: "Houston" },
  { group: "F", home: "Túnez", away: "Japón", kickoffEtIso: "2026-06-20T00:00:00-04:00", venue: "Estadio Monterrey", city: "Monterrey" },
  { group: "F", home: "Japón", away: "Suecia", kickoffEtIso: "2026-06-25T19:00:00-04:00", venue: "Dallas Stadium", city: "Dallas" },
  { group: "F", home: "Túnez", away: "Países Bajos", kickoffEtIso: "2026-06-25T19:00:00-04:00", venue: "Kansas City Stadium", city: "Kansas City" },

  { group: "G", home: "Bélgica", away: "Egipto", kickoffEtIso: "2026-06-15T15:00:00-04:00", venue: "Seattle Stadium", city: "Seattle" },
  { group: "G", home: "Irán", away: "Nueva Zelanda", kickoffEtIso: "2026-06-15T21:00:00-04:00", venue: "Los Angeles Stadium", city: "Los Ángeles" },
  { group: "G", home: "Bélgica", away: "Irán", kickoffEtIso: "2026-06-21T15:00:00-04:00", venue: "Los Angeles Stadium", city: "Los Ángeles" },
  { group: "G", home: "Nueva Zelanda", away: "Egipto", kickoffEtIso: "2026-06-21T21:00:00-04:00", venue: "BC Place Vancouver", city: "Vancouver" },
  { group: "G", home: "Egipto", away: "Irán", kickoffEtIso: "2026-06-26T23:00:00-04:00", venue: "Seattle Stadium", city: "Seattle" },
  { group: "G", home: "Nueva Zelanda", away: "Bélgica", kickoffEtIso: "2026-06-26T23:00:00-04:00", venue: "BC Place Vancouver", city: "Vancouver" },

  { group: "H", home: "España", away: "Cabo Verde", kickoffEtIso: "2026-06-15T12:00:00-04:00", venue: "Atlanta Stadium", city: "Atlanta" },
  { group: "H", home: "Arabia Saudita", away: "Uruguay", kickoffEtIso: "2026-06-15T18:00:00-04:00", venue: "Miami Stadium", city: "Miami" },
  { group: "H", home: "España", away: "Arabia Saudita", kickoffEtIso: "2026-06-21T12:00:00-04:00", venue: "Atlanta Stadium", city: "Atlanta" },
  { group: "H", home: "Uruguay", away: "Cabo Verde", kickoffEtIso: "2026-06-21T18:00:00-04:00", venue: "Miami Stadium", city: "Miami" },
  { group: "H", home: "Cabo Verde", away: "Arabia Saudita", kickoffEtIso: "2026-06-26T20:00:00-04:00", venue: "Houston Stadium", city: "Houston" },
  { group: "H", home: "Uruguay", away: "España", kickoffEtIso: "2026-06-26T20:00:00-04:00", venue: "Estadio Guadalajara", city: "Guadalajara" },

  { group: "I", home: "Francia", away: "Senegal", kickoffEtIso: "2026-06-16T15:00:00-04:00", venue: "New York New Jersey Stadium", city: "Nueva York / Nueva Jersey" },
  { group: "I", home: "Irak", away: "Noruega", kickoffEtIso: "2026-06-16T18:00:00-04:00", venue: "Boston Stadium", city: "Boston" },
  { group: "I", home: "Francia", away: "Irak", kickoffEtIso: "2026-06-22T17:00:00-04:00", venue: "Philadelphia Stadium", city: "Philadelphia" },
  { group: "I", home: "Noruega", away: "Senegal", kickoffEtIso: "2026-06-22T20:00:00-04:00", venue: "New York New Jersey Stadium", city: "Nueva York / Nueva Jersey" },
  { group: "I", home: "Noruega", away: "Francia", kickoffEtIso: "2026-06-26T15:00:00-04:00", venue: "Boston Stadium", city: "Boston" },
  { group: "I", home: "Senegal", away: "Irak", kickoffEtIso: "2026-06-26T15:00:00-04:00", venue: "Toronto Stadium", city: "Toronto" },

  { group: "J", home: "Argentina", away: "Argelia", kickoffEtIso: "2026-06-16T21:00:00-04:00", venue: "Kansas City Stadium", city: "Kansas City" },
  { group: "J", home: "Austria", away: "Jordania", kickoffEtIso: "2026-06-16T00:00:00-04:00", venue: "San Francisco Bay Area Stadium", city: "San Francisco Bay Area" },
  { group: "J", home: "Argentina", away: "Austria", kickoffEtIso: "2026-06-22T13:00:00-04:00", venue: "Dallas Stadium", city: "Dallas" },
  { group: "J", home: "Jordania", away: "Argelia", kickoffEtIso: "2026-06-22T23:00:00-04:00", venue: "San Francisco Bay Area Stadium", city: "San Francisco Bay Area" },
  { group: "J", home: "Argelia", away: "Austria", kickoffEtIso: "2026-06-27T22:00:00-04:00", venue: "Kansas City Stadium", city: "Kansas City" },
  { group: "J", home: "Jordania", away: "Argentina", kickoffEtIso: "2026-06-27T22:00:00-04:00", venue: "Dallas Stadium", city: "Dallas" },

  { group: "K", home: "Portugal", away: "República Democrática del Congo", kickoffEtIso: "2026-06-17T13:00:00-04:00", venue: "Houston Stadium", city: "Houston" },
  { group: "K", home: "Uzbekistán", away: "Colombia", kickoffEtIso: "2026-06-17T22:00:00-04:00", venue: "Estadio Ciudad de México", city: "Ciudad de México" },
  { group: "K", home: "Portugal", away: "Uzbekistán", kickoffEtIso: "2026-06-23T13:00:00-04:00", venue: "Houston Stadium", city: "Houston" },
  { group: "K", home: "Colombia", away: "República Democrática del Congo", kickoffEtIso: "2026-06-23T22:00:00-04:00", venue: "Estadio Guadalajara", city: "Guadalajara" },
  { group: "K", home: "Colombia", away: "Portugal", kickoffEtIso: "2026-06-27T19:30:00-04:00", venue: "Miami Stadium", city: "Miami" },
  { group: "K", home: "República Democrática del Congo", away: "Uzbekistán", kickoffEtIso: "2026-06-27T19:30:00-04:00", venue: "Atlanta Stadium", city: "Atlanta" },

  { group: "L", home: "Inglaterra", away: "Croacia", kickoffEtIso: "2026-06-17T16:00:00-04:00", venue: "Dallas Stadium", city: "Dallas" },
  { group: "L", home: "Ghana", away: "Panamá", kickoffEtIso: "2026-06-17T19:00:00-04:00", venue: "Toronto Stadium", city: "Toronto" },
  { group: "L", home: "Inglaterra", away: "Ghana", kickoffEtIso: "2026-06-23T16:00:00-04:00", venue: "Boston Stadium", city: "Boston" },
  { group: "L", home: "Panamá", away: "Croacia", kickoffEtIso: "2026-06-23T19:00:00-04:00", venue: "Toronto Stadium", city: "Toronto" },
  { group: "L", home: "Panamá", away: "Inglaterra", kickoffEtIso: "2026-06-27T17:00:00-04:00", venue: "New York New Jersey Stadium", city: "Nueva York / Nueva Jersey" },
  { group: "L", home: "Croacia", away: "Ghana", kickoffEtIso: "2026-06-27T17:00:00-04:00", venue: "Philadelphia Stadium", city: "Philadelphia" },
];

const GROUP_STAGE_MATCH_ORDER: GroupStageMatchOrderSeed[] = [
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

const GROUP_STAGE_MATCH_COUNT = 72;

function buildKickoffDate(baseDayOffset: number, slot: number): Date {
  const kickoff = new Date(Date.UTC(2026, 5, 11, 18, 0, 0)); // 2026-06-11 12:00 CDMX
  kickoff.setUTCDate(kickoff.getUTCDate() + baseDayOffset);
  kickoff.setUTCHours(18 + slot * 3, 0, 0, 0);
  return kickoff;
}

async function seedUsers() {
  const initialAdminUsername = process.env.INITIAL_ADMIN_USERNAME;
  const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (!initialAdminUsername || !initialAdminPassword) {
    throw new Error("Faltan INITIAL_ADMIN_USERNAME o INITIAL_ADMIN_PASSWORD en variables de entorno.");
  }

  const passwordHash = await hashPassword(initialAdminPassword);

  await prisma.users.upsert({
    where: { username: initialAdminUsername },
    update: {
      password_hash: passwordHash,
      role: UserRole.admin,
      is_active: true,
      has_paid: true,
      display_name: "Administrador",
    },
    create: {
      username: initialAdminUsername,
      display_name: "Administrador",
      password_hash: passwordHash,
      role: UserRole.admin,
      is_active: true,
      has_paid: true,
    },
  });
}

async function seedTeamsAndMatches() {
  const teamByName = new Map<string, { id: string; group_letter: string }>();

  for (const [groupLetter, teams] of Object.entries(GROUPS)) {
    for (const team of teams) {
      const created = await prisma.teams.create({
        data: {
          ...team,
          group_letter: groupLetter,
        },
      });
      teamByName.set(team.name, { id: created.id, group_letter: groupLetter });
    }
  }

  if (GROUP_STAGE_FIXTURES.length !== GROUP_STAGE_MATCH_COUNT) {
    throw new Error(`Se esperaban ${GROUP_STAGE_MATCH_COUNT} partidos de grupos y hay ${GROUP_STAGE_FIXTURES.length}.`);
  }

  if (GROUP_STAGE_MATCH_ORDER.length !== GROUP_STAGE_MATCH_COUNT) {
    throw new Error(
      `Se esperaban ${GROUP_STAGE_MATCH_COUNT} partidos en el orden de grupos y hay ${GROUP_STAGE_MATCH_ORDER.length}.`,
    );
  }

  const fixtureByKey = new Map<string, GroupStageFixtureSeed>();
  for (const fixture of GROUP_STAGE_FIXTURES) {
    const key = `${fixture.group}|${fixture.home}|${fixture.away}`;
    fixtureByKey.set(key, fixture);
  }

  let matchNumber = 1;
  for (const orderItem of GROUP_STAGE_MATCH_ORDER) {
    const fixtureKey = `${orderItem.group}|${orderItem.home}|${orderItem.away}`;
    const fixture = fixtureByKey.get(fixtureKey);
    if (!fixture) {
      throw new Error(
        `No se encontró el fixture para orden: ${orderItem.home} vs ${orderItem.away} (${orderItem.group}).`,
      );
    }

    const home = teamByName.get(fixture.home);
    const away = teamByName.get(fixture.away);

    if (!home || !away) {
      throw new Error(
        `No se encontró un equipo al generar fixture: ${fixture.home} vs ${fixture.away} (${fixture.group}).`,
      );
    }

    await prisma.matches.create({
      data: {
        match_number: matchNumber++,
        phase: MatchPhase.GROUP_STAGE,
        group_letter: fixture.group,
        home_team_id: home.id,
        away_team_id: away.id,
        kickoff_at: new Date(fixture.kickoffEtIso),
        venue: fixture.venue,
        city: fixture.city,
        status: MatchStatus.scheduled,
      },
    });
  }
}

async function seedKnockoutPlaceholders(startingMatchNumber: number) {
  const phaseBlueprint: Array<{ phase: MatchPhase; count: number; city: string }> = [
    { phase: MatchPhase.ROUND_OF_32, count: 16, city: "Guadalajara" },
    { phase: MatchPhase.ROUND_OF_16, count: 8, city: "Monterrey" },
    { phase: MatchPhase.QUARTER_FINAL, count: 4, city: "Dallas" },
    { phase: MatchPhase.SEMI_FINAL, count: 2, city: "Atlanta" },
    { phase: MatchPhase.THIRD_PLACE, count: 1, city: "Los Ángeles" },
    { phase: MatchPhase.FINAL, count: 1, city: "Nueva York / Nueva Jersey" },
  ];

  let matchNumber = startingMatchNumber;
  let dayOffset = 28;

  for (const item of phaseBlueprint) {
    for (let i = 0; i < item.count; i++) {
      await prisma.matches.create({
        data: {
          match_number: matchNumber++,
          phase: item.phase,
          kickoff_at: buildKickoffDate(dayOffset, i % 2),
          venue: `Sede ${item.city}`,
          city: item.city,
          status: MatchStatus.scheduled,
        },
      });
    }

    dayOffset += 4;
  }
}

async function seedPhaseLocks() {
  for (const phase of TOURNAMENT_PHASE_ORDER) {
    const isGroupStage = phase === MatchPhase.GROUP_STAGE;
    await prisma.phase_locks.upsert({
      where: { phase },
      update: {
        is_enabled: isGroupStage,
        prediction_deadline: isGroupStage ? new Date(GROUP_STAGE_DEADLINE_CDMX_ISO) : null,
      },
      create: {
        phase,
        is_enabled: isGroupStage,
        prediction_deadline: isGroupStage ? new Date(GROUP_STAGE_DEADLINE_CDMX_ISO) : null,
      },
    });
  }
}

async function main() {
  await prisma.predictions.deleteMany();
  await prisma.matches.deleteMany();
  await prisma.teams.deleteMany();
  await prisma.phase_locks.deleteMany();

  await seedUsers();
  await seedTeamsAndMatches();
  await seedKnockoutPlaceholders(73);
  await seedPhaseLocks();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Error al ejecutar seed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
