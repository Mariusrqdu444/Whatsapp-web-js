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
   CREDS_JSON=... (conținutul fișierului creds.json ca string JSON)
   ```

   Pentru variabila `CREDS_JSON`, copiază tot conținutul fișierului `creds.json` și asigură-te că este pus între ghilimele ca un string JSON valid.

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

1. Verifică log-urile pentru erori
2. Asigură-te că toate variabilele de mediu sunt configurate corect
3. Verifică dacă serverul pornește local înainte de deployment
4. Verifică conexiunea la baza de date PostgreSQL

## Actualizare periodică

WhatsApp poate necesita reautentificare periodică. Dacă aplicația nu mai funcționează:

1. Generează un nou fișier `creds.json` folosind aplicația locală
2. Actualizează variabila de mediu `CREDS_JSON` pe Render cu noul conținut
3. Redeployează aplicația (Redeploy din dashboard-ul Render)