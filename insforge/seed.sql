-- ANJE Leaders · permisos PostgREST (idempotente)

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    GRANT USAGE ON SCHEMA public TO anon;
    GRANT SELECT, INSERT, UPDATE ON anje_vendedores TO anon;
    GRANT SELECT, INSERT, UPDATE ON anje_leads TO anon;
    GRANT SELECT, INSERT, UPDATE ON anje_demostraciones TO anon;
    GRANT SELECT, INSERT, UPDATE ON anje_actividad_semanal TO anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT USAGE ON SCHEMA public TO service_role;
    GRANT ALL ON anje_vendedores TO service_role;
    GRANT ALL ON anje_leads TO service_role;
    GRANT ALL ON anje_demostraciones TO service_role;
    GRANT ALL ON anje_actividad_semanal TO service_role;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT SELECT, INSERT, UPDATE ON anje_vendedores TO authenticated;
    GRANT SELECT, INSERT, UPDATE ON anje_leads TO authenticated;
    GRANT SELECT, INSERT, UPDATE ON anje_demostraciones TO authenticated;
    GRANT SELECT, INSERT, UPDATE ON anje_actividad_semanal TO authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'insforge_admin') THEN
    GRANT ALL ON anje_vendedores TO insforge_admin;
    GRANT ALL ON anje_leads TO insforge_admin;
    GRANT ALL ON anje_demostraciones TO insforge_admin;
    GRANT ALL ON anje_actividad_semanal TO insforge_admin;
  END IF;
END $$;

-- Vendedor demo (PIN: VEND2026)
INSERT INTO anje_vendedores (id, nombre, telefono, whatsapp, pin, zona, activo)
VALUES ('ANJE-V-001', 'Vendedor Demo', '809-000-0000', '18090000000', 'VEND2026', 'Santo Domingo', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
