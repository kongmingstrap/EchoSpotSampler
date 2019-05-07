'use strict';
const Alexa = require('ask-sdk');

let skill;

exports.handler = async function (event, context) {
    if (!skill) {
        skill = Alexa.SkillBuilders.custom()
                    .addRequestHandlers(LaunchRequestHandler)
                    .create();
    }
    return skill.invoke(event);
}

// スキルが画面付きデバイスで動作している時は true を返す。 
function supportsDisplay(handlerInput) {
    var hasDisplay =
        handlerInput.requestEnvelope.context &&
        handlerInput.requestEnvelope.context.System &&
        handlerInput.requestEnvelope.context.System.device &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display
    return hasDisplay;
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest'
            || (request.type === 'IntentRequest'
            && request.intent.name === SuggestPizza);
    },
    handle(handlerInput) {
        const speechOutput = "We suggest the Veggie Delite pizza which has Golden Corn, Black Olives, Capsicum and a lot of cheese. Yum!";
        if (supportsDisplay(handlerInput)) {

            const myImage = new Alexa.ImageHelper()
                .addImageInstance('https://i.imgur.com/rpcYKDD.jpg')
                .getImage();

            const primaryText = new Alexa.RichTextContentHelper()
                .withPrimaryText(speechOutput)
                .getTextContent();

            handlerInput.responseBuilder.addRenderTemplateDirective({
                type: 'BodyTemplate1',
                token: 'string',
                backButton: 'HIDDEN',
                backgroundImage: myImage,
                title: "Pizza Suggest",
                textContent: primaryText,
            });
        }
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .withSimpleCard(speechOutput)
            .getResponse();
    },
};
