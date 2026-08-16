# 🌐 Instrukcja Wdrożenia Wszystkich Projektów na Netlify

Ta instrukcja prowadzi krok po kroku przez proces wdrożenia repozytorium **VibeCoding** na platformę **Netlify**.

Projekt został skonfigurowany w taki sposób, aby umożliwić:
1. **Jednozbiorcze wdrożenie (VibeCoding Hub)** – 1 strona na Netlify z portalem głównym i 4 podstronami (`/games/`, `/lottery/`, `/fishing_cv/`, `/date_invitation/`).
2. **Wdrożenie indywidualne** – możliwość opublikowania dowolnej pojedynczej aplikacji jako osobnej domeny w Netlify.

---

## 🚀 Metoda 1: Automatyczne Wdrożenie z GitHub (Zalecane)

To najbardziej komfortowa metoda – każdy `git push` automatycznie zaktualizuje Twoją stronę na Netlify.

### Kroki do wykonania:
1. Wypchnij najnowszy kod na GitHub:
   ```bash
   git add .
   git commit -m "Configure projects for Netlify deployment"
   git push origin main
   ```

2. Zaloguj się na [Netlify.com](https://app.netlify.app/) i kliknij **"Add new site" ➔ "Import an existing project"**.
3. Wybierz **GitHub** i wskaż swoje repozytorium `VibeCoding`.
4. Netlify automatycznie odczyta plik `netlify.toml` z repozytorium:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Kliknij **"Deploy VibeCoding"**.

Po ok. 30-60 sekundach Twoja strona będzie dostępna pod adresem np. `https://twoja-nazwa.netlify.app/`.

---

## ⚡ Metoda 2: Wdrożenie przez Terminal (Netlify CLI)

Jeśli chcesz wdrożyć projekt bezpośrednio ze swojego komputera bez łączenia z GitHub:

1. Zbuduj pakiet produkcyjny lokalnie:
   ```bash
   npm run build
   ```

2. Uruchom Netlify CLI (bez konieczności instalowania globalnego):
   ```bash
   npx netlify-cli deploy --prod --dir=dist
   ```

3. Za pierwszym razem CLI poprosi o zalogowanie w przeglądarce i wybranie konta. Gotowe!

---

## 📦 Metoda 3: Przeciągnij i Upuść (Drag & Drop w Przeglądarce)

Nie chcesz używać gita ani komend w terminalu Netlify?

1. Otwórz terminal w katalogu projektu i wykonaj:
   ```bash
   npm run build
   ```
2. Po zakończeniu w folderze projektu pojawi się katalog `dist`.
3. Wejdź na stronę [app.netlify.app/drop](https://app.netlify.app/drop).
4. Przeciągnij folder `dist` i upuść go w okienku przeglądarki.
5. Twoja strona jest natychmiast gotowa online!

---

## 🎯 Metoda 4: Wdrożenie Pojedynczego Projektu jako Osobnej Strony

Jeśli chcesz wydać np. tylko **Catch My CV** (`fishing_cv`) lub **GameHub** (`games`) pod własną osobną domeną:

### Dla projektów statycznych (`lottery`, `fishing_cv`, `date_invitation`):
1. W Netlify kliknij **"Add new site" ➔ "Import an existing project"**.
2. W ustawieniach wdrożenia ustaw:
   - **Base directory:** `fishing_cv` (lub `lottery` / `date_invitation`)
   - **Build command:** *(pozostaw puste)*
   - **Publish directory:** `.` (kropka)
3. Kliknij **Deploy**.

### Dla projektu GameHub (`games` z Vite):
1. W Netlify ustaw:
   - **Base directory:** `games`
   - **Build command:** `npm run build`
   - **Publish directory:** `games/dist`
2. Kliknij **Deploy**.

---

## 🔍 Co zostało skonfigurowane w kodzie?

- **`index.html` (w korzeniu):** Nowoczesny portal zbiorczy w stylu Glassmorphism z bezpośrednimi linkami do wszystkich 4 gier/aplikacji.
- **`package.json` & `scripts/build.js`:** Wieloplatformowy skrypt budujący, który kompiluje projekt Vite (`games`) i zbiera wszystkie aplikacje statyczne do wspólnego katalogu `dist/`.
- **`netlify.toml` & `_redirects`:** Nagłówki bezpieczeństwa, automatyczna obsługa tras routingowych i czyste adresy URL bez błędów 404.
- **Dedykowane `netlify.toml` w podfolderach:** Gwarancja bezkonfiguracyjnego wdrożenia każdego projektu z osobna.
