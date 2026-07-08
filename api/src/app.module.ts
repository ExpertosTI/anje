import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssistantModule } from './modules/assistant/assistant.module';
import { ActividadModule } from './modules/actividad/actividad.module';
import { AuthModule } from './modules/auth/auth.module';
import { DemosModule } from './modules/demos/demos.module';
import { HealthModule } from './modules/health/health.module';
import { LeadsModule } from './modules/leads/leads.module';
import { VendedoresModule } from './modules/vendedores/vendedores.module';
import { ActividadSemanal } from './entities/actividad.entity';
import { Demo } from './entities/demo.entity';
import { Lead } from './entities/lead.entity';
import { Vendedor } from './entities/vendedor.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        username: cfg.get('DB_USER', 'postgres'),
        password: cfg.get('DB_PASS', 'postgres'),
        database: cfg.get('DB_NAME', 'insforge'),
        entities: [Vendedor, Lead, Demo, ActividadSemanal],
        synchronize: false,
        ssl: cfg.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
      }),
    }),
    HealthModule,
    AuthModule,
    VendedoresModule,
    LeadsModule,
    DemosModule,
    ActividadModule,
    AssistantModule,
  ],
})
export class AppModule {}
