const fromInput = document.querySelector(".box1 input");
const toInput = document.querySelectorAll(".box input")[1];

const infoLeft = document.querySelectorAll(".info")[0];
const infoRight = document.querySelectorAll(".info")[1];

const buyValue = document.querySelectorAll(".value")[0];
const sellValue = document.querySelectorAll(".value")[1];

const fromButtons = document.querySelectorAll("#fromCurrency button");
const toButtons = document.querySelectorAll("#toCurrency button");
const bankButtons = document.querySelectorAll("#bankSelect button");

const box1 = document.querySelector(".box1");

const offlineMessage = document.createElement("div");
offlineMessage.innerText = "İnternet yoxdur";
offlineMessage.classList.add("offline-message");
box1.appendChild(offlineMessage);



let rates = null;
let activeSide = "from";

const banks = {
    ABC: { buy: 1, sell: 0.5 },
    NEW: { buy: 2, sell: 1 },
    AME: { buy: 1.5, sell: 1.5 },
    RED: { buy: 0.5, sell: 0.5 }
};



function onlyNumbers(input) {
    input.addEventListener("input", function () {

       
        this.value = this.value.replace(/[^0-9.]/g, "");

   
        this.value = this.value.replace(/(\..*)\./g, "$1");

        let parts = this.value.split(".");

        // 4 decimal limit
        if (parts[1] && parts[1].length > 4) {
            parts[1] = parts[1].slice(0, 4);
            this.value = parts[0] + "." + parts[1];
        }

        // MAX 10000 LIMIT
        let num = Number(this.value);
        if (num > 10000) {
            this.value = "10000";
        }
    });
}

onlyNumbers(fromInput);
onlyNumbers(toInput);



function getActiveValue(buttons) {
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].classList.contains("active")) {
            return buttons[i].innerText;
        }
    }
}



function loadRates() {

    if (!navigator.onLine) {
        let saved = localStorage.getItem("currencyRates");

        if (saved) {
            rates = JSON.parse(saved);
            offlineMessage.style.display = "block";
            convert();
        }
        return;
    }

    fetch("https://open.er-api.com/v6/latest/USD")
        .then(res => res.json())
        .then(data => {

            rates = data.rates;

            localStorage.setItem("currencyRates", JSON.stringify(rates));

            offlineMessage.style.display = "none";
            convert();
        })
        .catch(() => {
            let saved = localStorage.getItem("currencyRates");

            if (saved) {
                rates = JSON.parse(saved);
                offlineMessage.style.display = "block";
                convert();
            }
        });
}

loadRates();



window.addEventListener("offline", () => {
    offlineMessage.style.display = "block";
});

window.addEventListener("online", () => {
    offlineMessage.style.display = "none";
    loadRates();
});



function convert() {

    if (!rates) return;

    let from = getActiveValue(fromButtons);
    let to = getActiveValue(toButtons);
    let bankName = getActiveValue(bankButtons);

    let bank = banks[bankName];

    let rate = rates[to] / rates[from];

    let amount = activeSide === "from"
        ? Number(fromInput.value)
        : Number(toInput.value);

    if (!amount) {
        buyValue.innerText = "0.00";
        sellValue.innerText = "0.00";
        return;
    }

    if (amount > 10000) amount = 10000;



    // FROM - TO
    if (activeSide === "from") {

        let result = amount * rate;

        toInput.value = result.toFixed(4);

        let buy = rate * (1 - bank.buy / 100);
        let sell = rate * (1 + bank.sell / 100);

        buyValue.innerText = (amount * buy).toFixed(4);
        sellValue.innerText = (amount * sell).toFixed(4);

    }

    // TO - FROM
    else {

        let result = amount / rate;

        fromInput.value = result.toFixed(4);

        let buy = rate * (1 + bank.sell / 100);
        let sell = rate * (1 - bank.buy / 100);

        buyValue.innerText = (amount / buy).toFixed(4);
        sellValue.innerText = (amount / sell).toFixed(4);
    }



    // INFO
    infoLeft.innerText =
        "1 " + from + " = " + rate.toFixed(4) + " " + to;

    infoRight.innerText =
        "1 " + to + " = " + (1 / rate).toFixed(4) + " " + from;
}



fromInput.addEventListener("input", () => {
    activeSide = "from";
    convert();
});

toInput.addEventListener("input", () => {
    activeSide = "to";
    convert();
});



function setupButtons(buttons) {

    for (let i = 0; i < buttons.length; i++) {

        buttons[i].addEventListener("click", function () {

            for (let j = 0; j < buttons.length; j++) {
                buttons[j].classList.remove("active");
            }

            this.classList.add("active");

            convert();
        });
    }
}

setupButtons(fromButtons);
setupButtons(toButtons);
setupButtons(bankButtons);