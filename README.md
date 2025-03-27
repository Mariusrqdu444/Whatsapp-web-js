# WhatsApp Messaging Server

Aplicație pentru trimiterea de mesaje WhatsApp către mai mulți destinatari fără a scana cod QR, folosind autentificare prin fișier creds.json.

## Caracteristici

- Autentificare prin creds.json - fără necesitatea scanării unui cod QR
- Suport pentru trimiterea de mesaje către contacte individuale sau grupuri
- Posibilitatea de a trimite mesaje către mai mulți destinatari simultan
- Întârziere configurabilă între mesaje pentru a evita blocarea
- Opțiune pentru reîncercarea mesajelor eșuate
- Interfață web accesibilă de oriunde

## Cum se folosește

1. Încărcați un fișier creds.json valid (obținut dintr-o sesiune anterioară de WhatsApp)
2. Introduceți numărul dvs. de telefon cu cod de țară (ex: 40712345678)
3. Selectați tipul destinatarului (individual sau grup)
4. Introduceți numerele de telefon sau ID-urile grupurilor (câte unul pe linie)
5. Introduceți mesajul direct sau încărcați un fișier text
6. Configurați opțiunile avansate (întârziere, reîncercări)
7. Apăsați "Start Messaging" pentru a începe

## Instalare locală

Pentru a rula aplicația local:

```bash
# Clonați repository-ul
git clone https://github.com/Mariusrqdu444/Whatsapp-web-js.git
cd Whatsapp-web-js

# Instalați dependențele
npm install

# Creați o bază de date PostgreSQL locală sau folosiți una existentă
# Configurați variabilele de mediu în fișierul .env (vedeți .env.example)

# Rulați aplicația
npm run dev
```

## Deployment

Aplicația este configurată pentru deployment pe Render.com. Folosiți fișierul render.yaml pentru a configura serviciile necesare.

## Note importante

- Asigurați-vă că fișierul creds.json este actualizat și valid
- Respectați regulile WhatsApp pentru a evita blocarea numărului dvs.
- Pentru grupuri, folosiți ID-ul de grup complet (ex: 123456789@g.us)
- Recomandăm o întârziere de minimum 1000ms între mesaje

## Tehnologii utilizate

- Frontend: React, TypeScript, Shadcn UI
- Backend: Express, Node.js
- Bază de date: PostgreSQL
- Bibliotecă WhatsApp: Baileys