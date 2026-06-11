# 👨‍👩‍👧‍👦 Famiglia App

PWA per organizzare faccende domestiche, lista della spesa e appuntamenti familiari, con sincronizzazione in tempo reale tra tutti i dispositivi della famiglia.

## Stack

- **Frontend**: React + Vite + React Router, build come PWA installabile
- **Backend**: Supabase (Postgres + Auth + Realtime) — nessun server da gestire
- **Hosting**: Vercel (gratuito) per il frontend, Supabase (gratuito) per dati/auth

## Struttura del progetto

```
famiglia-app/
├── supabase/
│   └── schema.sql          # Schema DB completo (tabelle + sicurezza + realtime)
├── src/
│   ├── lib/
│   │   ├── supabase.js     # Client Supabase
│   │   └── AuthContext.jsx # Gestione sessione utente e profilo
│   ├── pages/
│   │   ├── Login.jsx       # Login / registrazione
│   │   ├── SetupFamiglia.jsx # Crea o entra in un gruppo familiare
│   │   ├── Faccende.jsx    # Faccende domestiche con assegnazione
│   │   ├── Spesa.jsx       # Lista della spesa condivisa
│   │   ├── Calendario.jsx  # Appuntamenti famiglia
│   │   └── Profilo.jsx     # Profilo utente + codice invito
│   ├── components/
│   │   └── NavBar.jsx      # Barra di navigazione inferiore
│   ├── styles/
│   │   └── global.css      # Stili (mobile-first)
│   ├── App.jsx              # Routing principale
│   └── main.jsx             # Entry point
├── index.html
├── vite.config.js           # Config Vite + plugin PWA
├── package.json
└── .env.example              # Template variabili ambiente
```

## Come funziona il modello dati

- **famiglie**: ogni nucleo familiare ha un record con un `codice_invito` univoco
- **profili**: collegato a `auth.users`, ogni persona appartiene a una famiglia (`famiglia_id`)
- **faccende**, **liste_spesa/elementi_spesa**, **appuntamenti**: tutto filtrato per `famiglia_id`
- **Row Level Security**: ogni utente vede/modifica SOLO i dati della propria famiglia (policy SQL nel file schema.sql)
- **Realtime**: le tabelle principali sono in `supabase_realtime`, quindi ogni modifica si propaga istantaneamente a tutti i dispositivi connessi (es. la mamma spunta "latte" sulla spesa → sparisce subito dal telefono del papà)

## Setup passo-passo

### 1. Crea progetto Supabase
1. Vai su [supabase.com](https://supabase.com) → crea account gratuito → "New Project"
2. Vai su **SQL Editor** → incolla tutto il contenuto di `supabase/schema.sql` → esegui
3. Vai su **Project Settings → API** → copia `Project URL` e `anon public key`

### 2. Configura il progetto locale
```bash
cd famiglia-app
npm install
cp .env.example .env
```
Modifica `.env` inserendo le credenziali copiate al passo precedente.

### 3. Test in locale
```bash
npm run dev
```
Apri `http://localhost:5173`

### 4. Deploy su Vercel (gratuito)
1. Pusha il progetto su GitHub
2. Vai su [vercel.com](https://vercel.com) → "New Project" → importa il repo
3. In **Environment Variables** aggiungi `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
4. Deploy → ottieni un URL pubblico HTTPS (es. `famiglia-rossi.vercel.app`)

### 5. Conferma email Supabase (consigliato)
Su Supabase, in **Authentication → Providers → Email**, puoi disattivare la conferma email per velocizzare i test in famiglia (Settings → "Confirm email" OFF), oppure lasciarla attiva per maggiore sicurezza.

## Primo utilizzo

1. Il primo familiare si registra e crea la famiglia (sceglie un nome) → ottiene un **codice invito**
2. Va su **Profilo** per recuperare/condividere il codice
3. Gli altri familiari si registrano e scelgono "Entra in famiglia" inserendo quel codice
4. Tutti vedono e modificano le stesse liste in tempo reale

## Icone PWA mancanti

Per completare la PWA servono due immagini in `public/`:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)

Puoi generarle facilmente da un logo con [realfavicongenerator.net](https://realfavicongenerator.net) o semplicemente con uno strumento di resize immagini.

## Possibili estensioni future

- Notifiche push (richiede Service Worker + Web Push API o Firebase Cloud Messaging)
- Ricorrenza automatica faccende (cron job lato Supabase Edge Functions)
- Più liste della spesa (es. "Spesa settimanale" / "Ferramenta")
- Statistiche/storico faccende completate per persona
