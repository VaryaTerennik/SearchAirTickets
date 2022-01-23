"use strict";

window.addEventListener("DOMContentLoaded", () => {
  const getData = async (url) => {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Could not fetch ${url}, status ${res.status}`);
    }
    return await res.json();
  };

  let resultData = "";

  //Запрос данных с сервера.
  //Возвращает все данные по перелету туда(объект), все данные по перелету обратно(объект), цену и перевозчика

  getData("http://localhost:3000/result").then((res) => {
    resultData = res.flights.map((item) => {
      const toData = item.flight.legs[0];
      const backData = item.flight.legs[1];
      const price = +item.flight.price.passengerPrices[0].total.amount;
      const carrier = item.flight.carrier.caption;

      function getDataLeg(legData) {
        let transfersSum = legData.segments.length - 1;
        let transfer = "";
        if (transfersSum === 0) {
          transfer = 0;
        } else {
          transfer = transfersSum;
        }
        const segments = legData.segments;

        if (transfer == 1) {
          let departureCity = "";
          if (!segments[0].departureCity) {
            departureCity = segments[0].departureAirport.caption;
          } else {
            departureCity = segments[0].departureCity.caption;
          }
          let arrivalCity = "";
          if (!segments[1].arrivalCity) {
            arrivalCity = segments[1].arrivalAirport.caption;
          } else {
            arrivalCity = segments[1].arrivalCity.caption;
          }

          let departureAirport = segments[0].departureAirport.caption;
          let departureAirportUid = segments[0].departureAirport.uid;
          let arrivalAirport = segments[1].arrivalAirport.caption;
          let arrivalAirportUid = segments[1].arrivalAirport.uid;
          let departureDate = segments[0].departureDate;
          let arrivalDate = segments[1].arrivalDate;
          let airline = "";
          if (segments[0].airline.caption === segments[1].airline.caption) {
            airline = segments[0].airline.caption;
          } else {
            airline = `${segments[0].airline.caption}, ${segments[1].airline.caption}`;
          }
          return {
            departureCity,
            arrivalCity,
            departureAirport,
            departureAirportUid,
            arrivalAirport,
            arrivalAirportUid,
            airline,
            departureDate,
            arrivalDate,
            transfer,
          };
        } else {
          let departureCity = "";
          if (!segments[0].departureCity) {
            departureCity = segments[0].departureAirport.caption;
          } else {
            departureCity = segments[0].departureCity.caption;
          }
          let arrivalCity = "";
          if (!segments[0].arrivalCity) {
            arrivalCity = segments[0].arrivalAirport.caption;
          } else {
            arrivalCity = segments[0].arrivalCity.caption;
          }
          let departureAirport = segments[0].departureAirport.caption;
          let departureAirportUid = segments[0].departureAirport.uid;
          let arrivalAirportUid = segments[0].arrivalAirport.uid;
          let arrivalAirport = segments[0].arrivalAirport.caption;
          let departureDate = segments[0].departureDate;
          let arrivalDate = segments[0].arrivalDate;
          let airline = segments[0].airline.caption;
          return {
            departureCity,
            arrivalCity,
            departureAirport,
            departureAirportUid,
            arrivalAirport,
            arrivalAirportUid,
            airline,
            departureDate,
            arrivalDate,
            transfer,
          };
        }
      }
      const to = getDataLeg(toData);
      const back = getDataLeg(backData);

      return { to, back, price, carrier };
    });

    createListAirlines(resultData);
    renderFilterPage();
    return resultData;
  });

  //Создание Карточки каждого перелета

  class FlightCard {
    constructor(data, parentSelector) {
      this.departureCityTo = data.to.departureCity;
      this.departureAirportTo = data.to.departureAirport;
      this.departureAirportUidTo = data.to.departureAirportUid;
      this.arrivalDateTo = data.to.arrivalDate;
      this.departureDateTo = data.to.departureDate;
      this.arrivalCityTo = data.to.arrivalCity;
      this.arrivalAirportTo = data.to.arrivalAirport;
      this.arrivalAirportUidTo = data.to.arrivalAirportUid;
      this.transferTo = data.to.transfer;
      this.airlineTo = data.to.airline;
      this.travelTimeTo = this.calcTravelTime(
        this.arrivalDateTo,
        this.departureDateTo
      );
      this.departureAirport = data.to.departureAirport;
      this.arrivalAirport = data.to.arrivalAirport;

      this.price = data.price;

      this.departureCityBack = data.back.departureCity;
      this.departureAirportBack = data.back.departureAirport;
      this.departureAirportUidBack = data.back.departureAirportUid;
      this.arrivalDateBack = data.back.arrivalDate;
      this.departureDateBack = data.back.departureDate;
      this.arrivalCityBack = data.back.arrivalCity;
      this.arrivalAirportBack = data.back.arrivalAirport;
      this.arrivalAirportUidBack = data.back.arrivalAirportUid;
      this.transferBack = data.back.transfer;
      this.airlineBack = data.back.airline;
      this.travelTimeBack = this.calcTravelTime(
        this.arrivalDateBack,
        this.departureDateBack
      );
      this.priceBack = data.back.passengerPrices;
      this.departureAirport = data.back.departureAirport;
      this.arrivalAirport = data.back.arrivalAirport;

      this.parent = document.querySelector(parentSelector);

      this.arrivalDateBackMod = this.getBindDate(this.arrivalDateBack);
      this.arrivalDateToMod = this.getBindDate(this.arrivalDateTo);
      this.departureDateBackMod = this.getBindDate(this.departureDateBack);
      this.departureDateToMod = this.getBindDate(this.departureDateTo);
    }

    //Приведение даты к нужному формату

    getBindDate(d) {
      const bindDate = new Date(Date.parse(d)).getDate();
      const bindTime = new Date(Date.parse(d))
        .toLocaleTimeString()
        .slice(0, -3);

      function getWeekDay(date) {
        let days = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
        return days[new Date(Date.parse(date)).getDay()];
      }

      function getMounthName(date) {
        let days = [
          "янв.",
          "фев.",
          "мар.",
          "апр.",
          "май.",
          "июн.",
          "июл.",
          "авг.",
          "сен.",
          "окт.",
          "ноя.",
          "дек.",
        ];
        return days[new Date(Date.parse(date)).getMonth()];
      }

      const bindDay = getWeekDay(d);
      const bindMounth = getMounthName(d);

      return {
        bindDate,
        bindMounth,
        bindTime,
        bindDay,
      };
    }

    //Расчет времени в пути. Имеется ввиду время в один конец

    calcTravelTime(a, b) {
      const t = Date.parse(a) - Date.parse(b),
        days = Math.floor(t / (1000 * 60 * 60 * 24)),
        hours = Math.floor((t / (1000 * 60 * 60)) % 24),
        minutes = Math.floor((t / (1000 * 60)) % 60);

      let travelTime = {
        total: t,
        days: days,
        hours: hours,
        minutes: minutes,
      };
      return travelTime;
    }

    //Отрисовка одной карточки

    render() {
      const template = document.createElement("div");
      template.classList.add("flight");
      template.innerHTML = `
      <div class="flight__header">
      <div class="flight__price">${this.price} &#x20BD</div>
      <div class="flight__price-text">Стоимость для одного взрослого пассажира</div>
      </div>
      <div class="flight__content">
        <div class="flight__info">
          <div class="flight__info-cities">
          <div class="flight__info-city-group">
                <div class="flight__info-city">${this.departureCityTo}</div>
                <div class="flight__info-city">${this.departureAirportTo}</div>
                <div class="flight__info-city flight__info-city_blue">(${
                  this.departureAirportUidTo
                })</div>
            </div>
            <div class="right-arrow"></div>
            <div class="flight__info-city-group">
                <div class="flight__info-city">${this.arrivalCityTo}</div>
                <div class="flight__info-city">${this.arrivalAirportTo}</div>
                <div class="flight__info-city flight__info-city_blue">(${
                  this.arrivalAirportUidTo
                })</div>
            </div>
          </div>
          <div class="flight__info-times">
            <div class="flight__info-time">
            <span class="flight__info-time-time">${
              this.departureDateToMod.bindTime
            } </span>
            <span class="flight__info-time-date flight__info-city_blue">${
              this.departureDateToMod.bindDate
            } ${this.departureDateToMod.bindMounth} ${
        this.departureDateToMod.bindDay
      }</span>
            </div>
            <div class="flight__info-time flight__info-time_clock">${
              this.travelTimeTo.days > 0
                ? this.travelTimeTo.days +
                  " д " +
                  this.travelTimeTo.hours +
                  " ч " +
                  this.travelTimeTo.minutes +
                  " мин "
                : this.travelTimeTo.hours +
                  " ч " +
                  this.travelTimeTo.minutes +
                  " мин "
            }</div>
            <div class="flight__info-time">
            <span class="flight__info-time-time">${
              this.arrivalDateToMod.bindTime
            } </span>
            <span class="flight__info-time-date flight__info-city_blue">${
              this.arrivalDateToMod.bindDate
            } ${this.arrivalDateToMod.bindMounth} ${
        this.arrivalDateToMod.bindDay
      }</span>
             </div>
          </div>
          <div class="flight__info-transfer">
            <div class="flight__empty"></div>
            <div class="flight__info-transfer-content">${
              this.transferTo > 0
                ? `<div class="flight__info-transfer-text">${
                    this.transferTo + " пересадка"
                  }</div>`
                : `<div class="flight__empty flight__empty_new"></div>`
            }</div>
            <div class="flight__empty"></div>
          </div>
          <div class="flight__info-airlines flight__info-airlines_border">Рейс выполняет: ${
            this.airlineTo
          }</div>
        </div>
        <div class="flight__info">
        <div class="flight__info-cities">
        <div class="flight__info-city-group">
            <div class="flight__info-city">${this.departureCityBack}</div>
            <div class="flight__info-city">${this.departureAirportBack}</div>
            <div class="flight__info-city flight__info-city_blue">(${
              this.departureAirportUidBack
            })</div>
        </div>
        <div class="right-arrow"></div>
        <div class ="flight__info-city-group">
            <div class="flight__info-city">${this.arrivalCityBack}</div>
            <div class="flight__info-city">${this.arrivalAirportBack}</div>
            <div class="flight__info-city flight__info-city_blue">(${
              this.arrivalAirportUidBack
            })</div>
        </div>
          </div>
          <div class="flight__info-times">
            <div class="flight__info-time">
            <span class="flight__info-time-time">${
              this.departureDateBackMod.bindTime
            } </span>
            <span class="flight__info-time-date flight__info-city_blue">${
              this.departureDateBackMod.bindDate
            } ${this.departureDateBackMod.bindMounth} ${
        this.departureDateBackMod.bindDay
      }</span></div>
            <div class="flight__info-time flight__info-time_clock">${
              this.travelTimeBack.days > 0
                ? this.travelTimeBack.days +
                  " д " +
                  this.travelTimeBack.hours +
                  " ч " +
                  this.travelTimeBack.minutes +
                  " мин "
                : this.travelTimeBack.hours +
                  " ч " +
                  this.travelTimeBack.minutes +
                  " мин "
            }</div>
            <div class="flight__info-time">
            <span class="flight__info-time-time">${
              this.arrivalDateBackMod.bindTime
            } </span>
            <span class="flight__info-time-date flight__info-city_blue">${
              this.arrivalDateBackMod.bindDate
            } ${this.arrivalDateBackMod.bindMounth} ${
        this.arrivalDateBackMod.bindDay
      }</span></div>
          </div>
          <div class="flight__info-transfer">
            <div class="flight__empty"></div>
            <div class="flight__info-transfer-content">${
              this.transferBack > 0
                ? `<div class="flight__info-transfer-text">${
                    this.transferBack + " пересадка"
                  }</div>`
                : `<div class="flight__empty flight__empty_new"></div>`
            }</div>
            <div class="flight__empty"></div>
          </div>
          <div class="flight__info-airlines">Рейс выполняет: ${
            this.airlineBack
          }</div>
        </div>
      </div>
      <button class="flight__button">Выбрать</button>
      `;
      this.parent.append(template);
    }
  }

  //функция создания всех карточек. Принимает: отфильтрованный массив перелетов,
  //кол-во страниц, которое может быть в этом массиве, с учетом того, что выводим по 2 карточки, счетчик страниц

  function createFlightCard(arr, arrPages, pageCount) {
    let max = arrPages[pageCount].index;
    const newShowContent = document.querySelector(".result__button");
    if (pageCount == arrPages.length - 1) {
      newShowContent.classList.add("hide");
    } else {
      newShowContent.classList.remove("hide");
    }
    if (pageCount > 0) {
      arr.map((item, index) => {
        let p = max - 2;
        if (index < max && index >= p) {
          new FlightCard(item, ".flights").render();
        }
      });
    } else {
      flights.innerHTML = "";
      arr.map((item, index) => {
        if (index < max) {
          new FlightCard(item, ".flights").render();
        }
      });
    }
  }

  //функция создания списка авиакомпаний для фильтрации.
  //Генерит их на основе полного списка перелетов, берет оттуда данные о перевозчиках,
  //группирует по названиям и выводит мин.стоимость

  function createListAirlines(arr) {
    const res = arr.map((item) => {
      let collec = { carrier: item.carrier, price: item.price };
      return collec;
    });

    const groupBy = res.reduce((acc, cur) => {
      acc[cur.carrier] = acc[cur.carrier] || {
        carrier: cur.carrier,
        prices: [],
      };
      acc[cur.carrier].prices.push(cur.price);
      return acc;
    }, {});

    const groupList = Object.values(groupBy);

    const parent = document.querySelector(".nav__item-airlines-wrapper");

    groupList.map((item) => {
      const template = document.createElement("li");
      const minPrice = Math.min.apply(null, item.prices);
      template.classList.add("item__airline");
      template.innerHTML = `
      <label class="item__airline-title"> 
        <input type="checkbox" name="airline" value="${item.carrier}" id="airline" />
          <span>- ${item.carrier}</span>
      </label>
      <div> от ${minPrice} р.</div>
      `;
      parent.append(template);
    });
  }

  //Список фильтров. По умолчанию стоит сортировка по возрастанию цены

  const flights = document.querySelector(".flights");
  const nav = document.querySelector(".nav");

  let filters = {
    sort_by: "priceUp",
    transfer: [],
    price_from: 0,
    price_to: 1000000,
    airline: [],
  };

  let arrAirlines = [];
  let arrTransfer = [];

  let pageCount = 0;

  //функция фильтрации. Проверяет исходный массив на соответствие фильтрам и
  //создает новый массив с отфильтрованными перелетами
  //создает массив страниц с соответствующими индексами элементов

  function renderFilterPage() {
    let arrFilterCard = [];
    let startArray = [];

    resultData.map((item) => {
      if (
        (filters.transfer.length != 0
          ? item.to.transfer == item.back.transfer &&
            item.to.transfer ==
              filters.transfer.find((el) => el == item.to.transfer) &&
            item.back.transfer ==
              filters.transfer.find((el) => el == item.back.transfer)
          : item) &&
        item.price >= filters.price_from &&
        item.price <= filters.price_to &&
        (filters.airline.length != 0
          ? item.carrier == filters.airline.find((el) => el == item.carrier)
          : item.carrier)
      ) {
        arrFilterCard.push(item);
      }

      if (filters.sort_by == "priceUp") {
        arrFilterCard.sort(function (a, b) {
          if (a.price > b.price) {
            return 1;
          }
          if (a.price < b.price) {
            return -1;
          }
          return 0;
        });
      } else if (filters.sort_by == "priceDown") {
        arrFilterCard.sort(function (a, b) {
          if (a.price < b.price) {
            return 1;
          }
          if (a.price > b.price) {
            return -1;
          }
          return 0;
        });
      } else if (filters.sort_by == "timeTrip") {
        const mapped = arrFilterCard.map(function (el, i) {
          return {
            index: i,
            value:
              Date.parse(el.to.arrivalDate) -
              Date.parse(el.to.departureDate) +
              (Date.parse(el.back.arrivalDate) -
                Date.parse(el.back.departureDate)),
          };
        });

        mapped.sort(function (a, b) {
          if (a.value > b.value) {
            return 1;
          }
          if (a.value < b.value) {
            return -1;
          }
          return 0;
        });

        arrFilterCard = mapped.map(function (el) {
          return arrFilterCard[el.index];
        });
      }
    });
    let pages = Math.ceil(arrFilterCard.length / 2);
    let indexCount = 0;

    for (let page = 1; page <= pages; page++) {
      indexCount += 2;
      let value = { page: page, index: indexCount };
      startArray.push(value);
    }

    pageCount = 0;
    flights.innerHTML = "";
    if (arrFilterCard.length == 0) {
      flights.textContent = "Перелетов с такими параметрами не найдено";
    } else {
      createFlightCard(arrFilterCard, startArray, pageCount);
    }

    //каждый раз при фильтрации удаляю и создаю заново кнопку "Показать еще", чтобы
    // решить проблему дублирования обработчиков и на ней был только один обработчик по клику

    let showContent = document.querySelector(".result__button");
    showContent.parentNode.removeChild(showContent);

    let newShowContent = document.createElement("button");
    newShowContent.classList.add("result__button");
    newShowContent.textContent = "Показать еще";
    const resultHtml = document.querySelector(".results__container");
    resultHtml.append(newShowContent);

    //функция показывает следующие 2 карточки

    function show() {
      pageCount++;
      createFlightCard(arrFilterCard, startArray, pageCount);
    }

    newShowContent.addEventListener("click", show);
  }

  //навешиваю обработчики событий на фильтры и фильтрую

  nav.addEventListener("change", (e) => {
    let value = e.target.value;
    let checked = e.target.checked;
    let type = e.target.type;
    let name = e.target.getAttribute("name");

    if (name == "airline" && checked == true) {
      arrAirlines.push(value);
      filters[name] = arrAirlines;
    } else if (name == "airline" && checked == false) {
      let s = arrAirlines.findIndex((el) => el === value);
      arrAirlines.splice(s, 1);
    } else if (name == "transfer" && checked == true) {
      arrTransfer.push(value);
      filters[name] = arrTransfer;
    } else if (name == "transfer" && checked == false) {
      let s = arrTransfer.findIndex((el) => el === value);
      arrTransfer.splice(s, 1);
    } else {
      filters[name] = value;
    }

    renderFilterPage();
  });
});
