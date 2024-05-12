import { Router } from "express";
import { MercadoPagoConfig, Payment, Preference, MerchantOrder } from 'mercadopago';
export const Mercado_Pago = Router();
import { addRow, addRow1 } from "../index.js";

const client = new MercadoPagoConfig({ accessToken:'TEST-6229538283536232-050212-87ea5475a201135099e0013a34ced51c-419452154', }) ;

Mercado_Pago.post("/", async (req,res)=>{
    try {
        const dadosInscrito = req.body
        const body = {
            items: [
                {
                    title: "Inscrição SOU 2024",
                    unit_price: 90.00,
                    quantity: 1,
                    currency_id: "BRL",

                    
                }
            ],
            back_urls: {
                "success": "http://localhost:5173/sucess",
                "failure": "http://localhost:5173/failure",
                "pending": "http://localhost:5173/pending"
            },
            payer: {
                id: dadosInscrito.id,
                name: dadosInscrito.name,
                email: dadosInscrito.email,
                phone: {  
                  number: dadosInscrito.fone,
                },
               
            },

            auto_return: "approved",
            notification_url: "http://13.59.160.130:8080/Mercado_Pago/webhook",
        };
        const preference = new Preference(client);
        const result = await preference.create({body})
        console.log("aqui seria o primeiro retorno")
        console.log(result)
        
        const fone = JSON.parse(result.payer.phone.number)[0];
        const email = JSON.parse(result.payer.email)[0];
        const id = result.id;
       
        const name = JSON.parse(result.payer.name)[0];
       addRow1(name,email,
        fone,id)

        console.log("fim do primeiro retorno")
        
    
        res.status(200).json(result.init_point)
        return result.init_point

    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message);
    }
})
const payment = new Payment(client)
const merchantorder = new MerchantOrder(client);
///////
let cont = 0;
let globalPaymentStatus;
let globalID;
Mercado_Pago.post("/webhook", async (req, res)=>{
    
    
    console.log("notifi")
    const {query} = req
    console.log({ query})
    const topic = query.topic || query.type
    console.log({topic})
    
    try {
        
        switch (topic) {
            case "payment":
                console.log("Aqui começa o processamento do pagamento-------------------------------------")
                const paymentId = query.id || query['data.id']
                console.log(topic, '---obtendo pagamento---', paymentId)
    
                const pagamento = await payment.get({ id: paymentId }).then(response => {
                    console.log("Dados do pagamento:", response);
                    return response;
                }).catch(error => {
                    console.log("Erro ao obter pagamento:", error);
                    return null;
                });
    
                if (pagamento) {
                    console.log(topic, '---processando dados do pagamento---')
    
                    // Aqui você pode fazer o que precisar com os dados do pagamento
                    console.log("ID do pagamento:", pagamento.id);
                    console.log("Valor do pagamento:", pagamento.transaction_amount);
                    console.log("Status do pagamento:", pagamento.status);

                    globalPaymentStatus = pagamento.status;
                    // E assim por diante, dependendo do que você precisar fazer com os dados do pagamento
                    cont++
                    console.log(cont)
                }
    
                console.log("<-----<------<----- Aqui acaba o processamento do pagamento ------>--->--->--->")
                break;
                case "merchant_order":
                    console.log("foi merchant order ----------------")

                    const merchId = query.id || query['data.id']
                console.log(topic, '---obtendo pagamento---', merchId)
    
                const merchanterner = await merchantorder.get({ merchantOrderId: merchId }).then(response => {
                    console.log("Dados de pedido:", response);
                    return response;
                }).catch(error => {
                    console.log("Erro ao obter pedido:", error);
                    return null;
                });

                if (merchanterner) {
                    console.log(topic, '---processando dados do merchant--^^^^^^^^^^^^^^^^--------^^^^^^^^^^-')
    
                    // Aqui você pode fazer o que precisar com os dados do pagamento
                    const idPref = merchanterner.preference_id
                    globalID = idPref
                    console.log("ID do pagamento:", idPref);   
                    // E assim por diante, dependendo do que você precisar fazer com os dados do pagamento
                    cont++
                    console.log(cont)
                }

                    break;
    
            default:
                console.log("Tópico não reconhecido:", topic);
                break;

        } 
        // Aqui você pode adicionar qualquer outro processamento adicional, se necessário
        if (cont>2){
            addRow(globalID, globalPaymentStatus)
            cont=0
        }
        res.send(); // Enviar resposta ao cliente

    } catch (error) {
        console.log("Erro durante o processamento:", error);
        res.status(500).send("Ocorreu um erro durante o processamento.");
    }
    
})    