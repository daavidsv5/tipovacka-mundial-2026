import { PrismaClient, Stage } from "../lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const teams = [
  // Skupina A
  { id: "MEX", name: "Mexiko", flag: "mx", group: "A" },
  { id: "RSA", name: "JAR", flag: "za", group: "A" },
  { id: "KOR", name: "Jižní Korea", flag: "kr", group: "A" },
  { id: "CZE", name: "ČESKO", flag: "cz", group: "A" },
  // Skupina B
  { id: "CAN", name: "Kanada", flag: "ca", group: "B" },
  { id: "QAT", name: "Katar", flag: "qa", group: "B" },
  { id: "SUI", name: "Švýcarsko", flag: "ch", group: "B" },
  { id: "BIH", name: "Bosna a Hercegovina", flag: "ba", group: "B" },
  // Skupina C
  { id: "BRA", name: "Brazílie", flag: "br", group: "C" },
  { id: "MAR", name: "Maroko", flag: "ma", group: "C" },
  { id: "HAI", name: "Haiti", flag: "ht", group: "C" },
  { id: "SCO", name: "Skotsko", flag: "gb-sct", group: "C" },
  // Skupina D
  { id: "USA", name: "USA", flag: "us", group: "D" },
  { id: "PAR", name: "Paraguay", flag: "py", group: "D" },
  { id: "AUS", name: "Austrálie", flag: "au", group: "D" },
  { id: "TUR", name: "Turecko", flag: "tr", group: "D" },
  // Skupina E
  { id: "GER", name: "Německo", flag: "de", group: "E" },
  { id: "CUW", name: "Curaçao", flag: "cw", group: "E" },
  { id: "CIV", name: "Pobřeží slonoviny", flag: "ci", group: "E" },
  { id: "ECU", name: "Ekvádor", flag: "ec", group: "E" },
  // Skupina F
  { id: "NED", name: "Nizozemsko", flag: "nl", group: "F" },
  { id: "JPN", name: "Japonsko", flag: "jp", group: "F" },
  { id: "TUN", name: "Tunisko", flag: "tn", group: "F" },
  { id: "SWE", name: "Švédsko", flag: "se", group: "F" },
  // Skupina G
  { id: "BEL", name: "Belgie", flag: "be", group: "G" },
  { id: "EGY", name: "Egypt", flag: "eg", group: "G" },
  { id: "IRN", name: "Írán", flag: "ir", group: "G" },
  { id: "NZL", name: "Nový Zéland", flag: "nz", group: "G" },
  // Skupina H
  { id: "ESP", name: "Španělsko", flag: "es", group: "H" },
  { id: "CPV", name: "Kapverdy", flag: "cv", group: "H" },
  { id: "KSA", name: "Saúdská Arábie", flag: "sa", group: "H" },
  { id: "URU", name: "Uruguay", flag: "uy", group: "H" },
  // Skupina I
  { id: "FRA", name: "Francie", flag: "fr", group: "I" },
  { id: "SEN", name: "Senegal", flag: "sn", group: "I" },
  { id: "NOR", name: "Norsko", flag: "no", group: "I" },
  { id: "IRQ", name: "Irák", flag: "iq", group: "I" },
  // Skupina J
  { id: "ARG", name: "Argentina", flag: "ar", group: "J" },
  { id: "ALG", name: "Alžírsko", flag: "dz", group: "J" },
  { id: "AUT", name: "Rakousko", flag: "at", group: "J" },
  { id: "JOR", name: "Jordánsko", flag: "jo", group: "J" },
  // Skupina K
  { id: "POR", name: "Portugalsko", flag: "pt", group: "K" },
  { id: "UZB", name: "Uzbekistán", flag: "uz", group: "K" },
  { id: "COL", name: "Kolumbie", flag: "co", group: "K" },
  { id: "COD", name: "DR Kongo", flag: "cd", group: "K" },
  // Skupina L
  { id: "ENG", name: "Anglie", flag: "gb-eng", group: "L" },
  { id: "CRO", name: "Chorvatsko", flag: "hr", group: "L" },
  { id: "GHA", name: "Ghana", flag: "gh", group: "L" },
  { id: "PAN", name: "Panama", flag: "pa", group: "L" },
];

// Zápasy skupinové fáze — datum v UTC (zobrazení v CZ čase +2)
const groupMatches: {
  matchNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  location: string;
  groupName: string;
}[] = [
  // Skupina A
  { matchNumber: 1, homeTeamId: "MEX", awayTeamId: "RSA", date: "2026-06-11T19:00:00Z", location: "Mexiko", groupName: "A" },
  { matchNumber: 2, homeTeamId: "KOR", awayTeamId: "CZE", date: "2026-06-12T02:00:00Z", location: "Guadalajara", groupName: "A" },
  { matchNumber: 3, homeTeamId: "CZE", awayTeamId: "RSA", date: "2026-06-18T16:00:00Z", location: "Atlanta", groupName: "A" },
  { matchNumber: 4, homeTeamId: "MEX", awayTeamId: "KOR", date: "2026-06-19T02:00:00Z", location: "Guadalajara", groupName: "A" },
  { matchNumber: 5, homeTeamId: "CZE", awayTeamId: "MEX", date: "2026-06-25T01:00:00Z", location: "Mexiko", groupName: "A" },
  { matchNumber: 6, homeTeamId: "RSA", awayTeamId: "KOR", date: "2026-06-25T01:00:00Z", location: "Monterrey", groupName: "A" },
  // Skupina B
  { matchNumber: 7, homeTeamId: "CAN", awayTeamId: "BIH", date: "2026-06-12T19:00:00Z", location: "Toronto", groupName: "B" },
  { matchNumber: 8, homeTeamId: "QAT", awayTeamId: "SUI", date: "2026-06-13T19:00:00Z", location: "San Francisco", groupName: "B" },
  { matchNumber: 9, homeTeamId: "SUI", awayTeamId: "BIH", date: "2026-06-18T19:00:00Z", location: "Los Angeles", groupName: "B" },
  { matchNumber: 10, homeTeamId: "CAN", awayTeamId: "QAT", date: "2026-06-19T02:00:00Z", location: "Vancouver", groupName: "B" },
  { matchNumber: 11, homeTeamId: "SUI", awayTeamId: "CAN", date: "2026-06-24T19:00:00Z", location: "Vancouver", groupName: "B" },
  { matchNumber: 12, homeTeamId: "BIH", awayTeamId: "QAT", date: "2026-06-24T19:00:00Z", location: "Seattle", groupName: "B" },
  // Skupina C
  { matchNumber: 13, homeTeamId: "BRA", awayTeamId: "MAR", date: "2026-06-13T22:00:00Z", location: "New York", groupName: "C" },
  { matchNumber: 14, homeTeamId: "HAI", awayTeamId: "SCO", date: "2026-06-14T01:00:00Z", location: "Boston", groupName: "C" },
  { matchNumber: 15, homeTeamId: "SCO", awayTeamId: "MAR", date: "2026-06-20T22:00:00Z", location: "Boston", groupName: "C" },
  { matchNumber: 16, homeTeamId: "BRA", awayTeamId: "HAI", date: "2026-06-21T01:00:00Z", location: "Filadelfie", groupName: "C" },
  { matchNumber: 17, homeTeamId: "SCO", awayTeamId: "BRA", date: "2026-06-24T22:00:00Z", location: "Miami", groupName: "C" },
  { matchNumber: 18, homeTeamId: "MAR", awayTeamId: "HAI", date: "2026-06-24T22:00:00Z", location: "Atlanta", groupName: "C" },
  // Skupina D
  { matchNumber: 19, homeTeamId: "USA", awayTeamId: "PAR", date: "2026-06-13T01:00:00Z", location: "Los Angeles", groupName: "D" },
  { matchNumber: 20, homeTeamId: "AUS", awayTeamId: "TUR", date: "2026-06-13T04:00:00Z", location: "Vancouver", groupName: "D" },
  { matchNumber: 21, homeTeamId: "TUR", awayTeamId: "PAR", date: "2026-06-19T04:00:00Z", location: "San Francisco", groupName: "D" },
  { matchNumber: 22, homeTeamId: "USA", awayTeamId: "AUS", date: "2026-06-19T19:00:00Z", location: "Seattle", groupName: "D" },
  { matchNumber: 23, homeTeamId: "TUR", awayTeamId: "USA", date: "2026-06-26T02:00:00Z", location: "Los Angeles", groupName: "D" },
  { matchNumber: 24, homeTeamId: "PAR", awayTeamId: "AUS", date: "2026-06-26T02:00:00Z", location: "San Francisco", groupName: "D" },
  // Skupina E
  { matchNumber: 25, homeTeamId: "GER", awayTeamId: "CUW", date: "2026-06-14T17:00:00Z", location: "Houston", groupName: "E" },
  { matchNumber: 26, homeTeamId: "CIV", awayTeamId: "ECU", date: "2026-06-14T23:00:00Z", location: "Filadelfie", groupName: "E" },
  { matchNumber: 27, homeTeamId: "GER", awayTeamId: "CIV", date: "2026-06-20T20:00:00Z", location: "Toronto", groupName: "E" },
  { matchNumber: 28, homeTeamId: "ECU", awayTeamId: "CUW", date: "2026-06-21T00:00:00Z", location: "Kansas City", groupName: "E" },
  { matchNumber: 29, homeTeamId: "ECU", awayTeamId: "GER", date: "2026-06-25T20:00:00Z", location: "New York", groupName: "E" },
  { matchNumber: 30, homeTeamId: "CUW", awayTeamId: "CIV", date: "2026-06-25T20:00:00Z", location: "Filadelfie", groupName: "E" },
  // Skupina F
  { matchNumber: 31, homeTeamId: "NED", awayTeamId: "JPN", date: "2026-06-14T20:00:00Z", location: "Dallas", groupName: "F" },
  { matchNumber: 32, homeTeamId: "SWE", awayTeamId: "TUN", date: "2026-06-15T02:00:00Z", location: "Monterrey", groupName: "F" },
  { matchNumber: 33, homeTeamId: "TUN", awayTeamId: "JPN", date: "2026-06-20T04:00:00Z", location: "Monterrey", groupName: "F" },
  { matchNumber: 34, homeTeamId: "NED", awayTeamId: "SWE", date: "2026-06-20T17:00:00Z", location: "Houston", groupName: "F" },
  { matchNumber: 35, homeTeamId: "TUN", awayTeamId: "NED", date: "2026-06-25T23:00:00Z", location: "Kansas City", groupName: "F" },
  { matchNumber: 36, homeTeamId: "JPN", awayTeamId: "SWE", date: "2026-06-25T23:00:00Z", location: "Dallas", groupName: "F" },
  // Skupina G
  { matchNumber: 37, homeTeamId: "BEL", awayTeamId: "EGY", date: "2026-06-15T19:00:00Z", location: "Seattle", groupName: "G" },
  { matchNumber: 38, homeTeamId: "IRN", awayTeamId: "NZL", date: "2026-06-15T23:00:00Z", location: "Los Angeles", groupName: "G" },
  { matchNumber: 39, homeTeamId: "BEL", awayTeamId: "IRN", date: "2026-06-21T19:00:00Z", location: "Los Angeles", groupName: "G" },
  { matchNumber: 40, homeTeamId: "NZL", awayTeamId: "EGY", date: "2026-06-21T01:00:00Z", location: "Vancouver", groupName: "G" },
  { matchNumber: 41, homeTeamId: "NZL", awayTeamId: "BEL", date: "2026-06-27T03:00:00Z", location: "Seattle", groupName: "G" },
  { matchNumber: 42, homeTeamId: "EGY", awayTeamId: "IRN", date: "2026-06-27T03:00:00Z", location: "Vancouver", groupName: "G" },
  // Skupina H
  { matchNumber: 43, homeTeamId: "ESP", awayTeamId: "CPV", date: "2026-06-15T16:00:00Z", location: "Atlanta", groupName: "H" },
  { matchNumber: 44, homeTeamId: "KSA", awayTeamId: "URU", date: "2026-06-15T22:00:00Z", location: "Miami", groupName: "H" },
  { matchNumber: 45, homeTeamId: "ESP", awayTeamId: "KSA", date: "2026-06-21T16:00:00Z", location: "Atlanta", groupName: "H" },
  { matchNumber: 46, homeTeamId: "URU", awayTeamId: "CPV", date: "2026-06-21T22:00:00Z", location: "Miami", groupName: "H" },
  { matchNumber: 47, homeTeamId: "URU", awayTeamId: "ESP", date: "2026-06-27T00:00:00Z", location: "Guadalajara", groupName: "H" },
  { matchNumber: 48, homeTeamId: "CPV", awayTeamId: "KSA", date: "2026-06-27T00:00:00Z", location: "Houston", groupName: "H" },
  // Skupina I
  { matchNumber: 49, homeTeamId: "FRA", awayTeamId: "SEN", date: "2026-06-16T19:00:00Z", location: "New York", groupName: "I" },
  { matchNumber: 50, homeTeamId: "IRQ", awayTeamId: "NOR", date: "2026-06-17T00:00:00Z", location: "Boston", groupName: "I" },
  { matchNumber: 51, homeTeamId: "FRA", awayTeamId: "IRQ", date: "2026-06-22T21:00:00Z", location: "Filadelfie", groupName: "I" },
  { matchNumber: 52, homeTeamId: "NOR", awayTeamId: "SEN", date: "2026-06-23T00:00:00Z", location: "New York", groupName: "I" },
  { matchNumber: 53, homeTeamId: "NOR", awayTeamId: "FRA", date: "2026-06-26T19:00:00Z", location: "Boston", groupName: "I" },
  { matchNumber: 54, homeTeamId: "SEN", awayTeamId: "IRQ", date: "2026-06-26T19:00:00Z", location: "Toronto", groupName: "I" },
  // Skupina J
  { matchNumber: 55, homeTeamId: "ARG", awayTeamId: "ALG", date: "2026-06-17T01:00:00Z", location: "Kansas City", groupName: "J" },
  { matchNumber: 56, homeTeamId: "AUT", awayTeamId: "JOR", date: "2026-06-17T04:00:00Z", location: "San Francisco", groupName: "J" },
  { matchNumber: 57, homeTeamId: "ARG", awayTeamId: "AUT", date: "2026-06-22T17:00:00Z", location: "Dallas", groupName: "J" },
  { matchNumber: 58, homeTeamId: "JOR", awayTeamId: "ALG", date: "2026-06-23T01:00:00Z", location: "San Francisco", groupName: "J" },
  { matchNumber: 59, homeTeamId: "JOR", awayTeamId: "ARG", date: "2026-06-28T02:00:00Z", location: "Dallas", groupName: "J" },
  { matchNumber: 60, homeTeamId: "ALG", awayTeamId: "AUT", date: "2026-06-28T02:00:00Z", location: "Kansas City", groupName: "J" },
  // Skupina K
  { matchNumber: 61, homeTeamId: "POR", awayTeamId: "COD", date: "2026-06-17T17:00:00Z", location: "Houston", groupName: "K" },
  { matchNumber: 62, homeTeamId: "UZB", awayTeamId: "COL", date: "2026-06-18T02:00:00Z", location: "Mexiko", groupName: "K" },
  { matchNumber: 63, homeTeamId: "POR", awayTeamId: "UZB", date: "2026-06-23T17:00:00Z", location: "Houston", groupName: "K" },
  { matchNumber: 64, homeTeamId: "COL", awayTeamId: "COD", date: "2026-06-24T02:00:00Z", location: "Guadalajara", groupName: "K" },
  { matchNumber: 65, homeTeamId: "COL", awayTeamId: "POR", date: "2026-06-27T23:30:00Z", location: "Miami", groupName: "K" },
  { matchNumber: 66, homeTeamId: "COD", awayTeamId: "UZB", date: "2026-06-27T23:30:00Z", location: "Atlanta", groupName: "K" },
  // Skupina L
  { matchNumber: 67, homeTeamId: "ENG", awayTeamId: "CRO", date: "2026-06-17T19:00:00Z", location: "Dallas", groupName: "L" },
  { matchNumber: 68, homeTeamId: "GHA", awayTeamId: "PAN", date: "2026-06-17T23:00:00Z", location: "Toronto", groupName: "L" },
  { matchNumber: 69, homeTeamId: "ENG", awayTeamId: "GHA", date: "2026-06-23T20:00:00Z", location: "Boston", groupName: "L" },
  { matchNumber: 70, homeTeamId: "PAN", awayTeamId: "CRO", date: "2026-06-23T23:00:00Z", location: "Toronto", groupName: "L" },
  { matchNumber: 71, homeTeamId: "PAN", awayTeamId: "ENG", date: "2026-06-27T21:00:00Z", location: "New York", groupName: "L" },
  { matchNumber: 72, homeTeamId: "CRO", awayTeamId: "GHA", date: "2026-06-27T21:00:00Z", location: "Filadelfie", groupName: "L" },
];

// Play-off — TBD sloty (teams doplní admin)
const playoffMatches: {
  matchNumber: number;
  date: string;
  location: string;
  stage: Stage;
  label: string;
}[] = [
  // Šestnáctifinále (R32)
  { matchNumber: 73, date: "2026-06-28T19:00:00Z", location: "Los Angeles", stage: "R32", label: "Šestnáctifinále 1" },
  { matchNumber: 74, date: "2026-06-29T17:00:00Z", location: "Boston", stage: "R32", label: "Šestnáctifinále 2" },
  { matchNumber: 75, date: "2026-06-29T21:30:00Z", location: "Houston", stage: "R32", label: "Šestnáctifinále 3" },
  { matchNumber: 76, date: "2026-06-30T01:00:00Z", location: "Monterrey", stage: "R32", label: "Šestnáctifinále 4" },
  { matchNumber: 77, date: "2026-06-30T17:00:00Z", location: "Dallas", stage: "R32", label: "Šestnáctifinále 5" },
  { matchNumber: 78, date: "2026-06-30T21:00:00Z", location: "New York", stage: "R32", label: "Šestnáctifinále 6" },
  { matchNumber: 79, date: "2026-07-01T01:00:00Z", location: "Mexiko", stage: "R32", label: "Šestnáctifinále 7" },
  { matchNumber: 80, date: "2026-07-01T16:00:00Z", location: "Atlanta", stage: "R32", label: "Šestnáctifinále 8" },
  { matchNumber: 81, date: "2026-07-01T20:00:00Z", location: "Seattle", stage: "R32", label: "Šestnáctifinále 9" },
  { matchNumber: 82, date: "2026-07-02T00:00:00Z", location: "San Francisco", stage: "R32", label: "Šestnáctifinále 10" },
  { matchNumber: 83, date: "2026-07-02T19:00:00Z", location: "Los Angeles", stage: "R32", label: "Šestnáctifinále 11" },
  { matchNumber: 84, date: "2026-07-02T23:00:00Z", location: "Toronto", stage: "R32", label: "Šestnáctifinále 12" },
  { matchNumber: 85, date: "2026-07-03T03:00:00Z", location: "Vancouver", stage: "R32", label: "Šestnáctifinále 13" },
  { matchNumber: 86, date: "2026-07-03T18:00:00Z", location: "Dallas", stage: "R32", label: "Šestnáctifinále 14" },
  { matchNumber: 87, date: "2026-07-03T22:00:00Z", location: "Miami", stage: "R32", label: "Šestnáctifinále 15" },
  { matchNumber: 88, date: "2026-07-04T01:30:00Z", location: "Kansas City", stage: "R32", label: "Šestnáctifinále 16" },
  // Osmifinále (R16)
  { matchNumber: 89, date: "2026-07-04T17:00:00Z", location: "Houston", stage: "R16", label: "Osmifinále 1" },
  { matchNumber: 90, date: "2026-07-04T21:00:00Z", location: "Filadelfie", stage: "R16", label: "Osmifinále 2" },
  { matchNumber: 91, date: "2026-07-05T20:00:00Z", location: "New York", stage: "R16", label: "Osmifinále 3" },
  { matchNumber: 92, date: "2026-07-06T00:00:00Z", location: "Mexiko", stage: "R16", label: "Osmifinále 4" },
  { matchNumber: 93, date: "2026-07-06T19:00:00Z", location: "Dallas", stage: "R16", label: "Osmifinále 5" },
  { matchNumber: 94, date: "2026-07-07T00:00:00Z", location: "Seattle", stage: "R16", label: "Osmifinále 6" },
  { matchNumber: 95, date: "2026-07-07T16:00:00Z", location: "Atlanta", stage: "R16", label: "Osmifinále 7" },
  { matchNumber: 96, date: "2026-07-07T20:00:00Z", location: "Vancouver", stage: "R16", label: "Osmifinále 8" },
  // Čtvrtfinále (QF)
  { matchNumber: 97, date: "2026-07-09T20:00:00Z", location: "Boston", stage: "QF", label: "Čtvrtfinále 1" },
  { matchNumber: 98, date: "2026-07-10T19:00:00Z", location: "Los Angeles", stage: "QF", label: "Čtvrtfinále 2" },
  { matchNumber: 99, date: "2026-07-11T21:00:00Z", location: "Miami", stage: "QF", label: "Čtvrtfinále 3" },
  { matchNumber: 100, date: "2026-07-12T01:00:00Z", location: "Kansas City", stage: "QF", label: "Čtvrtfinále 4" },
  // Semifinále (SF)
  { matchNumber: 101, date: "2026-07-14T19:00:00Z", location: "Dallas", stage: "SF", label: "Semifinále 1" },
  { matchNumber: 102, date: "2026-07-15T19:00:00Z", location: "Atlanta", stage: "SF", label: "Semifinále 2" },
  // O bronz
  { matchNumber: 103, date: "2026-07-18T21:00:00Z", location: "Miami", stage: "BRONZE", label: "O bronz" },
  // Finále
  { matchNumber: 104, date: "2026-07-19T19:00:00Z", location: "New York", stage: "FINAL", label: "Finále" },
];

async function main() {
  console.log("Mazání starých dat...");
  await prisma.tournamentPrediction.deleteMany();
  await prisma.groupPrediction.deleteMany();
  await prisma.matchPrediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seedování týmů...");
  await prisma.team.createMany({ data: teams });

  console.log("Seedování skupinových zápasů...");
  await prisma.match.createMany({
    data: groupMatches.map((m) => ({
      matchNumber: m.matchNumber,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      date: new Date(m.date),
      location: m.location,
      stage: "GROUP" as Stage,
      groupName: m.groupName,
    })),
  });

  console.log("Seedování play-off slotů...");
  await prisma.match.createMany({
    data: playoffMatches.map((m) => ({
      matchNumber: m.matchNumber,
      date: new Date(m.date),
      location: m.location,
      stage: m.stage,
      groupName: null,
    })),
  });

  console.log("Seedování admin účtu...");
  const adminHash = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@mundial2026.cz",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  console.log("Seedování hráčů...");
  const players = [
    { name: "Negr", email: "negr@mundial2026.cz" },
    { name: "Kraťas", email: "kratas@mundial2026.cz" },
    { name: "Pivoňa", email: "pivona@mundial2026.cz" },
    { name: "Trevor", email: "trevor@mundial2026.cz" },
  ];

  for (const player of players) {
    const hash = await bcrypt.hash("heslo123", 12);
    await prisma.user.create({
      data: {
        name: player.name,
        email: player.email,
        passwordHash: hash,
        role: "PLAYER",
      },
    });
  }

  console.log("✅ Seed dokončen:");
  console.log(`  - ${teams.length} týmů`);
  console.log(`  - ${groupMatches.length} skupinových zápasů`);
  console.log(`  - ${playoffMatches.length} play-off slotů`);
  console.log("  - 1 admin + 4 hráči");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
