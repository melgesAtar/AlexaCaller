import express from "express";
import bodyParser from "body-parser";
import alexaVerifier from "alexa-verifier";
const port = process.env.PORT || 3000;
const app = express();
var isFisrtTime = true;
const SKILL_NAME = "Heróis da Disney";
const GET_HERO_MESSAGE = "Aqui está o seu herói: ";
const HELP_MESSAGE =
  'Você pode dizer "Por favor, me traga um herói" ou pode dizer "sair"... Como posso te ajudar?';
const HELP_REPROMPT = "O que você gostaria de fazer?";
const STOP_MESSAGE = "Aproveite o dia... Adeus!";
const MORE_MESSAGE = "Você quer mais?";
const PAUSE = '<break time="0.3s" />';
const WHISPER = '<amazon:effect name="whispered"/>';

const data = [
  "Aladdin  ",
  "Cindrella ",
  "Bambi",
  "Bella ",
  "Bolt ",
  "Donald Duck",
  "Genie ",
  "Goofy",
  "Mickey Mouse",
];

app.use(
  bodyParser.json({
    verify: function getRawBody(req, res, buf) {
      req.rawBody = buf.toString();
    },
  })
);

function requestVerifier(req, res, next) {
  alexaVerifier(
    req.headers.signaturecertchainurl,
    req.headers.signature,
    req.rawBody,
    function verificationCallback(err) {
      if (err) {
        res.status(401).json({
          message: "Verification Failure",
          error: err,
        });
      } else {
        next();
      }
    }
  );
}

function log() {
  if (true) {
    console.log.apply(console, arguments);
  }
}

app.post("/disneyheroes", requestVerifier, function (req, res) {
  if (req.body.request.type === "LaunchRequest") {
    res.json(getNewHero());
    isFisrtTime = false;
  } else if (req.body.request.type === "SessionEndedRequest") {
    /* ... */
    log("Session End");
  } else if (req.body.request.type === "IntentRequest") {
    switch (req.body.request.intent.name) {
      case "AMAZON.YesIntent":
        res.json(getNewHero());
        break;
      case "AMAZON.NoIntent":
        res.json(stopAndExit());
        break;
      case "AMAZON.HelpIntent":
        res.json(help());
        break;
      default:
    }
  }
});

function handleDataMissing() {
  return buildResponse(MISSING_DETAILS, true, null);
}

function stopAndExit() {
  const speechOutput = STOP_MESSAGE;
  var jsonObj = buildResponse(speechOutput, true, "");
  return jsonObj;
}

function help() {
  const speechOutput = HELP_MESSAGE;
  const reprompt = HELP_REPROMPT;
  var jsonObj = buildResponseWithRepromt(speechOutput, false, "", reprompt);

  return jsonObj;
}

function getNewHero() {
  var welcomeSpeechOutput =
    'Bem-vindo aos Heróis da Disney!<break time="0.3s" />';
  if (!isFisrtTime) {
    welcomeSpeechOutput = "";
  }

  const heroArr = data;
  const heroIndex = Math.floor(Math.random() * heroArr.length);
  const randomHero = heroArr[heroIndex];
  const tempOutput = WHISPER + GET_HERO_MESSAGE + randomHero + PAUSE;
  const speechOutput = welcomeSpeechOutput + tempOutput + MORE_MESSAGE;
  const more = MORE_MESSAGE;

  return buildResponseWithRepromt(speechOutput, false, randomHero, more);
}

function buildResponse(speechText, shouldEndSession, cardText) {
  const speechOutput = "<speak>" + speechText + "</speak>";
  var jsonObj = {
    version: "1.0",
    response: {
      shouldEndSession: shouldEndSession,
      outputSpeech: {
        type: "SSML",
        ssml: speechOutput,
      },
      card: {
        type: "Simple",
        title: SKILL_NAME,
        content: cardText,
        text: cardText,
      },
    },
  };
  return jsonObj;
}

function buildResponseWithRepromt(
  speechText,
  shouldEndSession,
  cardText,
  reprompt
) {
  const speechOutput = "<speak>" + speechText + "</speak>";
  var jsonObj = {
    version: "1.0",
    response: {
      shouldEndSession: shouldEndSession,
      outputSpeech: {
        type: "SSML",
        ssml: speechOutput,
      },
      card: {
        type: "Simple",
        title: SKILL_NAME,
        content: cardText,
        text: cardText,
      },
      reprompt: {
        outputSpeech: {
          type: "PlainText",
          text: reprompt,
          ssml: reprompt,
        },
      },
    },
  };
  return jsonObj;
}

app.listen(port);

console.log("Alexa list RESTful API server started on: " + port);
