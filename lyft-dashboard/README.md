This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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
El repositorio de demostración se conecta desde `core/composition` y no realiza
consultas reales a Nessus. La clasificación de falsos positivos se recibe del
repositorio; esta entrega no agrega un formulario para reportarlos.

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
