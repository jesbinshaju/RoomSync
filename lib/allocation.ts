import { prisma } from "./db";

export interface AllocationResult {
  roomsCreated: number;
  studentsAssigned: string[];
  studentsPending: string[];
  averageCompatibility: number;
  roomAssignments: Array<{
    roomId: string;
    roomNumber: string;
    blockName: string;
    students: Array<{ id: string; name: string; score: number }>;
    totalScore: number;
  }>;
}

export async function runAllocation(academicYear: string): Promise<AllocationResult> {
  const result: AllocationResult = {
    roomsCreated: 0,
    studentsAssigned: [],
    studentsPending: [],
    averageCompatibility: 0,
    roomAssignments: [],
  };

  // Step 1: Get all unassigned active students who have filled their characteristics
  const unassigned = await prisma.student.findMany({
    where: {
      isActive: true,
      characteristics: { isNot: null },
      roomAllocations: {
        none: { isActive: true },
      },
    },
    include: { characteristics: true },
    orderBy: { createdAt: "asc" },
  });

  if (unassigned.length < 3) {
    result.studentsPending = unassigned.map((s) => s.id);
    return result;
  }

  const studentIds = unassigned.map((s) => s.id);
  const scoresMap = new Map<string, number>();

  // Step 2: Fetch all compatibility scores for these students
  const scores = await prisma.$queryRaw<
    Array<{ student_a_id: string; student_b_id: string; total_score: number }>
  >`
    SELECT student_a_id, student_b_id, total_score::float
    FROM compatibility_scores
    WHERE student_a_id = ANY(${studentIds}::uuid[])
       OR student_b_id = ANY(${studentIds}::uuid[])
  `;

  for (const row of scores) {
    const key = [row.student_a_id, row.student_b_id].sort().join("-");
    scoresMap.set(key, Number(row.total_score));
  }

  function getScore(a: string, b: string): number {
    const key = [a, b].sort().join("-");
    return scoresMap.get(key) ?? 0;
  }

  // Step 3: Filter out students who have no compatibility scores at all
  // (they haven't filled their profile properly — move them to pending)
  const studentsWithScores = new Set<string>();
  for (const row of scores) {
    studentsWithScores.add(row.student_a_id);
    studentsWithScores.add(row.student_b_id);
  }

  const studentsWithoutScores = unassigned.filter((s) => !studentsWithScores.has(s.id));
  result.studentsPending.push(...studentsWithoutScores.map((s) => s.id));

  // Step 4: Fetch available rooms
  let availableRooms = await prisma.room.findMany({
    where: {
      status: { in: ["available", "partially_filled"] },
      block: { isActive: true },
    },
    include: { block: true, allocations: { where: { isActive: true } } },
  });

  // Only work with students who have scores
  const pool = unassigned.filter((s) => studentsWithScores.has(s.id));

  // Step 5: Main allocation loop — assign groups of 3
  while (pool.length >= 3) {
    const anchor = pool[0];
    let bestPair: [typeof pool[1], typeof pool[2]] | null = null;
    let bestScore = -1;

    for (let i = 1; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const b = pool[i];
        const c = pool[j];

        const hasValidRoom = availableRooms.some(
          (r) =>
            r.allocations.length < 3 &&
            (!r.block.gender ||
              r.block.gender === "mixed" ||
              r.block.gender === anchor.gender)
        );
        if (!hasValidRoom) continue;

        const score =
          getScore(anchor.id, b.id) +
          getScore(anchor.id, c.id) +
          getScore(b.id, c.id);

        if (score > bestScore) {
          bestScore = score;
          bestPair = [b, c];
        }
      }
    }

    if (!bestPair) break;

    const [b, c] = bestPair;

    const genderOk = (r: { block: { gender: string | null } }) =>
      !r.block.gender ||
      r.block.gender === "mixed" ||
      (anchor.gender && r.block.gender === anchor.gender);

    const room = availableRooms.find((r) => r.allocations.length < 3 && genderOk(r));

    if (!room) break;

    // Step 6: Save the 3 allocations AND update room status in one transaction
    await prisma.$transaction([
      prisma.roomAllocation.create({
        data: {
          roomId: room.id,
          studentId: anchor.id,
          allocatedBy: "algorithm",
          academicYear,
        },
      }),
      prisma.roomAllocation.create({
        data: {
          roomId: room.id,
          studentId: b.id,
          allocatedBy: "algorithm",
          academicYear,
        },
      }),
      prisma.roomAllocation.create({
        data: {
          roomId: room.id,
          studentId: c.id,
          allocatedBy: "algorithm",
          academicYear,
        },
      }),
      // ✅ FIX 1: Update room status to "occupied" so it won't be reused
      prisma.room.update({
        where: { id: room.id },
        data: { status: "occupied" },
      }),
    ]);

    result.roomsCreated++;
    result.studentsAssigned.push(anchor.id, b.id, c.id);
    result.roomAssignments.push({
      roomId: room.id,
      roomNumber: room.roomNumber,
      blockName: room.block.blockName,
      students: [
        {
          id: anchor.id,
          name: anchor.fullName,
          score: getScore(anchor.id, b.id) + getScore(anchor.id, c.id),
        },
        {
          id: b.id,
          name: b.fullName,
          score: getScore(b.id, anchor.id) + getScore(b.id, c.id),
        },
        {
          id: c.id,
          name: c.fullName,
          score: getScore(c.id, anchor.id) + getScore(c.id, b.id),
        },
      ],
      totalScore: bestScore,
    });

    // Remove assigned students from pool
    pool.splice(pool.indexOf(c), 1);
    pool.splice(pool.indexOf(b), 1);
    pool.splice(0, 1);

    // ✅ FIX 2: Re-fetch rooms so we always have fresh data (occupied rooms excluded)
    availableRooms = await prisma.room.findMany({
      where: {
        status: { in: ["available", "partially_filled"] },
        block: { isActive: true },
      },
      include: { block: true, allocations: { where: { isActive: true } } },
    });
  }

  // Remaining students couldn't be assigned
  result.studentsPending.push(...pool.map((s) => s.id));

  const totalScore = result.roomAssignments.reduce((s, r) => s + r.totalScore, 0);
  result.averageCompatibility =
    result.roomsCreated > 0 ? totalScore / (result.roomsCreated * 3) : 0;

  return result;
}