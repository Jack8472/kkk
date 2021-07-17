// Copyright 2020-2021 Jakub J. Szczerbowski
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>

var DateTime = luxon.DateTime;

testd = new DateTime.local()
console.log(testd.toFormat())

const wrapper = document.querySelector(".wrapper"),
  form = wrapper.querySelectorAll(".form"),
  submitInput = form[0].querySelector('input[type="submit"]');

const tabOdsetek = [
  // placeholder ... [new Date("2020-05-29T12:00:00.000Z"), 0.056],
  [new Date("2020-05-29T12:00:00.000Z"), 0.056],
  [new Date("2020-04-09T12:00:00.000Z"), 0.06],
  [new Date("2020-03-18T12:00:00.000Z"), 0.065],
  [new Date("2016-01-01T12:00:00.000Z"), 0.07],
  [new Date("2014-12-23T12:00:00.000Z"), 0.08],
  [new Date("2008-12-15T12:00:00.000Z"), 0.13],
  [new Date("2005-10-15T12:00:00.000Z"), 0.115],
];

function leapYear(year) {
  return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}

function oblOdsetkiOpozn(dWymagalnosci, kwota) {
  dKrocz = new Date();
  dKrocz.setHours(0);
  dKrocz.setMinutes(0);
  dKrocz.setSeconds(0);
  dKrocz.setMilliseconds(0);
  dWymagalnosci.setHours(5);
  dWymagalnosci.setMinutes(0);
  dWymagalnosci.setSeconds(0);
  dWymagalnosci.setMilliseconds(0);
  console.log(dWymagalnosci, kwota);
  let iterator = 0;
  let sumaOdsetek = (tabOdsetek[iterator][1] * kwota) / 365;
  let numDni = 0;
  let kwotCzOdsetek = new Number(sumaOdsetek);
  while (dKrocz > dWymagalnosci) {
    dzienneOdsetki = (tabOdsetek[iterator][1] * kwota) / 365;
    sumaOdsetek = sumaOdsetek + dzienneOdsetki;
    dKrocz.setDate(dKrocz.getDate() - 1);
    numDni = numDni + 1; //debug
    kwotCzOdsetek = kwotCzOdsetek + dzienneOdsetki; //debug
    if (dKrocz < tabOdsetek[iterator][0]) {
      console.log(
        dKrocz,
        iterator,
        numDni,
        kwotCzOdsetek,
        tabOdsetek[iterator][1]
      ); //debug
      numDni = 0;
      kwotCzOdsetek = 0;
      iterator = iterator + 1;
    }
  }
  console.log(dKrocz, iterator, numDni, kwotCzOdsetek, tabOdsetek[iterator][1]); //debug
  return sumaOdsetek;
}

function addDays(date, days) {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function stripTime(date) {
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return date;
}

function mainFunc(e) {
  e.preventDefault();
  let formData = new FormData(form[0]);

  dUruchom = new Date(formData.get("dUruchom"));
  dUmowa = new Date(formData.get("dUmowa"));
  dSplata = new Date(formData.get("dSplata"));
  kwota = new Number(formData.get("kwota"));
  czwrot = new Number(formData.get("czwrot"));
  prowizja = new Number(formData.get("prowizja"));
  today = new Date();
  today = new Date(today.toDateString());

  const terminUmowny = Math.floor(
    (Date.UTC(dUmowa.getFullYear(), dUmowa.getMonth(), dUmowa.getDate()) -
      Date.UTC(
        dUruchom.getFullYear(),
        dUruchom.getMonth(),
        dUruchom.getDate()
      )) /
    (1000 * 60 * 60 * 24)
  );
  const terminFaktyczny = Math.floor(
    (Date.UTC(dSplata.getFullYear(), dSplata.getMonth(), dSplata.getDate()) -
      Date.UTC(
        dUruchom.getFullYear(),
        dUruchom.getMonth(),
        dUruchom.getDate()
      )) /
    (1000 * 60 * 60 * 24)
  );

  const terminWymagalnosciMinJed = addDays(dSplata, 14); // uwaga, tak naprawdę to nie jest termin wymagalnosci tylko ostateczny termin zaplaty
  const terminPierwszyDzienOdsetk = addDays(dSplata, 15);
  const data8lipca2018 = new Date("2018-07-08");
  const trzyLataWstecz = new Date(today.setFullYear(today.getFullYear() - 3))

  // termin od którego biegną odsetki nieprzedawnione
  if (terminPierwszyDzienOdsetk > data8lipca2018) {
    terminPierwszyDzienOdsetkNieprzed = terminPierwszyDzienOdsetk;
  }
  else {
    //terminPierwszyDzienOdsetkNieprzed = 
  }

  //walidacja
  if (terminFaktyczny < 0 || terminUmowny < 0) {
    alert("Prawdopodobny błąd w jednej z dat.");
  }

  if (prowizja < 0 || czwrot < 0) {
    alert("Możliwy błąd w jednej z wprowadzonych kwot.");
  }

  //algorytm do wyliczenia sumy zwrotu
  kosztDzienny = prowizja / terminUmowny;
  kwotaZwrotu = kosztDzienny * (terminUmowny - terminFaktyczny) - czwrot;
  kwotaOdsetek = oblOdsetkiOpozn(terminPierwszyDzienOdsetk, kwotaZwrotu);
  kwotaOdsetekNiePrzed = oblOdsetkiOpozn(terminPierwszyDzienOdsetkNieprzed, kwotaZwrotu);
  tblMsc = [
    "stycznia",
    "lutego",
    "marca",
    "kwietnia",
    "maja",
    "czerwca",
    "lipca",
    "sierpnia",
    "września",
    "października",
    "listopada",
    "grudnia",
  ];
  termWymStr =
    terminWymagalnosciMinJed.getDate().toString() +
    " " +
    tblMsc[terminWymagalnosciMinJed.getMonth()].toString() +
    " " +
    terminWymagalnosciMinJed.getFullYear().toString();

  todayStr =
    today.getDate().toString() +
    " " +
    tblMsc[today.getMonth()].toString() +
    " " +
    today.getFullYear().toString();

  //wyświetlenie sumy zwrotu
  document.getElementById("result").innerHTML = `<h2>Wynik</h2>
        <ol class=""><li>Udzielono Ci kredytu na okres ${terminUmowny} dni. <br />
        <li>Suma pozaodsetkowych kosztów kredytu to ${prowizja} zł. </li>
        <li>Kredyt został całkowicie spłacony w terminie ${terminFaktyczny} dni.</li>
        <li>Kredytodawca powinien Ci zwrócić kwotę <strong>${kwotaZwrotu.toFixed(2)} 
        zł</strong> do dnia ${termWymStr} r.</li>
        <li>Należne na dzień sporządzenia kalkulacji (${todayStr} r.) odsetki za opóźnienie
         od tej kwoty to: <strong>
         ${kwotaOdsetek.toFixed(2)} zł</strong>.</li>
        <li>Należne na dzień sporządzenia kalkulacji (${todayStr} r.) nieprzedawnione 
        odsetki za opóźnienie to <strong>______ zł.</strong></li>
        <li>Całkowita kwota do zwrotu to: <strong>
        ${(kwotaOdsetek + kwotaZwrotu).toFixed(2)} 
        zł</strong>.</li></ol>`;
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    submitInput.addEventListener("click", mainFunc, false);
  },
  false
);
