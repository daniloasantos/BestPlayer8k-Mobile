# BestPlayer8k Mobile

Aplicativo mobile desenvolvido com React Native e Expo, preparado para comunicação com backend.

## Tecnologias

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **Expo Router** - Navegação baseada em arquivos
- **TypeScript** - Tipagem estática
- **Axios** - Cliente HTTP
- **TanStack Query** - Gerenciamento de estado servidor
- **Zustand** - Gerenciamento de estado global
- **Expo Secure Store** - Armazenamento seguro de tokens

## Estrutura do Projeto

```
├── app/                    # Telas (Expo Router)
│   ├── (auth)/            # Telas de autenticação
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (app)/             # Telas autenticadas
│   │   ├── home.tsx
│   │   └── profile.tsx
│   ├── _layout.tsx        # Layout raiz
│   └── index.tsx          # Redirecionamento inicial
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   └── ui/           # Componentes de UI básicos
│   ├── hooks/            # Custom hooks
│   ├── providers/        # Context providers
│   ├── services/         # API e serviços
│   ├── stores/           # Estado global (Zustand)
│   ├── types/            # Tipos TypeScript
│   └── utils/            # Funções utilitárias
└── assets/               # Imagens e ícones
```

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure a URL do backend:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
EXPO_PUBLIC_API_URL=http://seu-backend.com/api
```

### 3. Adicionar imagens

Adicione as seguintes imagens na pasta `assets/`:

- `icon.png` - Ícone do app (1024x1024)
- `splash.png` - Splash screen (1284x2778)
- `adaptive-icon.png` - Ícone adaptativo Android (1024x1024)
- `favicon.png` - Favicon web (48x48)

## Executar

```bash
# Iniciar servidor de desenvolvimento
npm start

# Iniciar no Android
npm run android

# Iniciar no iOS
npm run ios

# Iniciar na Web
npm run web
```

## Comunicação com Backend

### Endpoints esperados

O app está configurado para consumir os seguintes endpoints:

| Método | Endpoint       | Descrição             |
|--------|----------------|-----------------------|
| POST   | /auth/login    | Login do usuário      |
| POST   | /auth/register | Cadastro de usuário   |
| GET    | /auth/me       | Dados do usuário atual|

### Formato de resposta esperado

**Login/Register:**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  },
  "token": "string"
}
```

### Autenticação

O token JWT é automaticamente:
- Armazenado de forma segura com `expo-secure-store`
- Incluído no header `Authorization: Bearer <token>` em todas as requisições
- Removido em caso de erro 401 (não autorizado)

## Adicionar novos serviços

### 1. Criar o serviço

```typescript
// src/services/exemplo.service.ts
import { api } from './api';

export interface Exemplo {
  id: string;
  nome: string;
}

export const exemploService = {
  async listar(): Promise<Exemplo[]> {
    const response = await api.get<Exemplo[]>('/exemplos');
    return response.data;
  },

  async criar(data: Omit<Exemplo, 'id'>): Promise<Exemplo> {
    const response = await api.post<Exemplo>('/exemplos', data);
    return response.data;
  },
};
```

### 2. Criar o hook

```typescript
// src/hooks/useExemplo.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exemploService } from '@/services';

export function useExemplos() {
  return useQuery({
    queryKey: ['exemplos'],
    queryFn: () => exemploService.listar(),
  });
}

export function useCriarExemplo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: exemploService.criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exemplos'] });
    },
  });
}
```

### 3. Usar na tela

```typescript
import { useExemplos, useCriarExemplo } from '@/hooks';

function MinhaScreen() {
  const { data: exemplos, isLoading } = useExemplos();
  const criarMutation = useCriarExemplo();

  // ...
}
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor Expo |
| `npm run android` | Abre no emulador Android |
| `npm run ios` | Abre no simulador iOS |
| `npm run web` | Abre no navegador |
| `npm run lint` | Executa o linter |
| `npm test` | Executa os testes |
