This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Conexión con Argus_Backend

Define `NEXT_PUBLIC_API_URL` en `.env.local`, junto a las variables `NEXT_PUBLIC_FIREBASE_*`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8081
```

Con esa variable, el dashboard lee `GET /api/v1/vulnerabilities` y guarda los cambios de estado con
`PATCH /api/v1/vulnerabilities/{id}/status`. Cada petición manda el ID token de Firebase del usuario. Sin la
variable, el dashboard usa los datos ficticios de `MockVulnerabilityRepository`. Hay que reiniciar `npm run dev`
después de cambiarla. El backend debe incluir `http://localhost:3000` en `CORS_ORIGINS`, y su proyecto de
Firebase debe ser el mismo que `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.

Con el backend conectado aparece la tarjeta **Escaneo de Nessus**. Sube el CSV exportado con
`POST /api/v1/ingest/nessus` (máximo 50 MB). El backend publica cada hallazgo Medium+ en Kafka y el consumidor los
guarda en MySQL. La tabla se recarga 3 segundos después. Requiere Kafka levantado
(`docker compose -f docker-compose.messaging.yml up -d kafka kafka-init kafka-ui` en Argus_Backend).

Desde el panel de mitigación, el SOC puede cambiar el estado de un hallazgo. Para marcar un falso positivo hay que
escribir una justificación, que queda en la bitácora del backend.

## Métricas del dashboard

Las cuatro tarjetas superiores se calculan sobre los hallazgos que coinciden con
los filtros actuales:

- **Alertas abiertas**: estado `open`; excluye las que están en proceso.
- **Críticas de Nessus**: origen `nessus`, severidad `critical` y estado `open` o `in_progress`.
- **Falsos positivos reportados**: estado `false_positive`, separado de `resolved`.
- **Resueltas**: estado `resolved`.

Las métricas se superponen: una alerta abierta puede ser también crítica de Nessus.
El total filtrado se muestra encima de las tarjetas. Con los siete datos ficticios
actuales se muestran 2 abiertas, 1 crítica activa de Nessus, 1 falso positivo y 2 resueltas.
El origen de cada hallazgo aparece en la tabla y en su detalle. Los estados del
dominio alimentan tanto el filtro como la gráfica de atención.

El dominio define los estados y el origen; `buildDashboard` calcula los indicadores
sin depender de React, Redux o Firebase; `StatCards` solo presenta los resultados.
`core/composition` elige el repositorio: el HTTP (`HttpVulnerabilityRepository`) o el de
demostración.

Validaciones disponibles: `npm test`, `npm run lint`, `npx tsc --noEmit` y `npm run build`.
Las pruebas usan TypeScript y el ejecutor nativo de Node, sin dependencias adicionales.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
