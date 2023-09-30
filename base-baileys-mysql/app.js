const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const mssgThx = require('./mssg/thanks.json');
const mssgWellcome = require('./mssg/welcome.json');
const carrier = require('./mssg/carrier.json')
const { MSSG_STATE } = require('./mssg/mssg');


// Función para seleccionar una respuesta aleatoria
function getRandomResponse(responses) {
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
}


const flowGracias = addKeyword(mssgThx.keywords, { sensitive: false }).addAnswer(MSSG_STATE.DEVELOPMENT,
    {
        delay: 1000,
    }).addAnswer([getRandomResponse(mssgThx.responses),],
    )
const flowSecundario = addKeyword(['2', 'siguiente', 'Otras', 'otras']).addAnswer(['📄 Aquí tenemos el flujo secundario',
    'Te recuerdo que estoy en fase de desarrollo...', MSSG_STATE.DEVELOPMENT,
    {
        delay: 1000,
    },
    'sin mas que agregar, me despido de esta conversación '], null, null, flowGracias)

const flowCarrier = addKeyword(carrier.keyWord).addAnswer('Por el momento solo escribe "otras" ').addAnswer(
    carrier.response,
    null,
    null,
    [flowSecundario]
)

const flowNull = addKeyword(EVENTS.WELCOME).addAnswer(MSSG_STATE.INVALID)

const flowPrincipal = addKeyword(mssgWellcome.keyWord, { sensitive: false })
    .addAnswer(mssgWellcome.response)
    .addAnswer(
        mssgWellcome.options,
        null,
        null,
        [flowCarrier, flowGracias, flowNull]
    )

const flowBienvenida = addKeyword(EVENTS.WELCOME)
    .addAnswer(MSSG_STATE.WELCOME_CHAT, null, async (ctx, { gotoFlow }) => {
        console.log(ctx.body)
        processMssg(ctx);
        if (ctx.body.includes('hola'))
            gotoFlow(flowPrincipal)


    })
const processMssg = (context) => {
    /* TODO
        Integracion de nlp, devolver mesanje deacuerdo a lo que se escribe, deacuerdo a un contexto dado */
    /* alternativa, enviar  a un flujo especifico, dependiendo de la intecion del texto */

}
const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowBienvenida, flowGracias])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()