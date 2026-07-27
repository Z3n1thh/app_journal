# Supabase molnsync — setup

Bujo Mood Tracker synkar via Supabase REST (ingen SDK). All data lagras som en JSON-blob per sync-ID.

## 1. Skapa projekt

1. Gå till [supabase.com](https://supabase.com) och skapa ett projekt.
2. Öppna **SQL Editor** och kör:

```sql
CREATE TABLE bujo_sync (
  sync_id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bujo_sync ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read/write by sync_id"
  ON bujo_sync
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
```

> **Produktion:** Begränsa policyn (t.ex. endast rader där `sync_id` matchar en hemlig token) istället för `USING (true)`.

## 2. Hämta API-uppgifter

1. **Project Settings → API**
2. **Project URL** → klistra in som *Supabase URL* i appen
3. **anon public key** → klistra in som *Anon key*

## 3. Konfigurera i appen

1. Öppna **Inställningar → Molnsync**
2. Aktivera molnsync
3. Klistra in URL och anon key
4. **Sync ID** genereras automatiskt — spara det om du synkar flera enheter
5. Tryck **Ladda upp** för att skicka data, **Ladda ner** för att hämta

## 4. Felsökning

| Problem | Lösning |
|---------|---------|
| Sync failed | Kontrollera URL (slutar med `.supabase.co`), anon key, och att tabellen finns |
| Tom data efter pull | Kör push från enheten som har data först |
| CORS-fel | Supabase REST tillåter webbläsare som standard |

## 5. Säkerhet

- Anon key exponeras i klienten — använd RLS och begränsade policies i produktion
- Krypterad backup (Inställningar) rekommenderas som extra skydd
- Sync-ID fungerar som “lösenord” — dela det inte offentligt
