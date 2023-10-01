// main.js
const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
const mssgThx = require('./mssg/thanks.json');
const mssgWellcome = require('./mssg/welcome.json');
const carrier = require('./mssg/carrier.json');
const saludo = require('./mssg/saludo.json')
const preguntaFacultad = require('./mssg/preguntaFacultad.json')
const agradecimiento = require('./mssg/agradecimiento.json')
const { MSSG_STATE } = require('./mssg/mssg');
const NlpProcessor = require('./NLP/NlpProcessor');

// Crea una instancia de NlpProcessor
const nlpProcessor = new NlpProcessor();
const intencionesSaludo = [
    'Hola',
    'Buenos días',
    'Buenas tardes',
    '¿Cómo estás?',
    'Hola, ¿cómo va?',
    '¡Hola!',
    'Saludos'
];

const respuestasSaludo = [
    '¡Hola! ¿En qué puedo ayudarte?',
    'Buenos días, ¿en qué puedo ayudarte?',
    '¡Hola! ¿Cómo puedo asistirte hoy?',
    'Hola, ¿en qué puedo colaborar contigo?',
    '¡Hola! ¿En qué puedo ayudarte hoy?',
    'Hola, ¿cómo puedo asistirte?',
    '¡Hola! ¿Cómo puedo ayudarte?'
];

nlpProcessor.cargarEjemplos(intencionesSaludo, respuestasSaludo);


// Carga ejemplos de entrenamiento
nlpProcessor.cargarEjemplos(saludo.intenciones, saludo.respuestas);
nlpProcessor.cargarEjemplos(preguntaFacultad.intenciones, preguntaFacultad.respuestas);
nlpProcessor.cargarEjemplos(agradecimiento.intenciones, agradecimiento.respuestas);

// Entrena el modelo
(async () => {
    await nlpProcessor.entrenarModelo();
})();

// Función para seleccionar una respuesta aleatoria
function getRandomResponse(responses) {
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
}





const flowNull = addKeyword(EVENTS.WELCOME).addAnswer(MSSG_STATE.INVALID);

const flowPrincipal = addKeyword(mssgWellcome.keyWord, { sensitive: false })
    .addAnswer(mssgWellcome.response)
    .addAnswer(
        mssgWellcome.options,
        null,
        null,
        [flowCarrier, flowGracias, flowNull]
    );

const flowBienvenida = addKeyword(EVENTS.WELCOME)
    .addAnswer(MSSG_STATE.ALTERN, {
        delay: 3000,
    }, async (ctx, { flowDynamic }) => {
        const text = await ctx.body.toString();
        console.log(text);
        try {
            // Debes esperar la respuesta de la función processMssg aquí, utilizando await
            const respuesta = await nlpProcessor.processMssg(text);
            console.log(respuesta)
            console.log('respuesta', typeof respuesta);
            console.log('entrada', typeof ctx.body);
            // Utiliza un template literal para incluir la respuesta en el mensaje
            await flowDynamic(`${respuesta}`);
        } catch (error) {
            console.error("Error al procesar el mensaje:", error);
        }

    });



const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowBienvenida])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()

}

main();
