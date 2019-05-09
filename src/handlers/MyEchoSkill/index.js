'use strict';
const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');

let skill;
var results;

exports.handler = async function (event, context) {
    if (!skill) {
        const docClient = new AWS.DynamoDB.DocumentClient({region: 'ap-northeast-1'});
        const tableName = process.env['PHOTO_INFO_TABLE'];
        console.log('tableName: ', tableName);
        const params = {
            TableName: tableName,
            KeyConditionExpression: '#di = :device',
            ExpressionAttributeNames: {
                '#di': 'deviceId'
            },
            ExpressionAttributeValues: {
                ':device': 'watchcamera0001'
            }
        };

        try {
            let response = await docClient.query(params).promise();
            console.log('response: ', response);
            results = response.Items;
            console.log('results: ', results);
        } catch (err) {
            console.log('err: ', err);
        }

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
        const speechOutput = 'Look!';
        if (supportsDisplay(handlerInput)) {
            const photoUrl = results[0].photoUrl;
            const myImage = new Alexa.ImageHelper()
                .addImageInstance(photoUrl)
                .getImage();
            const primaryText = new Alexa.RichTextContentHelper()
                .withPrimaryText(speechOutput)
                .getTextContent();

            handlerInput.responseBuilder.addRenderTemplateDirective({
                type: 'BodyTemplate1',
                token: 'string',
                backButton: 'HIDDEN',
                backgroundImage: myImage,
                title: "MY ROOM",
                textContent: primaryText,
            });

            return handlerInput.responseBuilder
                .speak(speechOutput)
                .withSimpleCard(speechOutput)
                .getResponse();
        }
    },
};
