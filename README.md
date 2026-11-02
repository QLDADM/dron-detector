# Dron Detector: wykrywacz dronów Remote ID z podglądem na telefonie i tablecie

Repozytorium do 2.11.2026 nazywało się `rid-heltec`. Stary adres strony już nie działa, obecny jest niżej.

Płytka **Heltec WiFi LoRa 32 V3** odbiera sygnał Remote ID, który nadają drony.
Telefon łączy się z nią przez Bluetooth i pokazuje drony w okolicy: odległość i kierunek od Ciebie,
radar, mapę, wysokość, prędkość, położenie operatora oraz oznaczenia swój/obcy.

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
- **Mapa** z położeniem dronów, operatorów (fioletowe) i Twoim. Przy dronie: nazwa, wysokość i odległość od Ciebie (`↑85 m · ↔250 m`).
- **Radar** w stylu wskaźnika wojskowego: Ty w środku, siatka odległości, podziałka azymutu co 5°, obracająca się wiązka.
  Zasięg dobiera się sam do dronów z aktualnym sygnałem (500 m, 1, 2, 3 albo 5 km); dalsze drony radar podaje
  jako „poza skalą”. Gdy wiązka mija drona, kropka rozbłyskuje i rozchodzi się od niej pierścień.
  Kolory: zielony swój, czerwony obcy, żółty nieoznaczony, fioletowy kwadrat operator.
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
- `radar.js`: rysunek radaru i widoku 3D (wspólny ze stroną RID Decoder), `view.html`: pełny widok w osobnej karcie.
- [firmware/](firmware/): kod źródłowy firmware dla Heltec V3 i instrukcja wgrywania.
- [Releases](https://github.com/QLDADM/dron-detector/releases): gotowe pliki firmware do wgrania.

## Kilka płytek naraz

Przycisk **Dodaj płytkę** łączy kolejne płytki: Heltec i [CYD](https://github.com/QLDADM/rid-cyd). Każda ma własny
wiersz ze stanem, a drony ze wszystkich są na jednej liście i mapie, z informacją, która płytka je widzi.

## Inne wykrywacze z tym samym firmware (wersja 1.6)

- [RID CYD](https://github.com/QLDADM/rid-cyd): płytka ESP32-2432S028 z kolorowym ekranem dotykowym 2,8", radarem i zapisem na kartę SD.
- [RID M5](https://github.com/QLDADM/rid-m5): M5StickC Plus2, mały osobisty alarm z brzęczykiem i trybem szukania drona.

Oznaczenia swój/obcy są wspólne dla wszystkich urządzeń, gdy łączy je agent RID Decoder na komputerze.
