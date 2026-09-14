// ========================================
// AI CHAT
// ========================================

async function chat() {

    const message =
        document.getElementById("message")
            .value.trim();

    const reply =
        document.getElementById("reply");


    if (message === "") {

        reply.innerText =
            "⚠️ Please type or speak something.";

        return;

    }


    reply.innerText =
        "🤖 AI Tutor is thinking...";


    try {

        const response =
            await fetch("/chat", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    message: message

                })

            });


        const data =
            await response.json();


        if (!response.ok) {

            reply.innerText =
                "❌ " +
                (data.error ||
                "Something went wrong.");

            return;

        }


        reply.innerText =
            "🤖 " + data.reply;


        // Speak AI response

        speakText(data.reply);

    }

    catch (error) {

        console.error(error);

        reply.innerText =
            "❌ Cannot connect to backend.";

    }

}



// ========================================
// GRAMMAR CHECKER
// ========================================

async function checkGrammar() {

    const sentence =
        document.getElementById("sentence")
            .value.trim();

    const correction =
        document.getElementById("correction");


    if (sentence === "") {

        correction.innerText =
            "⚠️ Please enter a sentence.";

        return;

    }


    correction.innerText =
        "🤖 AI is checking your grammar...";


    try {

        const response =
            await fetch("/grammar", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    sentence: sentence

                })

            });


        const data =
            await response.json();


        if (!response.ok) {

            correction.innerText =
                "❌ " +
                (data.error ||
                "Something went wrong.");

            return;

        }


        correction.innerText =
            data.correction;

    }

    catch (error) {

        console.error(error);

        correction.innerText =
            "❌ Cannot connect to backend.";

    }

}



// ========================================
// VOICE INPUT
// ========================================

function startVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        alert(
            "Voice recognition is not supported. Please use Google Chrome."
        );

        return;

    }


    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-US";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    const reply =
        document.getElementById("reply");


    recognition.start();


    reply.innerText =
        "🎤 Listening...";


    recognition.onresult =
        function(event) {

            const text =
                event.results[0][0]
                    .transcript;


            document.getElementById("message")
                .value = text;


            reply.innerText =
                "🎤 You said: " + text;


            // Automatically send to AI

            chat();

        };


    recognition.onerror =
        function(event) {

            console.error(
                "Voice Error:",
                event.error
            );


            reply.innerText =
                "❌ Voice recognition failed. Try again.";

        };

}



// ========================================
// AI VOICE OUTPUT
// ========================================

function speakText(text) {

    if (!("speechSynthesis" in window)) {

        return;

    }


    // Stop previous voice

    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(text);


    speech.lang =
        "en-US";


    speech.rate =
        0.9;


    speech.pitch =
        1;


    window.speechSynthesis.speak(
        speech
    );

}