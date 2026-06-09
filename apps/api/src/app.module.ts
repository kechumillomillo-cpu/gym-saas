import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from './common/prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { TenantsModule } from './modules/tenants/tenants.module'
import { MembersModule } from './modules/members/members.module'
import { RoutinesModule } from './modules/routines/routines.module'
import { ExercisesModule } from './modules/exercises/exercises.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { SchedulesModule } from './modules/schedules/schedules.module'
import { AttendanceModule } from './modules/attendance/attendance.module'
import { NutritionModule } from './modules/nutrition/nutrition.module'
import { ReportsModule } from './modules/reports/reports.module'
import { AdminModule } from './modules/admin/admin.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    TenantsModule,
    MembersModule,
    RoutinesModule,
    ExercisesModule,
    PaymentsModule,
    NotificationsModule,
    SchedulesModule,
    AttendanceModule,
    NutritionModule,
    ReportsModule,
    AdminModule,
    DashboardModule,
  ],
})
export class AppModule {}
