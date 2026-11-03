# Dron Detector: wykrywacz dronów Remote ID z podglądem na telefonie i tablecie

Repozytorium do 2.11.2026 nazywało się `rid-heltec`. Stary adres strony już nie działa, obecny jest niżej.

Główne repozytorium projektu **Dron Detector**: strona podglądu dla telefonu i tabletu oraz firmware dla płytki
**Heltec WiFi LoRa 32 V3**. Płytki (Heltec, CYD, M5) odbierają sygnał Remote ID, który nadają drony, a strona łączy się
z nimi przez Bluetooth i pokazuje drony w okolicy: odległość i kierunek od Ciebie, mapę, radar, widok 3D, wysokość
(także nad terenem), prędkość, położenie operatora oraz oznaczenia swój/obcy.

## ▶ Otwórz podgląd na telefonie: **https://qldadm.github.io/dron-detector/**

Nie trzeba niczego instalować ani zakładać konta. Strona działa w przeglądarce telefonu.

---

## Jak zacząć: 3 kroki

### 1. Wgraj firmware na Heltec (jednorazowo)

Pobierz plik `rid-heltec-v3-full.bin` z zakładki **[Releases](https://github.com/QLDADM/dron-detector/releases)**
i wgraj go przez przeglądarkę na komputerze. Wszystko krok po kroku, także dla osób, które robią to pierwszy raz:
**[instrukcja wgrywania](firmware/README.md)**.

Po wgraniu zasilaj płytkę z powerbanku, akumulatora albo ładowarki USB. Od razu zaczyna nasłuchiwać.

### 2. Otwórz stronę na telefonie

| Telefon | Przeglądarka |
|---|---|
| **Android** | **Google Chrome** |
| **iPhone / iPad** | **Bluefy** (darmowa, z App Store). Safari i Chrome na iPhonie nie obsługują Bluetooth na stronach. |

Wejdź na **https://qldadm.github.io/dron-detector/** i włącz w telefonie **Bluetooth** oraz **lokalizację**
(lokalizacja jest potrzebna do odległości i kierunku do drona).

Wygodnie jest dodać stronę do ekranu głównego (w menu przeglądarki: „Dodaj do ekranu głównego”).
Wtedy otwiera się jak aplikacja i działa także bez internetu.

### 3. Połącz telefon z Heltec

1. Na stronie naciśnij **Połącz**.
2. Z listy wybierz **RID-Heltec-XXXX**.
3. Telefon zapyta o **PIN**. Wpisz 6 cyfr, które w tym momencie widać na ekranie Heltec.
4. Gotowe. Następnym razem telefon połączy się bez PIN-u.

Po połączeniu strona pobiera też historię dronów, które płytka zapisała, gdy telefonu nie było w pobliżu.

---

## Co widać na stronie (wersja strony 1.0)

Numer wersji strony jest pod listą dronów. Strona ma własną numerację, niezależną od firmware płytek.

Na tablecie albo komputerze (ekran szerszy niż 900 px) wszystko jest na jednym ekranie: u góry pasek z płytkami
i przyciskami **Połącz / Rozłącz / Dodaj płytkę**, po lewej lista dronów, w środku mapa, po prawej widok 3D i radar,
na dole panele pasm Wi-Fi. Na telefonie te same części są jedna pod drugą.

- **Model** (znane kody DJI), klasa i kategoria UE, typ statku, opis operatora, numer operatora, prędkość pionowa, maksima lotu oraz ostrzeżenia: ponad 120 m i zanik sygnału w locie.
- **Lista dronów** z ID, wysokością, prędkością, siłą sygnału, odległością i kierunkiem od telefonu oraz danymi operatora.
  Na górze jest najbliższy aktywny dron (drony bez pozycji według siły sygnału), niżej nieaktywne.
- **Mapa** z położeniem dronów, operatorów (fioletowe) i Twoim. Przy dronie: nazwa, wysokość, AGL, odległość od Ciebie
  i do operatora.
- **Wysokość nad terenem (AGL)**: gdy urządzenie ma internet, strona pobiera wysokość terenu pod dronem z numerycznego
  modelu terenu GUGiK i pokazuje ją obok wysokości z Remote ID. Bez internetu jest tylko wysokość z Remote ID.
  Dokładność zależy od wysokości podawanej przez drona (zwykle ±10 m). Działa w Polsce.
- **Twoja pozycja**: z GPS urządzenia. Znacznik **GPS** w nagłówku miga na czerwono, dopóki pozycji nie ma. Na komputerze
  bez GPS ustawisz ją ikoną **📍** na mapie (ikona, potem kliknięcie miejsca); przycisk **✖** pod nią ją kasuje.
- **Radar** w stylu wskaźnika wojskowego: Ty w środku, siatka odległości, podziałka azymutu co 5°, obracająca się wiązka.
  Zasięg dobiera się sam do dronów z aktualnym sygnałem (500 m, 1, 2 albo 3 km); dalsze drony radar podaje
  jako „1 dron poza skalą”, a drony bez pozycji jako „1 dron bez pozycji”. Gdy wiązka mija drona, kropka rozbłyskuje
  i rozchodzi się od niej pierścień. Kolory: zielony swój, czerwony obcy, żółty nieoznaczony, fioletowy kwadrat operator.
  Przy dronie: wysokość, AGL, odległość od Ciebie i odległość do operatora (`↑45 m · AGL 47 m · ↔120 m · 🎮 89 m`).
  Wiązka jest tylko wizualna: pozycje pochodzą z Remote ID i GPS telefonu.
- **Widok 3D**: drony na swojej wysokości nad ziemią wokół Ciebie, operatorzy na ziemi połączeni linią z dronem.
  Wysokość ma osobną, powiększoną skalę. Przeciąganie palcem obraca widok i zmienia nachylenie.
- **Pełny widok** (przycisk ⤢ przy radarze i widoku 3D): radar, widok 3D albo oba w nowej karcie, na cały ekran,
  z podkładem mapy (OSM albo satelita, z suwakiem jasności). Dane przychodzą z karty głównej, więc ona musi zostać otwarta.
- **Pasma Wi-Fi 2,4 i 5 GHz**: zajętość kanałów (ramki na sekundę i najsilniejszy sygnał). Dane wysyła CYD: 2,4 GHz
  z czujnika ESP32-C5 nr 1 (bez niego z własnego radia), 5 GHz z czujnika C5 nr 2. Kanał, na którym teraz słychać drona,
  jest na czerwono. To nie jest widmo radiowe: aparatur ELRS ani analogowego wideo tu nie widać.
- Przyciski **Swój / Obcy**. Swoje drony nie wywołują alarmu.
- **Alarm** (dźwięk i wibracja) przy nowym, nieoznaczonym dronie.
- **Historia** lotów zapisana w płytce.

## Prywatność

Strona nie zawiera reklam ani śledzenia i nigdzie nie wysyła danych. Wszystko idzie tylko między telefonem a Twoją płytką.
Połączenie wymaga sparowania PIN-em i jest szyfrowane, więc obcy telefon nie podejrzy Twojej płytki.

## Najczęstsze pytania

| Pytanie | Odpowiedź |
|---|---|
| Po naciśnięciu „Połącz” płytki nie ma na liście | Sprawdź, czy Heltec jest włączony i ma wgrany firmware RID (na ekranie widać kanał i liczniki) oraz czy telefon ma włączony Bluetooth. Na Androidzie włącz też lokalizację. |
| Na iPhonie przycisk „Połącz” nie działa | Otwórz stronę w aplikacji **Bluefy**, nie w Safari. |
| Telefon nie łączy się po aktualizacji firmware | Usuń płytkę w ustawieniach Bluetooth telefonu i sparuj ją ponownie z nowym PIN-em. |
| Czy wykryje każdego drona? | Tylko drony, które nadają Remote ID. Zasięg to zwykle kilkaset metrów, zależnie od drona i terenu. |

---

## Zawartość repozytorium

- `index.html`, `sw.js`, `manifest.webmanifest` i ikony: strona podglądu, publikowana przez GitHub Pages.
- `radar.js`: rysunek radaru i widoku 3D (wspólny ze stroną RID Decoder), `view.html`: pełny widok w osobnej karcie,
  `agl.js`: wysokość nad terenem (model terenu GUGiK, geoida EGM2008 dla Polski).
- [firmware/](firmware/): kod źródłowy firmware dla Heltec V3 i instrukcja wgrywania.
- [Releases](https://github.com/QLDADM/dron-detector/releases): gotowe pliki firmware do wgrania.

## Kilka płytek naraz

Przycisk **Dodaj płytkę** łączy kolejne płytki: Heltec i [CYD](https://github.com/QLDADM/rid-cyd). Każda ma własny
wiersz ze stanem, a drony ze wszystkich są na jednej liście i mapie, z informacją, która płytka je widzi.

## Projekt Dron Detector

To repozytorium jest częścią projektu **Dron Detector** - pasywnego systemu wykrywania dronów. Wszystkie części tylko **odbierają** sygnały - nic nie nadają w stronę drona.

| Część | Rola | Gdzie |
|---|---|---|
| **Strona podglądu** (telefon, tablet, komputer) | lista dronów, mapa, radar, widok 3D, wysokość nad terenem (AGL), pasma Wi-Fi | [dron-detector](https://github.com/QLDADM/dron-detector), **https://qldadm.github.io/dron-detector/** |
| **Heltec V3** | samodzielny wykrywacz Remote ID, alarmy LoRa do aplikacji Meshtastic | [dron-detector/firmware](https://github.com/QLDADM/dron-detector/tree/main/firmware) |
| **CYD** (ESP32-2432S028) | centrala systemu w walizce: ekran dotykowy, karta SD, czujniki ESP32-C5, Bluetooth do tabletu | [rid-cyd](https://github.com/QLDADM/rid-cyd) |
| **ESP32-C5** (2 szt., anteny zewnętrzne) | czujniki Remote ID na Wi-Fi 2,4 GHz i 5 GHz, podłączone przewodem do CYD | firmware w przygotowaniu |
| **M5StickC Plus2** | osobisty alarm w kieszeni, tryb szukania drona po sile sygnału | [rid-m5](https://github.com/QLDADM/rid-m5) |
| **Quansheng UV-K5** | wykrywanie łączy sterowania ELRS / Crossfire (433 / 868 / 915 MHz) i wideo FPV 1,2 GHz | [dron-k5](https://github.com/QLDADM/dron-k5) |

Firmware Heltec, CYD i M5 ma wspólny numer wersji (1.6), a strona podglądu własny (1.0).

Oznaczenia swój/obcy są wspólne dla wszystkich urządzeń, gdy łączy je agent RID Decoder na komputerze.
