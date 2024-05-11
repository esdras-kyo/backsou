import mysql from "mysql2"
import dotenv from 'dotenv'


dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()


export async function getInscritos(){
    const [rows] = await pool.query("SELECT * FROM Inscritos")
    return rows
}

//só um inscrito
export async function getSingle(PayId){
    const [rows] = await pool.query
    ('SELECT * FROM Inscritos WHERE PayId = ?',
    [PayId])
    return rows
}

export async function inscricao(name, email, fone, igreja, size, PayId, status){
    await pool.query(
        'INSERT INTO Inscritos (name, email, fone, igreja, size, PayID, status )VALUES (?, ?, ?, ?, ?, ?,?)',
     [name, email, fone, igreja, size, PayId, status] )

}

//todos os inscritos
const inscritos = await getInscritos()
console.log(inscritos)

//

export async function updateStatus(payId, newStatus) {
    try {
        // Execute a query para selecionar a linha com base no PayId
        const [rows] = await pool.query("SELECT * FROM Inscritos WHERE PayId = ?", [payId]);
        
        // Verifique se a linha foi encontrada
        if (rows.length > 0) {
            // Atualize o status da linha encontrada
            await pool.query("UPDATE Inscritos SET status = ? WHERE PayId = ?", [newStatus, payId]);
            return { success: true, message: "Status atualizado com sucesso." };
        } else {
            return { success: false, message: "Nenhuma linha encontrada com o PayId fornecido." };
        }
    } catch (error) {
        console.error("Erro ao atualizar status por PayId:", error);
        return { success: false, message: "Erro ao atualizar status por PayId." };
    }
}