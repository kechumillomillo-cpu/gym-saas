import { PrismaClient, Difficulty } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const EXERCISE_CATEGORIES = [
  { name: 'Pecho', slug: 'pecho' },
  { name: 'Espalda', slug: 'espalda' },
  { name: 'Hombros', slug: 'hombros' },
  { name: 'Bíceps', slug: 'biceps' },
  { name: 'Tríceps', slug: 'triceps' },
  { name: 'Piernas', slug: 'piernas' },
  { name: 'Glúteos', slug: 'gluteos' },
  { name: 'Abdominales', slug: 'abdominales' },
  { name: 'Cardio', slug: 'cardio' },
  { name: 'Full Body', slug: 'full-body' },
]

const EXERCISES = [
  // PECHO
  { name: 'Press Banca Plano', category: 'pecho', muscles: ['Pectoral mayor', 'Tríceps', 'Deltoides anterior'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Barra', 'Banco'] },
  { name: 'Press Banca Inclinado', category: 'pecho', muscles: ['Pectoral superior', 'Deltoides anterior'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Barra', 'Banco inclinado'] },
  { name: 'Press Banca Declinado', category: 'pecho', muscles: ['Pectoral inferior', 'Tríceps'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Barra', 'Banco declinado'] },
  { name: 'Aperturas con Mancuernas', category: 'pecho', muscles: ['Pectoral mayor'], difficulty: Difficulty.BEGINNER, equipment: ['Mancuernas', 'Banco'] },
  { name: 'Fondos en Paralelas', category: 'pecho', muscles: ['Pectoral', 'Tríceps', 'Deltoides'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Paralelas'] },
  { name: 'Flexiones', category: 'pecho', muscles: ['Pectoral', 'Tríceps', 'Core'], difficulty: Difficulty.BEGINNER, equipment: [] },
  { name: 'Pull-over con Mancuerna', category: 'pecho', muscles: ['Pectoral', 'Dorsal ancho'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Mancuerna', 'Banco'] },
  { name: 'Cruce de Poleas', category: 'pecho', muscles: ['Pectoral mayor'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Poleas'] },
  { name: 'Press Pecho Máquina', category: 'pecho', muscles: ['Pectoral mayor', 'Tríceps'], difficulty: Difficulty.BEGINNER, equipment: ['Máquina press pecho'] },
  { name: 'Aperturas en Máquina (Pec Deck)', category: 'pecho', muscles: ['Pectoral mayor'], difficulty: Difficulty.BEGINNER, equipment: ['Máquina pec deck'] },
  // ESPALDA
  { name: 'Dominadas', category: 'espalda', muscles: ['Dorsal ancho', 'Bíceps', 'Romboides'], difficulty: Difficulty.ADVANCED, equipment: ['Barra de dominadas'] },
  { name: 'Remo con Barra', category: 'espalda', muscles: ['Dorsal ancho', 'Trapecios', 'Romboides'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Barra'] },
  { name: 'Remo con Mancuerna', category: 'espalda', muscles: ['Dorsal ancho', 'Romboides'], difficulty: Difficulty.BEGINNER, equipment: ['Mancuerna', 'Banco'] },
  { name: 'Jalón al Pecho', category: 'espalda', muscles: ['Dorsal ancho', 'Bíceps'], difficulty: Difficulty.BEGINNER, equipment: ['Polea alta'] },
  { name: 'Jalón Trasnuca', category: 'espalda', muscles: ['Dorsal ancho', 'Trapecios'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Polea alta'] },
  { name: 'Remo en Máquina', category: 'espalda', muscles: ['Dorsal ancho', 'Romboides'], difficulty: Difficulty.BEGINNER, equipment: ['Máquina remo'] },
  { name: 'Peso Muerto', category: 'espalda', muscles: ['Erector espinal', 'Glúteos', 'Isquiotibiales'], difficulty: Difficulty.ADVANCED, equipment: ['Barra'] },
  { name: 'Hiperextensiones', category: 'espalda', muscles: ['Erector espinal', 'Glúteos'], difficulty: Difficulty.BEGINNER, equipment: ['Banco romano'] },
  { name: 'Face Pull', category: 'espalda', muscles: ['Deltoides posterior', 'Romboides', 'Trapecios'], difficulty: Difficulty.BEGINNER, equipment: ['Polea alta'] },
  { name: 'Encogimientos con Barra', category: 'espalda', muscles: ['Trapecios superiores'], difficulty: Difficulty.BEGINNER, equipment: ['Barra'] },
  // HOMBROS
  { name: 'Press Militar', category: 'hombros', muscles: ['Deltoides anterior', 'Trapecios', 'Tríceps'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Barra'] },
  { name: 'Press con Mancuernas', category: 'hombros', muscles: ['Deltoides', 'Tríceps'], difficulty: Difficulty.BEGINNER, equipment: ['Mancuernas'] },
  { name: 'Elevaciones Laterales', category: 'hombros', muscles: ['Deltoides lateral'], difficulty: Difficulty.BEGINNER, equipment: ['Mancuernas'] },
  { name: 'Elevaciones Frontales', category: 'hombros', muscles: ['Deltoides anterior'], difficulty: Difficulty.BEGINNER, equipment: ['Mancuernas'] },
  { name: 'Pájaro (Posterior)', category: 'hombros', muscles: ['Deltoides posterior', 'Romboides'], difficulty: Difficulty.BEGINNER, equipment: ['Mancuernas'] },
  { name: 'Arnold Press', category: 'hombros', muscles: ['Deltoides completo', 'Tríceps'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Mancuernas'] },
  { name: 'Elevaciones en Polea Baja', category: 'hombros', muscles: ['Deltoides lateral'], difficulty: Difficulty.BEGINNER, equipment: ['Polea baja'] },
  // BÍCEPS
  { name: 'Curl con Barra', category: 'biceps', muscles: ['Bíceps braquial', 'Braquiorradial'], difficulty: Difficulty.BEGINNER, equipment: ['Barra'] },
  { name: 'Curl con Mancuernas', category: 'biceps', muscles: ['Bíceps braquial'], difficulty: Difficulty.BEGINNER, equipment: ['Mancuernas'] },
  { name: 'Curl Martillo', category: 'biceps', muscles: ['Bíceps', 'Braquiorradial'], difficulty: Difficulty.BEGINNER, equipment: ['Mancuernas'] },
  { name: 'Curl en Banco Scott', category: 'biceps', muscles: ['Bíceps braquial'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Banco Scott', 'Barra EZ'] },
  { name: 'Curl en Polea', category: 'biceps', muscles: ['Bíceps braquial'], difficulty: Difficulty.BEGINNER, equipment: ['Polea baja'] },
  { name: 'Curl Concentrado', category: 'biceps', muscles: ['Bíceps braquial'], difficulty: Difficulty.BEGINNER, equipment: ['Mancuerna'] },
  // TRÍCEPS
  { name: 'Press Francés', category: 'triceps', muscles: ['Tríceps braquial'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Barra EZ', 'Banco'] },
  { name: 'Extensiones en Polea', category: 'triceps', muscles: ['Tríceps braquial'], difficulty: Difficulty.BEGINNER, equipment: ['Polea alta'] },
  { name: 'Kickback con Mancuerna', category: 'triceps', muscles: ['Tríceps braquial'], difficulty: Difficulty.BEGINNER, equipment: ['Mancuerna'] },
  { name: 'Fondos en Banco', category: 'triceps', muscles: ['Tríceps braquial', 'Deltoides'], difficulty: Difficulty.BEGINNER, equipment: ['Banco'] },
  { name: 'Extensión sobre la Cabeza', category: 'triceps', muscles: ['Tríceps braquial'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Mancuerna'] },
  { name: 'Rompecráneos', category: 'triceps', muscles: ['Tríceps braquial'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Barra EZ', 'Banco'] },
  // PIERNAS
  { name: 'Sentadilla con Barra', category: 'piernas', muscles: ['Cuádriceps', 'Glúteos', 'Isquiotibiales'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Barra', 'Rack'] },
  { name: 'Sentadilla Goblet', category: 'piernas', muscles: ['Cuádriceps', 'Glúteos'], difficulty: Difficulty.BEGINNER, equipment: ['Kettlebell'] },
  { name: 'Prensa de Piernas', category: 'piernas', muscles: ['Cuádriceps', 'Glúteos', 'Isquiotibiales'], difficulty: Difficulty.BEGINNER, equipment: ['Máquina prensa'] },
  { name: 'Extensión de Cuádriceps', category: 'piernas', muscles: ['Cuádriceps'], difficulty: Difficulty.BEGINNER, equipment: ['Máquina extensora'] },
  { name: 'Curl de Isquiotibiales', category: 'piernas', muscles: ['Isquiotibiales'], difficulty: Difficulty.BEGINNER, equipment: ['Máquina curl'] },
  { name: 'Zancadas', category: 'piernas', muscles: ['Cuádriceps', 'Glúteos', 'Isquiotibiales'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Mancuernas'] },
  { name: 'Peso Muerto Rumano', category: 'piernas', muscles: ['Isquiotibiales', 'Glúteos', 'Lumbar'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Barra'] },
  { name: 'Sentadilla Búlgara', category: 'piernas', muscles: ['Cuádriceps', 'Glúteos'], difficulty: Difficulty.ADVANCED, equipment: ['Mancuernas', 'Banco'] },
  { name: 'Elevación de Talones de Pie', category: 'piernas', muscles: ['Gemelos'], difficulty: Difficulty.BEGINNER, equipment: [] },
  { name: 'Elevación de Talones Sentado', category: 'piernas', muscles: ['Sóleo'], difficulty: Difficulty.BEGINNER, equipment: ['Máquina gemelos'] },
  // GLÚTEOS
  { name: 'Hip Thrust', category: 'gluteos', muscles: ['Glúteo mayor', 'Isquiotibiales'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Barra', 'Banco'] },
  { name: 'Patada de Glúteo en Polea', category: 'gluteos', muscles: ['Glúteo mayor'], difficulty: Difficulty.BEGINNER, equipment: ['Polea baja'] },
  { name: 'Abducción de Cadera en Máquina', category: 'gluteos', muscles: ['Glúteo medio', 'Glúteo menor'], difficulty: Difficulty.BEGINNER, equipment: ['Máquina abductores'] },
  { name: 'Peso Muerto Sumo', category: 'gluteos', muscles: ['Glúteos', 'Isquiotibiales', 'Aductores'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Barra'] },
  { name: 'Sentadilla Sumo', category: 'gluteos', muscles: ['Glúteos', 'Aductores', 'Cuádriceps'], difficulty: Difficulty.BEGINNER, equipment: ['Mancuerna'] },
  // ABDOMINALES
  { name: 'Crunch', category: 'abdominales', muscles: ['Recto abdominal'], difficulty: Difficulty.BEGINNER, equipment: [] },
  { name: 'Plancha', category: 'abdominales', muscles: ['Core completo', 'Transverso abdominal'], difficulty: Difficulty.BEGINNER, equipment: [] },
  { name: 'Elevación de Piernas', category: 'abdominales', muscles: ['Recto abdominal inferior', 'Hip flexors'], difficulty: Difficulty.INTERMEDIATE, equipment: [] },
  { name: 'Rueda Abdominal', category: 'abdominales', muscles: ['Core completo', 'Dorsales'], difficulty: Difficulty.ADVANCED, equipment: ['Rueda abdominal'] },
  { name: 'Crunch en Polea', category: 'abdominales', muscles: ['Recto abdominal'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Polea alta'] },
  { name: 'Russian Twist', category: 'abdominales', muscles: ['Oblicuos', 'Recto abdominal'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Disco'] },
  { name: 'Mountain Climber', category: 'abdominales', muscles: ['Core', 'Hombros', 'Cardio'], difficulty: Difficulty.INTERMEDIATE, equipment: [] },
  { name: 'Hollow Body', category: 'abdominales', muscles: ['Core completo'], difficulty: Difficulty.ADVANCED, equipment: [] },
  // CARDIO
  { name: 'Cinta Caminadora', category: 'cardio', muscles: ['Piernas', 'Core'], difficulty: Difficulty.BEGINNER, equipment: ['Cinta'] },
  { name: 'Bicicleta Estática', category: 'cardio', muscles: ['Piernas'], difficulty: Difficulty.BEGINNER, equipment: ['Bicicleta'] },
  { name: 'Elíptica', category: 'cardio', muscles: ['Piernas', 'Brazos'], difficulty: Difficulty.BEGINNER, equipment: ['Elíptica'] },
  { name: 'Remo Ergómetro', category: 'cardio', muscles: ['Espalda', 'Piernas', 'Brazos'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Remo ergómetro'] },
  { name: 'Salto a la Comba', category: 'cardio', muscles: ['Piernas', 'Hombros'], difficulty: Difficulty.BEGINNER, equipment: ['Comba'] },
  { name: 'Burpees', category: 'cardio', muscles: ['Full body'], difficulty: Difficulty.ADVANCED, equipment: [] },
  { name: 'Box Jump', category: 'cardio', muscles: ['Piernas', 'Glúteos'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Cajón pliométrico'] },
  { name: 'HIIT en Cinta', category: 'cardio', muscles: ['Piernas', 'Cardio'], difficulty: Difficulty.ADVANCED, equipment: ['Cinta'] },
  { name: 'Kettlebell Swing', category: 'cardio', muscles: ['Glúteos', 'Isquiotibiales', 'Core'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Kettlebell'] },
  { name: 'Battle Ropes', category: 'cardio', muscles: ['Hombros', 'Core', 'Brazos'], difficulty: Difficulty.INTERMEDIATE, equipment: ['Battle ropes'] },
  // FULL BODY
  { name: 'Thruster', category: 'full-body', muscles: ['Full body'], difficulty: Difficulty.ADVANCED, equipment: ['Barra'] },
  { name: 'Power Clean', category: 'full-body', muscles: ['Full body'], difficulty: Difficulty.ADVANCED, equipment: ['Barra'] },
  { name: 'Turkish Get-Up', category: 'full-body', muscles: ['Full body', 'Core'], difficulty: Difficulty.ADVANCED, equipment: ['Kettlebell'] },
  { name: 'Man Maker', category: 'full-body', muscles: ['Full body'], difficulty: Difficulty.ADVANCED, equipment: ['Mancuernas'] },
  { name: 'Clean and Press', category: 'full-body', muscles: ['Full body'], difficulty: Difficulty.ADVANCED, equipment: ['Barra'] },
]

async function main() {
  console.log('🌱 Starting seed...')

  // Seed exercise categories
  console.log('📂 Seeding exercise categories...')
  const categoryMap: Record<string, string> = {}
  for (const cat of EXERCISE_CATEGORIES) {
    const created = await prisma.exerciseCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    categoryMap[cat.slug] = created.id
  }

  // Seed exercises (global library)
  console.log('💪 Seeding exercise library (100+ exercises)...')
  for (const ex of EXERCISES) {
    await prisma.exercise.upsert({
      where: { id: `global-${ex.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `global-${ex.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: ex.name,
        categoryId: categoryMap[ex.category],
        muscleGroups: ex.muscles,
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        isGlobal: true,
      },
    })
  }

  // Seed demo gym
  console.log('🏋️ Seeding demo gym...')
  const gym = await prisma.gym.upsert({
    where: { slug: 'demo-gym' },
    update: {},
    create: {
      slug: 'demo-gym',
      name: 'FitPro Gym',
      email: 'admin@fitpro.com',
      phone: '+5491112345678',
      whatsapp: '+5491112345678',
      address: 'Av. Corrientes 1234',
      city: 'Buenos Aires',
      state: 'CABA',
      plan: 'PROFESSIONAL',
      settings: {
        allowMemberReservations: true,
        maxReservationsPerMember: 3,
        reminderDaysBefore: [7, 3, 1],
        autoRenewRoutines: true,
      },
    },
  })

  // Seed owner user
  const passwordHash = await bcrypt.hash('Admin1234!', 12)
  const owner = await prisma.user.upsert({
    where: { gymId_email: { gymId: gym.id, email: 'admin@fitpro.com' } },
    update: {},
    create: {
      gymId: gym.id,
      email: 'admin@fitpro.com',
      passwordHash,
      role: 'OWNER',
    },
  })

  // Seed trainer
  const trainer = await prisma.user.upsert({
    where: { gymId_email: { gymId: gym.id, email: 'trainer@fitpro.com' } },
    update: {},
    create: {
      gymId: gym.id,
      email: 'trainer@fitpro.com',
      passwordHash: await bcrypt.hash('Trainer123!', 12),
      role: 'TRAINER',
    },
  })

  // Seed demo members
  console.log('👥 Seeding demo members...')
  const memberData = [
    { firstName: 'Carlos', lastName: 'González', dni: '30123456', phone: '+5491123456789', status: 'ACTIVE' as const },
    { firstName: 'María', lastName: 'López', dni: '28765432', phone: '+5491134567890', status: 'ACTIVE' as const },
    { firstName: 'Juan', lastName: 'Martínez', dni: '35987654', phone: '+5491145678901', status: 'ACTIVE' as const },
    { firstName: 'Laura', lastName: 'Fernández', dni: '32456789', phone: '+5491156789012', status: 'ACTIVE' as const },
    { firstName: 'Diego', lastName: 'Rodríguez', dni: '29876543', phone: '+5491167890123', status: 'INACTIVE' as const },
    { firstName: 'Ana', lastName: 'García', dni: '33654321', phone: '+5491178901234', status: 'ACTIVE' as const },
    { firstName: 'Pablo', lastName: 'Sánchez', dni: '31234567', phone: '+5491189012345', status: 'ACTIVE' as const },
    { firstName: 'Valentina', lastName: 'Torres', dni: '36543210', phone: '+5491190123456', status: 'ACTIVE' as const },
  ]

  const members = []
  for (const m of memberData) {
    const member = await prisma.member.create({
      data: {
        gymId: gym.id,
        ...m,
        email: `${m.firstName.toLowerCase()}.${m.lastName.toLowerCase()}@demo.com`,
        joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      },
    })
    members.push(member)
  }

  // Seed payment plans
  console.log('💰 Seeding payment plans...')
  const plans = await Promise.all([
    prisma.paymentPlan.create({ data: { gymId: gym.id, name: 'Mensual', amount: 15000, durationDays: 30 } }),
    prisma.paymentPlan.create({ data: { gymId: gym.id, name: 'Trimestral', amount: 40000, durationDays: 90 } }),
    prisma.paymentPlan.create({ data: { gymId: gym.id, name: 'Semestral', amount: 75000, durationDays: 180 } }),
    prisma.paymentPlan.create({ data: { gymId: gym.id, name: 'Anual', amount: 130000, durationDays: 365 } }),
  ])

  // Seed payments for members
  const now = new Date()
  for (let i = 0; i < members.length; i++) {
    const m = members[i]
    const plan = plans[0]
    await prisma.payment.create({
      data: {
        gymId: gym.id,
        memberId: m.id,
        planId: plan.id,
        amount: plan.amount,
        status: i < 6 ? 'PAID' : 'PENDING',
        method: 'CASH',
        paidAt: i < 6 ? new Date() : null,
        periodStart: now,
        periodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      },
    })
  }

  // Seed a demo routine
  console.log('📋 Seeding demo routines...')
  const routine = await prisma.routine.create({
    data: {
      gymId: gym.id,
      name: 'Rutina Principiante Full Body',
      goal: 'Acondicionamiento general y pérdida de peso',
      durationWeeks: 4,
      description: 'Rutina ideal para comenzar en el gimnasio, trabajando todos los grupos musculares.',
      isTemplate: true,
    },
  })

  const exerciseIds = await prisma.exercise.findMany({ where: { isGlobal: true }, take: 6, select: { id: true } })
  for (let i = 0; i < exerciseIds.length; i++) {
    await prisma.routineExercise.create({
      data: {
        routineId: routine.id,
        exerciseId: exerciseIds[i].id,
        dayOfWeek: (i % 3) + 1,
        order: i,
        sets: 3,
        reps: '10-12',
        restSecs: 60,
      },
    })
  }

  // Assign routine to first 3 members
  for (let i = 0; i < 3; i++) {
    const startsAt = new Date()
    const expiresAt = new Date(startsAt.getTime() + 90 * 24 * 60 * 60 * 1000)
    await prisma.routineAssign.create({
      data: {
        memberId: members[i].id,
        routineId: routine.id,
        startsAt,
        expiresAt,
        isActive: true,
      },
    })
  }

  // Seed schedule slots
  console.log('📅 Seeding schedule slots...')
  const slots = [
    { name: 'Musculación AM', dayOfWeek: 1, startTime: '07:00', endTime: '08:30', capacity: 20 },
    { name: 'Musculación AM', dayOfWeek: 2, startTime: '07:00', endTime: '08:30', capacity: 20 },
    { name: 'Musculación AM', dayOfWeek: 3, startTime: '07:00', endTime: '08:30', capacity: 20 },
    { name: 'Musculación AM', dayOfWeek: 4, startTime: '07:00', endTime: '08:30', capacity: 20 },
    { name: 'Musculación AM', dayOfWeek: 5, startTime: '07:00', endTime: '08:30', capacity: 20 },
    { name: 'Spinning Mañana', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', capacity: 15 },
    { name: 'Spinning Mañana', dayOfWeek: 3, startTime: '09:00', endTime: '10:00', capacity: 15 },
    { name: 'Spinning Mañana', dayOfWeek: 5, startTime: '09:00', endTime: '10:00', capacity: 15 },
    { name: 'Yoga', dayOfWeek: 2, startTime: '18:00', endTime: '19:00', capacity: 12 },
    { name: 'Yoga', dayOfWeek: 4, startTime: '18:00', endTime: '19:00', capacity: 12 },
    { name: 'Musculación PM', dayOfWeek: 1, startTime: '17:00', endTime: '21:00', capacity: 30 },
    { name: 'Musculación PM', dayOfWeek: 2, startTime: '17:00', endTime: '21:00', capacity: 30 },
    { name: 'Musculación PM', dayOfWeek: 3, startTime: '17:00', endTime: '21:00', capacity: 30 },
    { name: 'Musculación PM', dayOfWeek: 4, startTime: '17:00', endTime: '21:00', capacity: 30 },
    { name: 'Musculación PM', dayOfWeek: 5, startTime: '17:00', endTime: '21:00', capacity: 30 },
  ]
  for (const slot of slots) {
    await prisma.scheduleSlot.create({ data: { gymId: gym.id, ...slot } })
  }

  // Seed body metrics for first member
  console.log('📊 Seeding body metrics...')
  await prisma.bodyMetric.create({
    data: {
      memberId: members[0].id,
      weight: 78.5,
      height: 175,
      bmi: 25.6,
      waist: 85,
      chest: 100,
      hip: 95,
    },
  })

  // Seed announcements
  await prisma.announcement.create({
    data: {
      gymId: gym.id,
      title: '¡Bienvenidos a FitPro Gym!',
      body: 'Estamos felices de tenerte con nosotros. Recordá que podés reservar turnos desde la app.',
      isActive: true,
    },
  })

  console.log('✅ Seed completed successfully!')
  console.log('📧 Admin login: admin@fitpro.com / Admin1234!')
  console.log('📧 Trainer login: trainer@fitpro.com / Trainer123!')
  console.log(`🏋️ Gym slug: demo-gym`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
