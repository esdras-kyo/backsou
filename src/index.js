import express from "express"
import cors from 'cors'
import {Mercado_Pago} from './router/MC_Router.js'
import { google} from "googleapis"
import dotenv from 'dotenv'

dotenv.config()

export const port = 8080
export const app = express()

app.use(express.json())
app.use(cors())
app.use("/Mercado_Pago", Mercado_Pago);
///app.use(bodyParser)

app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","https://icmsede.com");
    res.setHeader("Access-Control-Allow-Methods","GET, PUT, POST, DELETE");
    res.setHeader("Access-Control-Allow-Headers","Content-Type")
    app.use(express.json())

    next();
});
//googlesheets
async function getAuthSheets(){
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: "src/credentials.json",
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



app.listen({port}, ()=>{
    console.log("Conectado ao servidor!")
})

app.use((err, req, res, next)=> {
    console.log(err.stack)
    res.status(500).send('Quebrou alguma coisa :/')
})

