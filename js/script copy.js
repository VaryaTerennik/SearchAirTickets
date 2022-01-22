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
          transfer = "";
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
    createFlightCard(resultData);
    createListAirlines(resultData);
    return resultData;
  });

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
                <div class="flight__info-city flight__info-city_blue">(${this.departureAirportUidTo})</div>
            </div>
            <div class="right-arrow"></div>
            <div class="flight__info-city-group">
                <div class="flight__info-city">${this.arrivalCityTo}</div>
                <div class="flight__info-city">${this.arrivalAirportTo}</div>
                <div class="flight__info-city flight__info-city_blue">(${this.arrivalAirportUidTo})</div>
            </div>
          </div>
          <div class="flight__info-times">
            <div class="flight__info-time">
            <span class="flight__info-time-time">${this.departureDateToMod.bindTime} </span>
            <span class="flight__info-time-date flight__info-city_blue">${this.departureDateToMod.bindDate} ${this.departureDateToMod.bindMounth} ${this.departureDateToMod.bindDay}</span>
            </div>
            <div class="flight__info-time flight__info-time_clock">${this.travelTimeTo.hours}ч ${this.travelTimeTo.minutes} мин</div>
            <div class="flight__info-time">
            <span class="flight__info-time-time">${this.arrivalDateToMod.bindTime} </span>
            <span class="flight__info-time-date flight__info-city_blue">${this.arrivalDateToMod.bindDate} ${this.arrivalDateToMod.bindMounth} ${this.arrivalDateToMod.bindDay}</span>
             </div>
          </div>
          <div class="flight__info-transfer">${this.transferTo} пересадка</div>
          <div class="flight__info-airlines flight__info-airlines_border">Рейс выполняет: ${this.airlineTo}</div>
        </div>
        <div class="flight__info">
        <div class="flight__info-cities">
        <div class="flight__info-city-group">
            <div class="flight__info-city">${this.departureCityBack}</div>
            <div class="flight__info-city">${this.departureAirportBack}</div>
            <div class="flight__info-city flight__info-city_blue">(${this.departureAirportUidBack})</div>
        </div>
        <div class="right-arrow"></div>
        <div class ="flight__info-city-group">
            <div class="flight__info-city">${this.arrivalCityBack}</div>
            <div class="flight__info-city">${this.arrivalAirportBack}</div>
            <div class="flight__info-city flight__info-city_blue">(${this.arrivalAirportUidBack})</div>
        </div>
          </div>
          <div class="flight__info-times">
            <div class="flight__info-time">
            <span class="flight__info-time-time">${this.departureDateBackMod.bindTime} </span>
            <span class="flight__info-time-date flight__info-city_blue">${this.departureDateBackMod.bindDate} ${this.departureDateBackMod.bindMounth} ${this.departureDateBackMod.bindDay}</span></div>
            <div class="flight__info-time flight__info-time_clock">${this.travelTimeBack.hours}ч ${this.travelTimeBack.minutes} мин</div>
            <div class="flight__info-time">
            <span class="flight__info-time-time">${this.arrivalDateBackMod.bindTime} </span>
            <span class="flight__info-time-date flight__info-city_blue">${this.arrivalDateBackMod.bindDate} ${this.arrivalDateBackMod.bindMounth} ${this.arrivalDateBackMod.bindDay}</span></div>
          </div>
          <div class="flight__info-transfer">${this.transferBack} пересадка</div>
          <div class="flight__info-airlines">Рейс выполняет: ${this.airlineBack}</div>
        </div>
      </div>
      <button class="flight__button">Выбрать</button>
      `;
      this.parent.append(template);
    }
  }

  function createFlightCard(arr) {
    arr.map((item) => {
      new FlightCard(item, ".flights").render();
    });
  }

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
      // let carrierName = "";
      // if (item.carrier.length > 21) {
      //   carrierName = item.carrier.substring(0, 13) + "...";
      // } else {
      //   carrierName = item.carrier;
      // }
      template.innerHTML = `
      <label class="item__airline-title"> 
        <input type="checkbox" id="airline" />
          <span>- ${item.carrier}</span>
      </label>
      <div> от ${minPrice} р.</div>
      `;
      parent.append(template);
    });

    const filterAirline = document.querySelectorAll("#airline");

    filterAirline.forEach((item) => {
      item.addEventListener("change", (e) => {
        flights.innerHTML = "";
        let target = e.target;
        let parent = target.closest(".item__airline-title");

        if (item.checked == true) {
          const result = resultData.filter(
            (el) =>
              el.carrier.replace(/\s+/g, "") ==
              parent.textContent
                .replace(/\s+/g, "")
                .substring(1, parent.textContent.length)
          );
          createFlightCard(result);
        } else {
          flights.innerHTML = "";
          createFlightCard(resultData);
        }
      });
    });
  }

  const filterPriceUp = document.querySelector("#price-increase");
  const filterPriceDown = document.querySelector("#price-decrease");
  const filterTripDuration = document.querySelector("#sort-traveltime");
  const filterTransferOne = document.querySelector("#transfer-one");
  const filterTransferNone = document.querySelector("#transfer-none");
  const filterPriceDiff = document.querySelector(".nav__item-price");
  const priceStart = document.querySelector("#price-start");
  const priceEnd = document.querySelector("#price-end");
  const flights = document.querySelector(".flights");

  const filterFirst = document.querySelector(".nav__item-filter-first");
  const filterSecond = document.querySelector(".nav__item-filter-second");
  const nav = document.querySelector(".nav");

  let resultFilter = "";

  nav.addEventListener("change", (e) => {
    let arr = "";

    if (resultFilter == "") {
      arr = resultData;
    } else {
      arr = resultFilter;
    }

    flights.innerHTML = "";
    const tfilprice = e.target;
    console.log(tfilprice.id);

    if (tfilprice.id == filterPriceUp.id) {
      const mapped = arr.map(function (el, i) {
        return { index: i, value: el.price };
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

      resultFilter = mapped.map(function (el) {
        return arr[el.index];
      });
      createFlightCard(resultFilter);
    } else if (tfilprice.id == filterPriceDown.id) {
      const mapped = arr.map(function (el, i) {
        return { index: i, value: el.price };
      });

      mapped.sort(function (a, b) {
        if (a.value < b.value) {
          return 1;
        }
        if (a.value > b.value) {
          return -1;
        }
        return 0;
      });

      resultFilter = mapped.map(function (el) {
        return arr[el.index];
      });
      createFlightCard(resultFilter);
    } else if (tfilprice.id == filterTripDuration.id) {
      const mapped = arr.map(function (el, i) {
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

      resultFilter = mapped.map(function (el) {
        return arr[el.index];
      });
      createFlightCard(resultFilter);
    } else if (tfilprice.id == filterTransferOne.id) {
      resultFilter = arr.filter(
        (el) => el.to.transfer > 0 && el.back.transfer > 0
      );
      createFlightCard(resultFilter);
    } else if (tfilprice.id == filterTransferNone.id) {
      resultFilter = resultData.filter(
        (el) => el.to.transfer < 1 && el.back.transfer < 1
      );
      createFlightCard(resultFilter);
    } else {
      flights.innerHTML = "";
      resultFilter = resultData;
      createFlightCard(resultFilter);
    }
  });

  filterPriceDiff.addEventListener("input", (e) => {
    flights.innerHTML = "";
    let target = e.target;
    if (target == priceStart || target == priceEnd) {
      const result = resultData.filter(
        (el) => el.price > priceStart.value && el.price < priceEnd.value
      );
      if (result.length == 0) {
        flights.textContent =
          "Перелетов с такими параметрами не найдено. Введите другую сумму";
      } else {
        createFlightCard(result);
      }
    } else {
      flights.innerHTML = "";
      createFlightCard(resultData);
    }
  });
});
