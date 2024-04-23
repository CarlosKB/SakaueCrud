import { Pool } from "pg";
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { LoginUsuario } from "../Procedures/Functions/LoginUsuario";
import { enviarEmailComToken } from "../Procedures/Functions/SendEmail";
import { VerificaUserEmail } from "../Procedures/Functions/VerificaUserEmail";
import { GETUsuarios } from "../Procedures/GETs/GETUsuarios";
import { DELUsuario } from "../Procedures/Deletes/DELUsuario";

dotenv.config()

const clientUser = new Pool({
    user: "postgres",
    host: "localhost",
    database: "Sakaue - CRUD",    //trocar para o nome do seu banco local
    password: "123",      //trocar para a senha do seu banco local
    port: 5432
})


const clientChave = new Pool({
    user: "postgres",
    host: "localhost",
    database: "CRUD - Chave",    //trocar para o nome do seu banco local
    password: "123",      //trocar para a senha do seu banco local
    port: 5432
})

// const client = new Pool({ //conexão com o banco do servidor
//     connectionString: process.env.URLCloud, 
//     ssl: {
//         rejectUnauthorized: false
//     }
// })

clientUser.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conexão com o banco dos CRUDs estabelecida com sucesso!');
})

clientChave.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados da chave:', err);
        return;
    }
    console.log('Conexão com o banco das chaves estabelecida com sucesso!');
})

const app = express()
app.use(cors())
app.use(express.json())

app.post("/login", async (req, res) => {

    const { email } = req.body
    const { password } = req.body

    const messages = ''
    const isSucesso = false
    const usuarioReturn = {
        UsuarioNome: "",
        UsuarioSenha: "",
        UsuarioEmail: "",
        UsuarioTipo: "",
        UsuarioDataCadastro: ""
    }

    const usuario = {
        UsuarioNome: "",
        UsuarioSenha: password,
        UsuarioEmail: email,
        UsuarioTipo: "",
        UsuarioDataCadastro: ""
    }

    const resultadoLogin = await LoginUsuario(clientUser, usuario);

    if (resultadoLogin.isSucesso) {
        res.send({ msg: resultadoLogin.messages, usuario: resultadoLogin.usuarioReturn, isSucesso: resultadoLogin.isSucesso })
    } else {
        res.send({ msg: resultadoLogin.messages, usuario: resultadoLogin.usuarioReturn, isSucesso: resultadoLogin.isSucesso })
    }
})

app.post("/sendEmail", async (req, res) => {

    const { email } = req.body;

    enviarEmailComToken(email)
        .then(result => {
            if (result.isSuccess) {
                res.send({ token: result.token, isSucesso: result.isSuccess, msg: result.messages[0] });
            } else {
                console.error('Erro:', result.messages[0]);
            }
        })
        .catch(error => console.error('Erro:', error));
})


app.post("/verifica-usuario", async (req, res) => {
    const { email } = req.body

    const emailValido = await VerificaUserEmail(clientUser, email)

    if (emailValido) {
        res.send({ msg: "Email já existente" })
    } else {
        res.send({ msg: "Email válido para cadastro" })
    }

})

app.get("/GETUsuarios", async (req, res) => {
    const response = await GETUsuarios(clientUser)

    if (response?.isSucesso) {
        res.send({msg:'GET com sucesso', Sucesso: response.isSucesso, Usuarios:response.retornoUsuarios})
    } else {
        res.send({msg: "Erro ao recuperar usuários", Sucesso: false})
    }
})

app.listen(3001, () => {
    console.log("Servidor rodando!")
})
