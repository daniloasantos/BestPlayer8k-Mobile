# BestPlayer 8K IPTV - Mobile

> Aplicativo mobile de streaming IPTV para Android e iOS, construido com React Native e Expo, com suporte a multiplos perfis, player de video nativo e internacionalizacao.

---

## Visao Geral

| Item | Detalhe |
|------|---------|
| **Tipo de Projeto** | Aplicativo Mobile (Android + iOS + Web) |
| **Framework** | React Native 0.81.5 com Expo SDK 54 |
| **Linguagem** | TypeScript 5.9.2 |
| **UI Library** | React 19.1.0 |
| **Navegacao** | Expo Router 6.0.23 (file-based) |
| **Estado Global** | Zustand 4.5.0 |
| **Estado Server** | TanStack React Query 5.0.0 |
| **HTTP Client** | Axios 1.6.0 |
| **Player** | Expo AV 16.0.8 |
| **Bundle ID** | `com.bestplayer8k.mobile` |
| **Status** | Desenvolvimento ativo / Alpha |

---

## Stack Tecnologica

### Core
- **React Native 0.81.5** - Framework mobile cross-platform
- **Expo SDK 54** - Plataforma de desenvolvimento simplificada
- **Expo Router 6.0.23** - Roteamento file-based (similar Next.js)
- **TypeScript 5.9.2** - Tipagem estatica

### Estado e Cache
- **Zustand 4.5.0** - Estado global leve (auth, perfis)
- **TanStack React Query 5.0.0** - Cache de dados do servidor com retry, stale time e invalidacao
- **React Context API** - Tema, idioma, fullscreen, floating player

### Rede
- **Axios 1.6.0** - Cliente HTTP com interceptors para auth e profile headers
- Suporte a SSE (Server-Sent Events) para progresso de importacao

### Reproducao de Video
- **expo-av 16.0.8** - Player de video nativo (HLS/DASH)

### UI e Estilizacao
- **React Native StyleSheet** - Estilos nativos otimizados
- **lucide-react-native 0.563.0** - Icones
- **expo-linear-gradient 15.0.8** - Gradientes
- **react-native-svg 15.12.1** - Graficos SVG

### Seguranca
- **expo-secure-store 15.0.0** - Armazenamento seguro de tokens (iOS/Android)
- **@react-native-async-storage 2.2.0** - Armazenamento local

### Plataforma
- **expo-screen-orientation 9.0.8** - Controle de orientacao
- **expo-navigation-bar 5.0.10** - Barra de navegacao Android
- **expo-localization 17.0.8** - Localizacao nativa
- **expo-status-bar 3.0.9** - Estilizacao da status bar

---

## Estrutura do Projeto

```
app/                                  # Telas (Expo Router - file-based)
├── _layout.tsx                       # Layout raiz
├── index.tsx                         # Check de auth e redirect
├── (auth)/                           # Grupo de autenticacao
│   ├── _layout.tsx                   # Stack layout auth
│   ├── login.tsx                     # Tela de login
│   └── register.tsx                  # Tela de cadastro
└── (app)/                            # Grupo autenticado
    ├── _layout.tsx                   # Tab navigation (5 tabs)
    ├── home.tsx                      # Dashboard com stats
    ├── live.tsx                      # Canais ao vivo
    ├── library.tsx                   # Filmes e series
    ├── favorites.tsx                 # Favoritos
    ├── profile.tsx                   # Perfil e configuracoes
    ├── search.tsx                    # Busca global
    ├── settings.tsx                  # Configuracoes do app
    ├── playlists.tsx                 # Gestao de playlists
    ├── channels/[id].tsx             # Detalhe e player do canal
    └── series/[id]/                  # Detalhe de serie
        ├── index.tsx                 # Info da serie
        └── watch/[episodeId].tsx     # Player de episodio

src/
├── components/                       # Componentes reutilizaveis
│   ├── content/                      # Componentes de conteudo
│   │   ├── ChannelCard.tsx           # Card de canal
│   │   ├── MovieCard.tsx             # Card de filme
│   │   ├── SeriesCard.tsx            # Card de serie
│   │   ├── ContentGrid.tsx           # Grid responsivo
│   │   ├── HorizontalList.tsx        # Lista horizontal scrollavel
│   │   └── CategoryFilter.tsx        # Filtro de categorias (chips)
│   ├── player/                       # Componentes do player
│   │   ├── VideoPlayer.tsx           # Player com controles
│   │   ├── PlayerControls.tsx        # Play, seek, fullscreen
│   │   ├── PlayerError.tsx           # Erro com retry
│   │   └── FloatingPlayer.tsx        # Player flutuante minimizado
│   ├── layout/                       # Layout
│   │   ├── Header.tsx                # Cabecalho com busca
│   │   ├── Section.tsx               # Secao com titulo
│   │   └── ScreenContainer.tsx       # Container com safe area
│   └── ui/                           # UI basica
│       ├── Button.tsx                # Botao customizavel
│       ├── Input.tsx                 # Input com validacao
│       ├── Card.tsx                  # Container surface
│       ├── Avatar.tsx                # Avatar com iniciais
│       ├── Skeleton.tsx              # Loading placeholder
│       ├── SearchBar.tsx             # Barra de busca
│       ├── Modal.tsx                 # Modal dialog
│       ├── EmptyState.tsx            # Estado vazio
│       └── ProfileSelector.tsx       # Seletor de perfis
│
├── contexts/                         # Context Providers
│   ├── FullscreenContext.tsx          # Estado fullscreen
│   ├── FloatingPlayerContext.tsx      # Player flutuante
│   └── LanguageContext.tsx            # i18n
│
├── hooks/                            # Custom Hooks
│   ├── useAuth.ts                    # Mutations de auth
│   ├── useChannels.ts               # Queries de canais
│   ├── useFavorites.ts              # Queries/mutations de favoritos
│   ├── usePlaylists.ts             # Queries/mutations de playlists
│   ├── useSeries.ts                 # Queries de series
│   └── useAndroidNavigationBar.ts   # Barra de navegacao Android
│
├── services/                         # Servicos de API
│   ├── api.ts                        # Instancia Axios com interceptors
│   ├── auth.service.ts               # API de autenticacao
│   ├── channels.service.ts           # API de canais
│   ├── playlists.service.ts          # API de playlists (com SSE)
│   ├── series.service.ts             # API de series
│   ├── favorites.service.ts          # API de favoritos
│   └── storage.ts                    # SecureStore/localStorage
│
├── stores/                           # Zustand Stores
│   └── auth.store.ts                 # Estado de autenticacao
│
├── theme/                            # Sistema de Tema
│   ├── colors.ts                     # Paletas dark/light
│   ├── spacing.ts                    # Escala de espacamento
│   ├── typography.ts                 # Estilos de texto
│   └── ThemeContext.tsx              # Provider de tema
│
├── types/                            # Tipos TypeScript
│   └── index.ts                      # Interfaces de dados
│
├── locales/                          # Traducoes i18n
│   ├── pt.json                       # Portugues (Brasil)
│   ├── en.json                       # Ingles
│   └── es.json                       # Espanhol
│
└── providers/                        # App Providers
    └── QueryProvider.tsx             # Config React Query
```

---

## Navegacao

### Tab Navigation (5 Tabs)
| Tab | Tela | Descricao |
|-----|------|-----------|
| Home | `home.tsx` | Dashboard com stats, recentes e destaques |
| Live | `live.tsx` | Canais ao vivo com categorias |
| Library | `library.tsx` | Filmes e series com abas |
| Favorites | `favorites.tsx` | Favoritos filtrados por tipo |
| Profile | `profile.tsx` | Perfil, preferencias e logout |

### Telas Adicionais
| Tela | Descricao |
|------|-----------|
| `search.tsx` | Busca global com filtros |
| `settings.tsx` | Configuracoes do app |
| `playlists.tsx` | Gestao de playlists M3U |
| `channels/[id].tsx` | Player de canal fullscreen |
| `series/[id]/` | Detalhe de serie com temporadas |
| `series/[id]/watch/[episodeId].tsx` | Player de episodio |

### Fluxo de Autenticacao
| Tela | Descricao |
|------|-----------|
| `login.tsx` | Login com email/senha |
| `register.tsx` | Cadastro de novo usuario |

---

## Features Implementadas

### Autenticacao
- Login e registro com email/senha
- JWT com armazenamento seguro (SecureStore no mobile, localStorage na web)
- Auto-login na abertura do app
- Interceptor que adiciona token automaticamente
- Logout com limpeza de estado

### Sistema de Perfis
- Multiplos perfis por usuario
- Selecao de perfil com avatar
- Favoritos e historico por perfil
- Perfil primario

### Conteudo
- **Live TV** - Canais ao vivo com categorias
- **Filmes** - Catalogo VOD
- **Series** - Com temporadas e episodios
- Qualidade: 4K UHD, FHD, HD, SD, H265
- Suporte a EPG

### Reproducao de Video
- Player nativo via Expo AV (HLS/DASH)
- Controles: play/pause, seek, skip, fullscreen
- Orientacao landscape em fullscreen
- Retry em caso de erro
- Historico de visualizacao
- Player flutuante minimizado

### Favoritos
- Toggle de favorito em qualquer conteudo
- Filtros: Todos, Live, Filmes, Series
- Estatisticas de favoritos
- Atualizacao otimista na UI

### Playlists
- Importacao de playlists M3U/M3U8
- Progresso em tempo real via SSE
- Refresh de playlists
- Ativacao de playlist
- Contagem de canais

### Busca
- Busca global em todo conteudo
- Filtros por tipo (Live, Filmes, Series)
- Buscas recentes
- Sugestoes de tendencias

### Internacionalizacao (i18n)
- 3 idiomas: Portugues (BR), Ingles, Espanhol
- Deteccao automatica do idioma do dispositivo
- Persistencia da preferencia

### Tema
- Dark mode (padrao) e Light mode
- Toggle com persistencia
- Paleta de cores consistente

### UI/UX
- Pull-to-refresh
- Skeletons de carregamento
- Estados vazios
- Layouts responsivos
- Safe area handling para notches

---

## Gerenciamento de Estado

### Zustand (Estado Global)
- `useAuthStore` - Usuario, status de auth, perfis, perfil selecionado
- Persiste entre reinicializacoes do app

### React Query (Estado do Servidor)
- Stale time: 5 minutos
- Garbage collection: 30 minutos
- Retry: 2 tentativas
- Invalidacao automatica em mutations
- Atualizacoes otimistas em favoritos

### Context API
- `ThemeContext` - Dark/light mode
- `LanguageContext` - Gerenciamento i18n
- `FullscreenContext` - Estado fullscreen do player
- `FloatingPlayerContext` - Player minimizado

### AsyncStorage
- Preferencia de tema
- Selecao de idioma
- ID do perfil selecionado
- Buscas recentes

---

## Integracao com API

**Base URL:** `EXPO_PUBLIC_API_URL` (padrao: `http://localhost:3000`)

### Headers Automaticos
- `Authorization: Bearer {token}` - Autenticacao
- `x-profile-id: {profileId}` - Perfil ativo

### Interceptors
- Request: Adiciona token e profileId automaticamente
- Response: Trata 401 limpando token e redirecionando

---

## Plataformas Suportadas

| Plataforma | Status | Detalhes |
|------------|--------|----------|
| **Android** | Suportado | Icone adaptativo, navigation bar, HTTP cleartext |
| **iOS** | Suportado | Suporte a tablet, dark/light UI nativo |
| **Web** | Suportado | Via React Native Web |

---

## Build e Deploy

### Scripts
```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "lint": "eslint .",
  "test": "jest"
}
```

### Configuracao (app.json)
- **Bundle ID:** `com.bestplayer8k.mobile`
- **Scheme:** `bestplayer8k`
- **Orientation:** portrait (padrao), landscape no player
- **Expo Managed Workflow** - Sem codigo nativo exposto

---

## Metricas do Projeto

| Metrica | Valor |
|---------|-------|
| Telas | 13 |
| Componentes | 20+ |
| Custom Hooks | 6 |
| Services | 7 |
| Contextos | 4 |
| Idiomas | 3 |
| Deps Producao | 25+ |
| Plataformas | 3 (Android, iOS, Web) |

---

## Historico Recente de Desenvolvimento

| Commit | Descricao |
|--------|-----------|
| a7652e3 | Importacao de playlist com SSE progress tracking |
| d8450a2 | Arquivos de localizacao Espanhol e Portugues |
| 9902837 | Stats de dashboard para formato mobile |
| 9e8db96 | Tela de detalhe de serie com temporadas |
| f8e5aa8 | Series, episodios, home, library |
| f70d530 | Player de video, favoritos, visualizacao de canais |
| 809f700 | Estrutura core, home, canais, floating player |
| 3aaa6c0 | Autenticacao e perfis de usuario |

---

*Ultima atualizacao: Fevereiro 2026*
