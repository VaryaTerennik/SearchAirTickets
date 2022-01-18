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
    console.log(res);
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
          let arrivalAirport = segments[1].arrivalAirport.caption;
          let departureDate = segments[0].departureDate;
          let arrivalDate = segments[1].arrivalDate;
          let airline = "";
          if (segments[0].airline.caption === segments[1].airline.caption) {
            airline = segments[0].airline.caption;
          } else {
            airline = `${segments[0].airline.caption} и ${segments[1].airline.caption}`;
            console.log("Два перевозчика");
          }
          return {
            departureCity,
            arrivalCity,
            departureAirport,
            arrivalAirport,
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
          let arrivalAirport = segments[0].arrivalAirport.caption;
          let departureDate = segments[0].departureDate;
          let arrivalDate = segments[0].arrivalDate;
          let airline = segments[0].airline.caption;
          return {
            departureCity,
            arrivalCity,
            departureAirport,
            arrivalAirport,
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
    console.log(resultData);
    createFlightCard(resultData);
    createListAirlines(resultData);
    return resultData;
  });

  class FlightCard {
    constructor(data, parentSelector) {
      this.departureCityTo = data.to.departureCity;
      this.departureAirportTo = data.to.departureAirport;
      this.arrivalDateTo = data.to.arrivalDate;
      this.departureDateTo = data.to.departureDate;
      this.arrivalCityTo = data.to.arrivalCity;
      this.arrivalAirportTo = data.to.arrivalAirport;
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
      this.arrivalDateBack = data.back.arrivalDate;
      this.departureDateBack = data.back.departureDate;
      this.arrivalCityBack = data.back.arrivalCity;
      this.arrivalAirportBack = data.back.arrivalAirport;
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
        let days = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];
        return days[new Date(Date.parse(date)).getDay()];
      }

      function getMounthName(date) {
        let days = [
          "янв",
          "фев",
          "мар",
          "апр",
          "май",
          "июн",
          "июл",
          "авг",
          "сен",
          "окт",
          "ноя",
          "дек",
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
      <div class="flight__price">${this.price} РУБ</div>
      <div class="flight__price-text">Стоимость для одного взрослого пассажира</div>
      </div>
      <div class="flight__content">
        <div class="flight__info">
          <div class="flight__info-cities">
          <div class="flight__info-city-group">
                <div class="flight__info-city">${this.departureCityTo}</div>
                <div class="flight__info-city">${this.departureAirportTo}</div>
            </div>
            <div class="flight__info-city-group">
                <div class="flight__info-city">${this.arrivalCityTo}</div>
                <div class="flight__info-city">${this.arrivalAirportTo}</div>
            </div>
          </div>
          <div class="flight__info-times">
            <div class="flight__info-time">${this.departureDateToMod.bindTime} ${this.departureDateToMod.bindDate} ${this.departureDateToMod.bindMounth} ${this.departureDateToMod.bindDay}</div>
            <div class="flight__info-time">${this.travelTimeTo.hours}ч ${this.travelTimeTo.minutes} мин</div>
            <div class="flight__info-time">${this.arrivalDateToMod.bindTime} ${this.arrivalDateToMod.bindDate} ${this.arrivalDateToMod.bindMounth} ${this.arrivalDateToMod.bindDay}</div>
          </div>
          <div class="flight__info-transfer">${this.transferTo} пересадка</div>
          <div class="flight__info-airlines">Рейс выполняет:${this.airlineTo}</div>
        </div>
        <div class="flight__info">
        <div class="flight__info-cities">
        <div class="flight__info-city-group">
            <div class="flight__info-city">${this.departureCityBack}</div>
            <div class="flight__info-city">${this.departureAirportBack}</div>
        </div>
        <div class ="flight__info-city-group">
            <div class="flight__info-city">${this.arrivalCityBack}</div>
            <div class="flight__info-city">${this.arrivalAirportBack}</div>
        </div>
          </div>
          <div class="flight__info-times">
            <div class="flight__info-time">${this.departureDateBackMod.bindTime} ${this.departureDateBackMod.bindDate} ${this.departureDateBackMod.bindMounth} ${this.departureDateBackMod.bindDay}</div>
            <div class="flight__info-time">${this.travelTimeBack.hours}ч ${this.travelTimeBack.minutes} мин</div>
            <div class="flight__info-time">${this.arrivalDateBackMod.bindTime} ${this.arrivalDateBackMod.bindDate} ${this.arrivalDateBackMod.bindMounth} ${this.arrivalDateBackMod.bindDay}</div>
          </div>
          <div class="flight__info-transfer">${this.transferBack} пересадка</div>
          <div class="flight__info-airlines">Рейс выполняет:${this.airlineBack}</div>
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

  // class AirlinesList {
  //   constructor(data, parentSelector) {
  //     this.airlineTo = data.to.airline;
  //     this.airlineBack = data.back.airline;
  //     this.parent = document.querySelector(parentSelector);
  //     this.collectionAir = this.createListAirlines(
  //       this.airlineTo,
  //       this.airlineBack
  //     );
  //     this.price = data.price;
  //   }

  //   createListAirlines(a, b) {
  //     const collec = [];
  //     collec.push(a);
  //     collec.push(b);
  //   }

  //   render() {
  //     const template = document.createElement("div");
  //     template.classList.add("item__airline");
  //     templateAirlines.innerHTML = `
  //     <label class="item__airline">
  //       <input type="checkbox" id="airline" />
  //         <span></span>
  //         <span></span>
  //     </label>
  //     `;
  //     this.parent.append(template);
  //   }
  // }

  // function pushAirline(a, b) {
  //   const collec = [];
  //   collec.push(a, b);
  //   console.log(collec);
  //   return collec;
  // }

  function createListAirlines(arr) {
    const res = arr.map((item) => {
      let collec = { carrier: item.carrier, price: item.price };
      return collec;
    });
    console.log(res);

    // function groupBy(list, keyGetter) {
    //   const map = new Map();
    //   list.forEach((item) => {
    //     const key = keyGetter(item);
    //     const collection = map.get(key);
    //     if (!collection) {
    //       map.set(key, [item]);
    //     } else {
    //       collection.push(item);
    //     }
    //   });
    //   return map;
    // }

    // const grouped = groupBy(res, (item) => item.carrier);

    const parent = document.querySelector(".nav__item-airlines-wrapper");

    res.forEach((item) => {
      const template = document.createElement("div");
      template.classList.add("item__airline");
      template.innerHTML = `
      <label class="item__airline">
        <input type="checkbox" id="airline" />
          <span>${item.carrier}</span>
          <span></span>
      </label>
      `;
      parent.append(template);
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

  filterPriceUp.addEventListener("change", () => {
    flights.innerHTML = "";
    if (filterPriceUp.checked == true) {
      const mapped = resultData.map(function (el, i) {
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

      const result = mapped.map(function (el) {
        return resultData[el.index];
      });
      createFlightCard(result);
    } else {
      flights.innerHTML = "";
      createFlightCard(resultData);
    }
  });

  filterPriceDown.addEventListener("change", () => {
    flights.innerHTML = "";
    if (filterPriceDown.checked == true) {
      const mapped = resultData.map(function (el, i) {
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

      const result = mapped.map(function (el) {
        return resultData[el.index];
      });
      createFlightCard(result);
    } else {
      flights.innerHTML = "";
      createFlightCard(resultData);
    }
  });

  filterTransferOne.addEventListener("change", () => {
    flights.innerHTML = "";
    if (filterTransferOne.checked == true) {
      const result = resultData.filter(
        (el) => el.to.transfer > 0 && el.back.transfer > 0
      );
      createFlightCard(result);
    } else {
      flights.innerHTML = "";
      createFlightCard(resultData);
    }
  });

  filterTransferNone.addEventListener("change", () => {
    flights.innerHTML = "";
    if (filterTransferNone.checked == true) {
      const result = resultData.filter(
        (el) => el.to.transfer < 1 && el.back.transfer < 1
      );
      createFlightCard(result);
    } else {
      flights.innerHTML = "";
      createFlightCard(resultData);
    }
  });

  filterPriceDiff.addEventListener("input", (e) => {
    flights.innerHTML = "";
    let target = e.target;
    console.log(target.value);
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

  filterTripDuration.addEventListener("change", () => {
    flights.innerHTML = "";
    if (filterTripDuration.checked == true) {
      const mapped = resultData.map(function (el, i) {
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

      const result = mapped.map(function (el) {
        return resultData[el.index];
      });
      createFlightCard(result);
    } else {
      flights.innerHTML = "";
      createFlightCard(resultData);
    }
  });
});
