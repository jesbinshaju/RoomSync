import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const ACADEMIC_MAJORS = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];
const STUDY_PREF = ["morning", "afternoon", "evening", "night"];
const SLEEP = ["before_10pm", "around_midnight", "after_1am"];
const WAKE = ["before_6am", "6am_to_8am", "after_8am"];
const NAP = ["never", "sometimes", "daily"];
const HOBBIES = ["sports", "music", "gaming", "reading", "art", "cooking", "travel", "photography", "coding", "fitness"];
const GUEST = ["never", "rarely", "often"];
const DIET = ["vegetarian", "non_vegetarian", "vegan", "no_preference"];
const AC = ["always_on", "sometimes", "prefer_off"];
const LIGHT = ["light_sleeper", "moderate", "heavy_sleeper"];
const GOAL = ["top_grades", "balanced", "pass_only"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMany<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

async function main() {
  const passwordHash = await hash("password123", 12);

  const blocks = await Promise.all([
    prisma.hostelBlock.upsert({
      where: { blockName: "A" },
      create: { blockName: "A", gender: "male", totalFloors: 3, wardenName: "Warden A", isActive: true },
      update: {},
    }),
    prisma.hostelBlock.upsert({
      where: { blockName: "B" },
      create: { blockName: "B", gender: "female", totalFloors: 3, wardenName: "Warden B", isActive: true },
      update: {},
    }),
    prisma.hostelBlock.upsert({
      where: { blockName: "C" },
      create: { blockName: "C", gender: "mixed", totalFloors: 3, wardenName: "Warden C", isActive: true },
      update: {},
    }),
  ]);

  const roomTypes = ["standard", "premium", "deluxe"] as const;
  for (const block of blocks) {
    for (let floor = 1; floor <= 3; floor++) {
      for (let r = 1; r <= 4; r++) {
        const roomNum = `${floor}${String(r).padStart(2, "0")}`;
        const rt = roomTypes[floor - 1] || "standard";
        const existing = await prisma.room.findFirst({
          where: { blockId: block.id, roomNumber: roomNum },
        });
        if (!existing) {
          await prisma.room.create({
            data: {
              blockId: block.id,
              roomNumber: roomNum,
              floorNumber: floor,
              roomType: rt,
              hasAc: rt !== "standard",
              hasAttachedBathroom: rt === "deluxe",
              hasBalcony: rt === "deluxe",
            },
          });
        }
      }
    }
  }

  const academicYear = `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`;

  const existingPlan = await prisma.hostelFeePlan.findFirst({
    where: { roomType: "standard", academicYear },
  });
  if (!existingPlan) {
    await prisma.hostelFeePlan.create({
      data: {
        planName: "Standard Plan",
        roomType: "standard",
        academicYear,
        annualFee: 45000,
        securityDeposit: 5000,
        messFeeMonthly: 2500,
        isActive: true,
      },
    });
  }

  const existingPremium = await prisma.hostelFeePlan.findFirst({
    where: { roomType: "premium", academicYear },
  });
  if (!existingPremium) {
    await prisma.hostelFeePlan.create({
      data: {
        planName: "Premium Plan",
        roomType: "premium",
        academicYear,
        annualFee: 60000,
        securityDeposit: 5000,
        messFeeMonthly: 2500,
        isActive: true,
      },
    });
  }

  const existingDeluxe = await prisma.hostelFeePlan.findFirst({
    where: { roomType: "deluxe", academicYear },
  });
  if (!existingDeluxe) {
    await prisma.hostelFeePlan.create({
      data: {
        planName: "Deluxe Plan",
        roomType: "deluxe",
        academicYear,
        annualFee: 80000,
        securityDeposit: 5000,
        messFeeMonthly: 2500,
        isActive: true,
      },
    });
  }

  await prisma.adminUser.upsert({
    where: { email: "admin@roomsync.com" },
    create: {
      name: "Admin User",
      email: "admin@roomsync.com",
      passwordHash,
      role: "superadmin",
      isActive: true,
    },
    update: {},
  });

  const roomsA = await prisma.room.findMany({ where: { block: { blockName: "A" } }, take: 6 });
  const roomsB = await prisma.room.findMany({ where: { block: { blockName: "B" } }, take: 6 });
  const roomsC = await prisma.room.findMany({ where: { block: { blockName: "C" } }, take: 6 });

  const students: Array<{ id: string; gender: string }> = [];

  for (let i = 0; i < 10; i++) {
    const s = await prisma.student.create({
      data: {
        fullName: `Male Student ${i + 1}`,
        email: `male${i + 1}@test.com`,
        passwordHash,
        rollNumber: `M${1000 + i}`,
        department: pick(ACADEMIC_MAJORS),
        yearOfStudy: (i % 5) + 1,
        gender: "male",
        characteristics: {
          create: {
            academicMajor: pick(ACADEMIC_MAJORS),
            studyHoursPerDay: 4 + (i % 8),
            studyTimePreference: pick(STUDY_PREF),
            academicGoal: pick(GOAL),
            sleepTime: pick(SLEEP),
            wakeTime: pick(WAKE),
            napFrequency: pick(NAP),
            hobbies: pickMany(HOBBIES, 3),
            cleanlinessLevel: 2 + (i % 3),
            noiseTolerance: 2 + (i % 3),
            socialLevel: 2 + (i % 3),
            guestFrequency: pick(GUEST),
            smoking: i % 5 === 0,
            drinking: i % 4 === 0,
            dietType: pick(DIET),
            foodInRoom: i % 3 !== 0,
            acPreference: pick(AC),
            lightSensitivity: pick(LIGHT),
          },
        },
      },
    });
    students.push({ id: s.id, gender: "male" });
  }

  for (let i = 0; i < 10; i++) {
    const s = await prisma.student.create({
      data: {
        fullName: `Female Student ${i + 1}`,
        email: `female${i + 1}@test.com`,
        passwordHash,
        rollNumber: `F${1000 + i}`,
        department: pick(ACADEMIC_MAJORS),
        yearOfStudy: (i % 5) + 1,
        gender: "female",
        characteristics: {
          create: {
            academicMajor: pick(ACADEMIC_MAJORS),
            studyHoursPerDay: 4 + (i % 8),
            studyTimePreference: pick(STUDY_PREF),
            academicGoal: pick(GOAL),
            sleepTime: pick(SLEEP),
            wakeTime: pick(WAKE),
            napFrequency: pick(NAP),
            hobbies: pickMany(HOBBIES, 3),
            cleanlinessLevel: 2 + (i % 3),
            noiseTolerance: 2 + (i % 3),
            socialLevel: 2 + (i % 3),
            guestFrequency: pick(GUEST),
            smoking: false,
            drinking: i % 5 === 0,
            dietType: pick(DIET),
            foodInRoom: i % 3 !== 0,
            acPreference: pick(AC),
            lightSensitivity: pick(LIGHT),
          },
        },
      },
    });
    students.push({ id: s.id, gender: "female" });
  }

  for (let i = 0; i < 10; i++) {
    const s = await prisma.student.create({
      data: {
        fullName: `Mixed Student ${i + 1}`,
        email: `mixed${i + 1}@test.com`,
        passwordHash,
        rollNumber: `X${1000 + i}`,
        department: pick(ACADEMIC_MAJORS),
        yearOfStudy: (i % 5) + 1,
        gender: i % 2 === 0 ? "male" : "female",
        characteristics: {
          create: {
            academicMajor: pick(ACADEMIC_MAJORS),
            studyHoursPerDay: 4 + (i % 8),
            studyTimePreference: pick(STUDY_PREF),
            academicGoal: pick(GOAL),
            sleepTime: pick(SLEEP),
            wakeTime: pick(WAKE),
            napFrequency: pick(NAP),
            hobbies: pickMany(HOBBIES, 3),
            cleanlinessLevel: 2 + (i % 3),
            noiseTolerance: 2 + (i % 3),
            socialLevel: 2 + (i % 3),
            guestFrequency: pick(GUEST),
            smoking: false,
            drinking: i % 4 === 0,
            dietType: pick(DIET),
            foodInRoom: true,
            acPreference: pick(AC),
            lightSensitivity: pick(LIGHT),
          },
        },
      },
    });
    students.push({ id: s.id, gender: s.gender || "male" });
  }

  const maleStudents = students.filter((s) => s.gender === "male").slice(0, 18);
  const femaleStudents = students.filter((s) => s.gender === "female").slice(0, 18);
  const mixedStudents = students.filter((s) => s.gender).slice(0, 18);

  const allocatedIds = new Set<string>();

  for (let i = 0; i < 6; i++) {
    const room = roomsA[i];
    if (!room) continue;
    for (let j = 0; j < 3; j++) {
      const st = maleStudents[i * 3 + j];
      if (st && !allocatedIds.has(st.id)) {
        await prisma.roomAllocation.create({
          data: {
            roomId: room.id,
            studentId: st.id,
            allocatedBy: "algorithm",
            academicYear,
          },
        });
        allocatedIds.add(st.id);
      }
    }
  }

  for (let i = 0; i < 6; i++) {
    const room = roomsB[i];
    if (!room) continue;
    for (let j = 0; j < 3; j++) {
      const st = femaleStudents[i * 3 + j];
      if (st && !allocatedIds.has(st.id)) {
        await prisma.roomAllocation.create({
          data: {
            roomId: room.id,
            studentId: st.id,
            allocatedBy: "algorithm",
            academicYear,
          },
        });
        allocatedIds.add(st.id);
      }
    }
  }

  const mixedPool = students.filter((s) => !allocatedIds.has(s.id));
  for (let i = 0; i < 6; i++) {
    const room = roomsC[i];
    if (!room) continue;
    for (let j = 0; j < 3; j++) {
      const st = mixedPool[i * 3 + j];
      if (st && !allocatedIds.has(st.id)) {
        await prisma.roomAllocation.create({
          data: {
            roomId: room.id,
            studentId: st.id,
            allocatedBy: "algorithm",
            academicYear,
          },
        });
        allocatedIds.add(st.id);
      }
    }
  }

  console.log("Seed completed. Admin: admin@roomsync.com / password123");
  console.log("Students: male1@test.com, female1@test.com, etc. / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
