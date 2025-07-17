const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");

userInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        let question = userInput.value;
        userInput.value = "";
        appendMessage(question, "user");
        getAnswer(question);
    }
});

function appendMessage(message, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    messageDiv.textContent = message;
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

async function getAnswer(question) {
    console.log("Pytanie użytkownika: ", question); // Logowanie pytania
    const symbol = extractStockSymbol(question); // Wyciąganie symbolu akcji
    const period = extractTimePeriod(question); // Wyciąganie okresu (np. 2 tygodnie)
    
    console.log("Symbol akcji: ", symbol); // Logowanie symbolu akcji
    console.log("Okres: ", period); // Logowanie okresu

    if (symbol && period) {
        const data = await fetchStockData(symbol, period); // Pobranie danych o akcjach
        const prediction = predictStockPrice(data); // Predykcja zmiany ceny
        appendMessage(prediction, "bot");
    } else {
        appendMessage("Nie rozumiem pytania, spróbuj ponownie.", "bot");
    }
}

function extractStockSymbol(question) {
    const symbols = ["PKN Orlen", "CD Projekt", "KGHM", "Allegro", "LPP", "JSW", "PGE"]; // Lista spółek
    for (let symbol of symbols) {
        if (question.toLowerCase().includes(symbol.toLowerCase())) {
            return symbol;
        }
    }
    return null;
}

function extractTimePeriod(question) {
    const regex = /(\d+)\s*(tygodni|dni|miesięcy)/i;
    const match = question.match(regex);
    return match ? match[1] : null;
}

async function fetchStockData(symbol, period) {
    const apiKey = 'DQW98VSE85U7W3QX'; // Twój klucz API
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Obsługa przypadku, gdy dane nie są dostępne
    if (data['Error Message']) {
        return "Błąd: nie można pobrać danych. Sprawdź symbol spółki.";
    }

    return data;
}

function predictStockPrice(data) {
    if (data && data["Time Series (Daily)"]) {
        const dates = Object.keys(data["Time Series (Daily)"]);
        const latestPrice = parseFloat(data["Time Series (Daily)"][dates[0]]["4. close"]);
        const prevPrice = parseFloat(data["Time Series (Daily)"][dates[1]]["4. close"]);
        const change = (latestPrice - prevPrice) / prevPrice * 100;
        return `Cena akcji zmieniła się o ${change.toFixed(2)}% w ostatnich dniach.`;
    }
    return "Nie mogę uzyskać danych dla tej spółki.";
}
