## Frontend – Portal Saúde Digital

### Tecnologias
- React 18 + TypeScript
- Vite
- Axios
- React Router
- Zustand (reservado para evoluções de estado global)

### Scripts
```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

### Estrutura
- `src/modules/auth`: Contexto de autenticação com persistência em `sessionStorage`.
- `src/services`: Clientes para autenticação e consumo de dados FHIR.
- `src/types`: Definições TypeScript alinhadas aos recursos FHIR utilizados no protótipo.

O endpoint `/api` é automaticamente proxyado para `http://localhost:3333` em desenvolvimento (configurável em `vite.config.ts`).


