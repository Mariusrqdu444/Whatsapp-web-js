# Instrucțiuni pentru Render.com

## Configurare aplicație pe Render.com

Pentru a configura aplicația corect pe Render.com, urmează acești pași:

1. **Crează un serviciu web nou**
   - Selectează "Web Service" din dashboard-ul Render
   - Conectează repo-ul GitHub: `https://github.com/Mariusrqdu444/Whatsapp-web-js.git`

2. **Configurează serviciul**
   - Name: `whatsapp-web-js` (sau alt nume preferat)
   - Region: Selectează regiunea cea mai apropiată de tine
   - Branch: `main`
   - Root Directory: Lasă gol (folosește root-ul repo-ului)
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm run start`

3. **Configurează variabilele de mediu**
   - Adaugă următoarele variabile de mediu (Environment Variables):
   
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=... (URL-ul bazei de date PostgreSQL)
   CREDS_JSON=... (conținutul fișierului creds.json)
   ```

   **Important pentru variabila CREDS_JSON:**
   - Copiază tot conținutul fișierului `creds.json` exact cum este
   - **NU** adăuga ghilimele suplimentare la început și la sfârșit
   - **NU** escapa ghilimelele din interior
   - Copiază JSON-ul brut, exact așa cum apare în fișier
   
   Exemplu corect:
   ```
   CREDS_JSON={"noiseKey":{"private":{"type":"Buffer","data":"ABC123..."},"public":{"type":"Buffer","data":"DEF456..."}},...}
   ```
   
   Exemplu greșit (cu ghilimele în plus):
   ```
   CREDS_JSON="{"noiseKey":{"private":...}}"
   ```

4. **Creează o bază de date PostgreSQL**
   - Poți folosi Render PostgreSQL sau un alt serviciu
   - Adaugă URL-ul bazei de date în variabila de mediu `DATABASE_URL`

## Note importante

- Asigură-te că fișierul `creds.json` este valid și actualizat
- Dacă primești eroarea "Failed to start WhatsApp session", verifică variabila de mediu `CREDS_JSON`
- Render va face auto-deploy la fiecare push în branch-ul main
- Aplicația va fi disponibilă la URL-ul format: `https://numele-serviciului.onrender.com`

## Depanare

Dacă întâmpini probleme:

1. Verifică log-urile pentru erori (în dashboard-ul Render.com la secțiunea "Logs")
2. Asigură-te că toate variabilele de mediu sunt configurate corect
3. Verifică dacă serverul pornește local înainte de deployment

### Probleme specifice și soluții

#### Eroare "Failed to start WhatsApp session"
Dacă vezi această eroare:
1. Verifică variabila de mediu `CREDS_JSON`:
   - Asigură-te că ai copiat conținutul EXACT al fișierului creds.json
   - Verifică dacă nu ai adăugat ghilimele suplimentare la început și sfârșit
   - Asigură-te că nu sunt caractere speciale sau spații adăugate accidental

2. Alternativ, poți încerca să încarci fișierul creds.json direct prin interfața web:
   - Deschide aplicația în browser
   - Folosește opțiunea "Upload creds.json file" din interfață
   - Selectează fișierul creds.json din calculatorul tău
   
#### Probleme cu baza de date
1. Verifică conexiunea la baza de date PostgreSQL
2. Asigură-te că URL-ul bazei de date este valid și corect configurat
3. Verifică dacă tabela "sessions" a fost creată corect

## Actualizare periodică

WhatsApp poate necesita reautentificare periodică. Dacă aplicația nu mai funcționează:

1. Generează un nou fișier `creds.json` folosind aplicația locală
2. Actualizează variabila de mediu `CREDS_JSON` pe Render cu noul conținut
3. Redeployează aplicația (Redeploy din dashboard-ul Render)