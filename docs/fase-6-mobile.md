# Fase 6 — Mobile (React Native / Expo)

**Status:** Concluída
**Data:** 2026-03-02
**Projeto:** `c:/Projetos/BestPlayer8k-Mobile`

---

## O que foi desenvolvido

### 6.1 Serviços de assinatura

#### `src/services/subscription.service.ts`

Tipos exportados:
- `SubscriptionStatus` — union type completo
- `PaymentMethod`, `PaymentStatus` — enums de pagamento
- `Plan` — dados de um plano
- `Subscription` — assinatura com plano embutido
- `AccessStatus` — resposta do polling de acesso
- `CheckoutResponse` — resposta do checkout PIX

Métodos do serviço:

| Método | Endpoint |
|---|---|
| `getPlans()` | `GET /plans` (público) |
| `getAccessStatus()` | `GET /subscriptions/access-status` |
| `getCurrentSubscription()` | `GET /subscriptions/current` |
| `getHistory()` | `GET /subscriptions/history` |
| `checkout(planId, method)` | `POST /subscriptions/checkout` |
| `cancel(reason?)` | `POST /subscriptions/cancel` |

#### `src/services/trial.service.ts`

- `getStatus()` → `GET /trial/status` — elegibilidade e estado do trial
- `activate(platform)` → `POST /trial/activate` — ativa trial com plataforma `'mobile'`

#### `src/services/index.ts`

Adicionadas as exportações de `subscriptionService`, `trialService` e todos os tipos associados.

---

### 6.2 SubscriptionContext (`src/contexts/SubscriptionContext.tsx`)

Contexto global para estado de assinatura:

- **Polling:** `GET /subscriptions/access-status` a cada 30s quando autenticado
- **Cache:** `accessStatus: AccessStatus | null` disponível via `useSubscription()`
- **Interceptor de status:** quando `canAccess = false` e o código estiver na lista de bloqueados, redireciona para `/plans`
- **`refresh()`:** força atualização manual (usado após ativar trial ou confirmar pagamento)

**Códigos que redirecionam para `/plans`:**
```
SUBSCRIPTION_REQUIRED
SUBSCRIPTION_EXPIRED
SUBSCRIPTION_CANCELED
TRIAL_EXPIRED
PAST_DUE_EXPIRED
```

#### `src/contexts/index.ts`

Adicionada exportação: `SubscriptionProvider`, `useSubscription`.

---

### 6.3 Root Layout (`app/_layout.tsx`)

- `SubscriptionProvider` adicionado dentro de `QueryProvider`, envolvendo `RootLayoutContent`
- Importado de `../src/contexts`

---

### 6.4 Tela de Planos (`app/(app)/plans.tsx`)

- Carrega planos via `getPlans()` (público)
- Exibe CTA de trial gratuito para usuários elegíveis (`trialService.getStatus()`)
- **Trial gratuito:** Alert nativo → `trialService.activate('mobile')` → redirect para `/home`
- **Assinar plano:** `Linking.openURL(FRONTEND_URL/checkout/{slug})` — abre browser externo
  - Evita taxa Apple/Google de 15–30%
  - Variável de ambiente: `EXPO_PUBLIC_FRONTEND_URL`
- `PlanCard` inline com preço BRL, sufixo de período, equivalência mensal, badge "MAIS POPULAR"
- Nota informativa sobre pagamento no browser ao final da lista

---

### 6.5 Tela de Assinatura (`app/(app)/subscription.tsx`)

- Status atual com badge colorido por status (usando `STATUS_CONFIG`)
- Grid de informações: plano, início, expiração, carência, data de cancelamento
- Botão "Mudar de plano" / "Ver planos" → `/plans`
- Cancelamento:
  - iOS/Android: `Alert.alert` nativo com confirmação
  - Web: card de confirmação em tela com textarea para motivo
- Botão "Atualizar" para recarregar status manualmente

---

### 6.6 TrialBanner (`src/components/subscription/TrialBanner.tsx`)

- Componente posicionado absolutamente na parte inferior (acima da tab bar)
- Animação `spring` de slide-in ao aparecer
- Countdown em tempo real: dias → horas:min → min:seg
- Botão CTA "Ver planos" → `/plans`
- Botão de fechar (dismiss — state local, sem persistência)
- Visível apenas quando `accessStatus.isTrial === true`

---

### 6.7 App Layout (`app/(app)/_layout.tsx`)

- Import de `TrialBanner`
- Wrapped em `<View style={{ flex: 1 }}>` para posicionamento absoluto do banner
- `TrialBanner` renderizado após `</Tabs>` (fora das abas, sobre tudo)
- Novas Tabs.Screen hidden:
  - `plans` (`href: null`)
  - `subscription` (`href: null`)

---

### 6.8 Tela de Perfil (`app/(app)/profile.tsx`)

- Nova seção "Assinatura" adicionada no menu
- Dois itens: "Minha assinatura" → `/subscription` e "Ver planos" → `/plans`
- Ícone `CreditCard` (lucide-react-native)

---

## Arquivos criados/modificados

| Arquivo | Tipo |
|---|---|
| `src/services/subscription.service.ts` | Novo |
| `src/services/trial.service.ts` | Novo |
| `src/services/index.ts` | Modificado — novos exports |
| `src/contexts/SubscriptionContext.tsx` | Novo |
| `src/contexts/index.ts` | Modificado — novos exports |
| `app/_layout.tsx` | Modificado — SubscriptionProvider |
| `app/(app)/plans.tsx` | Novo |
| `app/(app)/subscription.tsx` | Novo |
| `src/components/subscription/TrialBanner.tsx` | Novo |
| `app/(app)/_layout.tsx` | Modificado — TrialBanner + hidden screens |
| `app/(app)/profile.tsx` | Modificado — seção Assinatura |

---

## Fluxo completo de pagamento mobile

```
Usuário sem assinatura
    └→ profile.tsx → "Ver planos" → /plans
           │
           ├→ Trial elegível → "Ativar trial" → Alert → activate() → /home
           │                                              TrialBanner visível
           │
           └→ Clica em plano → Linking.openURL(FRONTEND_URL/checkout/{slug})
                                  │
                                  └→ Browser externo → checkout web → PIX QR
                                                          │
                                                          └→ Pagamento confirmado
                                                                │
                                                                └→ Volta ao app
                                                                     SubscriptionContext detecta via polling
                                                                     /plans → redirected off
```

---

## Estratégia de pagamento: External Browser

O pagamento é processado no **browser externo** via `Linking.openURL()`:

1. App abre `{FRONTEND_URL}/checkout/{planSlug}` no browser padrão do dispositivo
2. O usuário já está autenticado no web (ou fará login)
3. Após pagamento PIX confirmado, o webhook ativa a assinatura no backend
4. O `SubscriptionContext` detecta via polling (30s) que `canAccess = true`
5. O app atualiza o estado automaticamente

**Motivação:** Evitar a taxa de 15–30% da Apple App Store e Google Play Store.

---

## Variável de ambiente necessária

```
EXPO_PUBLIC_FRONTEND_URL=https://bestplayer8k.com
```

---

## Próximo passo

**Fase 7 — TV App (Roku BrightScript):**
- `SubscriptionScreen.brs` — status + QR code para pagar pelo celular
- `TrialExpiredScreen.brs` — trial expirado + QR
- Device token temporário (Redis TTL 5min) para identificar usuário sem login no browser
