# ANJEYLEADERS — Despliegue

**Producción:** https://anje.renace.tech  
**Repo:** https://github.com/ExpertosTI/anje  
**VPS:** `root@45.9.191.18` → `/opt/anje`

## Primera vez en el VPS

```bash
ssh root@45.9.191.18
git clone https://github.com/ExpertosTI/anje.git /opt/anje
cd /opt/anje
./deploy.sh
```

## Actualizaciones

```bash
ssh root@45.9.191.18
cd /opt/anje && ./deploy.sh
```

O push a `main` con GitHub Actions (requiere `VPS_SSH_KEY` en secrets).

## Verificación

```bash
curl -fsS https://anje.renace.tech/healthz
```

## DNS

`anje.renace.tech` debe apuntar al VPS `45.9.191.18`.
