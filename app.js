import express from "express"
import { getInscritos, getSingle, inscricao } from "./index.js"
import cors from 'cors'
import {Mercado_Pago} from './router/MC_Router.js'
import { google} from "googleapis"
import dotenv from 'dotenv'
//import bodyParser from "body-parser"
dotenv.config()

export const port = process.env.PORT ? Number(process.env.PORT): 3000
export const app = express()

app.use(express.json())
app.use(cors())
app.use("/Mercado_Pago", Mercado_Pago);
///app.use(bodyParser)

app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","http://localhost:5173");
    res.setHeader("Access-Control-Allow-Methods","GET, PUT, POST, DELETE");
    res.setHeader("Access-Control-Allow-Headers","Content-Type")
    app.use(express.json())

    next();
});
//googlesheets
async function getAuthSheets(){
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        });
        const client = await auth.getClient();
        const googleSheets = google.sheets({
            version: "v4",
            auth: client
        });
        const spreadsheetId = "1uHJchIRAaU0Fetye3H1p_wj2ttpgyeoDEvdiEj3YPmY";
        
        return {
            auth,
            client,
            googleSheets,
            spreadsheetId
        };
    } catch (error) {
        console.error("Erro ao obter autenticação para Google Sheets:", error);
        throw error;
    }
}
/////////teste
async function main() {
    try {
        const authSheets = await getAuthSheets();
        console.log("Objeto de autenticação e planilha:", authSheets);
    } catch (error) {
        console.error("Erro ao obter autenticação para Google Sheets:", error);
    }
}


////
app.get("/metadata", async(req,res)=>{
    const {googlesheets, auth, spreadsheetId} = await getAuthSheets()

    const metadata = await googlesheets.spreadsheets.get({
        auth,
        spreadsheetId,

    })
    res.send(metadata.data)
})

app.get("/getrows", async (req,res)=>{
    const {googleSheets, auth, spreadsheetId} = await getAuthSheets()

    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "inscritos"
    })
    res.send(getRows.data)
})

app.post("/addRow", async (req,res)=>{
    const {googleSheets, auth, spreadsheetId} = await getAuthSheets()

    const {values} = req.body;
    const rows = [values]

    const row =  googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "inscritos",
        valueInputOption: "USER_ENTERED",
        resource: {
            values: rows,
        }
    })
})

app.post("/updateValue", async (req,res)=>{
    const {googlesheets, auth, spreadsheetId} = await getAuthSheets();

    const {values} = req.body;

    const updateValue =  googlesheets.spreadsheets.values.update({
        spreadsheetId,
        range: "inscritos",
        valueInputOption: "USER_ENTERED",
        resource: {
            values: values
        }

    })
})

export async function addRow(id, status){
    try{
        const {googleSheets, auth, spreadsheetId} = await getAuthSheets()
        const row =  googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: "pagamentos",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[id, status]],
            }
        })
        console.log('ID e status adicionados à planilha:', row.data);
        return row.data
    } catch (error) {
        console.error('Erro ao adicionar ID e status à planilha:', error);
        throw error;
    }
}

export async function addRow1(name, email, fone, payid){
    try{
        const {googleSheets, auth, spreadsheetId} = await getAuthSheets()
        const row =  googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: "pagamentos1",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[name, email, fone, payid]],
            }
        })
        console.log('ID e status adicionados à planilha:', row.data);
        return row.data
    } catch (error) {
        console.error('Erro ao adicionar ID e status à planilha:', error);
        throw error;
    }
}

/////aa
app.get("Mercado_Pago", (req, res)=>{
    res.json("mercadopago")
})

app.get("/", (req,res)=>{
    res.json("opa, é o backend!")
})

app.get("/inscritos", async (req,res)=> {
    
    const ins = await getInscritos()
    res.send(ins)
    
})

app.listen({port}, ()=>{
    console.log("Conectado ao servidor!")
})

app.get("inscritos/:cpf", async (req,res)=>{
    const cpf = req.params.cpf
    const inscrito = await getSingle(cpf)
    res.send(inscrito)
})


app.post("/inscritos", async(req,res)=>{
    const {name, email,fone, igreja, size, PayId, status} = req.body
    const inscrito = await inscricao(name, email,fone, igreja, size, PayId, status)
    res.status(201).send(inscrito)
})

app.post("/inscritos", async (req, res) => {
    const { payId, newStatus } = req.body; // Supondo que você está enviando PayId e novo status no corpo da requisição

    if (!payId || !newStatus) {
        return res.status(400).send("PayId e novo status são obrigatórios.");
    }

    const result = await updateStatusByPayId(payId, newStatus);

    if (result.success) {
        res.send(result.message);
    } else {
        res.status(500).send(result.message);
    }
});


app.use((err, req, res, next)=> {
    console.log(err.stack)
    res.status(500).send('Quebrou alguma coisa :/')
})

