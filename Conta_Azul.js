  import { Octokit } from "https://esm.sh/octokit"
 /* import express from 'express'
  import cors from 'cors'

  const app = express()
  const PORT = 3000
  app.use(cors()); // Enables CORS for all routes
*/

//import { Buffer } from "node:buffer"
//import { Buffer } from "https://jsdelivr.net"

/// Lendo elementos do arquivo html
const btGeraCod = document.getElementById('bt_gera_codigo')
const btGeraToken = document.getElementById('bt_gera_token')
const btexporta = document.getElementById('bt_exporta')

//div token
const dv_token = window.document.getElementById('token')

//Combobox input
const cb_code = document.getElementById('code')
const cb_data_ini_base = window.document.getElementById('data_ini_base')
const cb_data_fim_base = window.document.getElementById('data_fim_base')
const cb_data_ini_lanca = window.document.getElementById('data_ini_lanca')
const cb_data_fim_lanca = window.document.getElementById('data_fim_lanca')
const cb_caminho = window.document.getElementById('caminho')
const cb_client_id = window.document.getElementById('client_id')
const cb_client_secret = window.document.getElementById('client_secret')
const cb_client_Base64 = window.document.getElementById('client_Base64')
const cb_token_acesso = window.document.getElementById('token_acesso')
const cb_token_renova = window.document.getElementById('token_renova')


//Definindo valor das variaveis
const client_id = '3s7hmj1jf2fhesvdvfk7d3dpov' //SEU_CLIENT_ID
const client_secret = 'css6mpnvip3nvqgvnt8vcmdep5mcorqjgk48850e5riu5087vcm'
const client_Base64 = btoa(`${client_id}:${client_secret}`)
const redirect_uri = 'https://maxwellmgomes.github.io/Conta_Azul/' // mesma do ContaAzu
const caminho = 'https://raw.githubusercontent.com/MaxwellMGomes/Conta_Azul/refs/heads/main/Dados/'
const urlAtual = new URL(window.location.href)
const code = urlAtual.searchParams.get("code")
const url_codigo = "https://auth.contaazul.com/oauth2/authorize?response_type=code&";


//Alterando valor das combox.
cb_client_id.value = client_id
cb_client_secret.value = client_secret
cb_client_Base64.value = client_Base64
cb_caminho.value = caminho
/// Captura o código se já tiver nos parametros da URL ou direciona para login Conta_Azul

if (code) {
        cb_code.value = code
    } else {        
        gera_codigo()
    }

///======= > Ação dos botões quando acionados

// ====>  Botão Gera Código
btGeraCod.addEventListener('click', (event) => {
    window.location.href = redirect_uri 
})

//====>  Botão Gera Token
btGeraToken.addEventListener('click', async(event) => {
    event.preventDefault() 
    const token_todos = await gera_token()
    cb_token_acesso.value = token_todos.access_token
    cb_token_renova.value = token_todos.refresh_token
    dv_token.style.display = "block"
  
})

// ====> Botão Exporta arquivo
btexporta.addEventListener('click', async(event) => {
    event.preventDefault() 
    //const arquivo = await lerArquivo('Acesso_Dados.csv')
    const arquivo = await grava_GitHub()
    cb_token_renova.value = arquivo
    console.log(arquivo)

})


//// ==== Funções ========
function gera_codigo(){
    //const fetch = require('node-fetch');
    
    const params = { 
        'client_id' : client_id,
        'redirect_uri' : redirect_uri,
        'state' : 'ESTADO',
        'scope' : 'openid+profile+aws.cognito.signin.user.admin'
    };
    const queryString = new URLSearchParams(params).toString();
    const authUrl = decodeURIComponent(url_codigo+queryString);
    //const authUrl = decodeURIComponent("http://127.0.0.1:5500/Curso_JS/Modelos/Modelo.html");
    window.location.href = authUrl
}

async function gera_token() { 
    // 2. Fazer requisição POST para gerar o token

    const response = await fetch('https://auth.contaazul.com/oauth2/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${client_Base64}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri
        })
    });

    const data = await response.json();
    return data
}

/// ===> Manipular aquivo csv no javascript

// Ler CSV
async function lerArquivo(valor) {
// Maneira de ler aquivo no servidor via fecth
    const endpoint = caminho + valor
    const result = await fetch(endpoint)
     .then((response)=>response.text())
     .then(data => {
          console.log(data)
          return data
     })
    return result
    }
  

/// Grava no GitHub


async function grava_GitHub() {
    //import { Octokit } from "@octokit/rest" // Exemplo usando Octokit em Node.js ou Navegador
    //const octokit = new Octokit({
    //    auth: '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' // <= Anterior SEU_PERSONAL_ACCESS_TOKEN_AQUI
    //});
    
    const auth = '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' // Token vence 15/06/26 <= SEU_PERSONAL_ACCESS_TOKEN_AQUI
    const owner = 'MaxwellMGomes'  // <= seu-usuario
    const repo = 'Conta_Azul'  // <= seu-repositorio
    const path = 'Acesso_Dados.txt' // <= pasta/arquivo.txt' -> Caminho onde o arquivo será salvo
    const conteudo = 'Conteúdo do arquivo em texto' // <= Conteúdo do arquivo em texto
    const octokit = new Octokit({auth: auth });    

    // 2. Converter conteúdo para Base64
    //const contentBase64 = Buffer.from(content).toString('base64');
    const conteudoBase64 = btoa(conteudo)

    try {
        // Opcional: Verifique se o arquivo já existe para obter seu SHA
        // Se o arquivo já existir, o GitHub exige o SHA atual para alterá-lo.
        let sha = null;
        try {
            const response = await octokit.rest.repos.getContent({
                owner: owner,
                repo: repo,
                path: path,
            });
            sha = response.data.sha; 
        } catch (error) {
            console.log("Arquivo não existe. Um novo será criado.");
        }

        // Grava ou atualiza o arquivo
        const resultado = await octokit.rest.repos.createOrUpdateFileContents({
        owner: owner,
        repo: repo,
        path: path,
        message: 'feat: adicionando ou atualizando arquivo via script JS',
        content: conteudoBase64, // Use Buffer.from('...').toString('base64') no Node.js
        sha: sha, // Obrigatório apenas para atualizações
        branch: 'main', // Ou 'master'
        });

        console.log("Arquivo gravado com sucesso! Commit:", resultado.data.commit.sha);
    } catch (erro) {
        console.error("Erro ao gravar arquivo:", erro);
    }
    }


// Gravar CSV

async function criarArquivo() {
  try {
    const conteudo = 'Nome;Valor\nCodigo_Acesso_Dia;0ac140b6-e1cb-4a53-b6d1-8ff89a94f382\nCliente_ID;3s7hmj1jf2fhesvdvfk7d3dpov';
    await writeFile(caminho + 'Acesso_Dados.csv', conteudo, 'utf8');
    console.log('Arquivo criado com sucesso!');
  } catch (err) {
    console.error('Erro ao criar arquivo:', err);
  }
}

/// ===========   Abaixo as reservas técnicas   ========================================================

/// Gravar arquivo no GitHub

/// Grava no GitHub
/* ===> Acabei de criar meu Token no GitHup 
  Token =>  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
  usuario: MaxwellMGomes
  repositorio: Conta_Azul
  pasta : Dados/Acesso_Dados.csv

// 1. Autenticação
const octokit = new Octokit({
  auth: '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' // <= SEU_PERSONAL_ACCESS_TOKEN_AQUI
});

async function grava_GitHub() {
  const owner = 'MaxwellMGomes'  // <= seu-usuario
  const repo = 'Conta_Azul'  // <= seu-repositorio
  const path = 'Dados/Acesso_Dados.csv' // <= pasta/arquivo.txt' -> Caminho onde o arquivo será salvo
  const content = 'Conteúdo do arquivo em texto' // < =Conteúdo do arquivo em texto
  
  // 2. Converter conteúdo para Base64
  const contentBase64 = Buffer.from(content).toString('base64');

  try {
    // 3. Criar ou atualizar o arquivo
    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: 'feat: adicionando arquivo via API', // Mensagem do commit
      content: contentBase64,
      branch: 'main', // ou 'master'
    });
    console.log("Arquivo gravado:", response.data.content.html_url);
  } catch (error) {
    console.error("Erro ao gravar no GitHub:", error);
  }
}

*/

/*
import { Octokit } from "octokit";

// Autenticação com seu Personal Access Token
const octokit = new Octokit({
  auth: 'SEU_PERSONAL_ACCESS_TOKEN_AQUI'
});

// Exemplo de uso: buscar informações do usuário
async function getUser() {
  const { data } = await octokit.rest.users.getAuthenticated();
  console.log("Olá, " + data.login);
}

getUser();
*/




///=================================================


/// Gerando CSV
/*
function objectToCSV(data) {
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));

    for (const row of data) {
        const values = headers.map(header => row[header]);
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}

console.log(objectToCSV(dados));

*/
///===============================================================
// Importanto bibliotecas
// Em tese todas já nativos do Node.js
//import fs from 'node:fs'
//const fs = require('node:fs');
//import fs from 'node:fs/promises'
//import fetch from 'node-fetch'
//const fetch = require('node-fetch')
//const btoa = require('btoa') // Para gerar a base64
//const { URLSearchParams } = require('url')

/// Ler arquivo local. Não funciona no Chrome e outros Navegadore, questão de segurança
 /* try {
    const data = await fs.readFile(caminho + 'Acesso_Dados.csv', 'utf8');
    console.log('Conteúdo do arquivo:', data);
    return data
  } catch (err) {
    console.error('Erro ao ler arquivo:', err);
  }
  */

/// Fazer download de um aquivo no github
/*
const fs = require('fs');
const https = require('https');

// URL "Raw" do arquivo no GitHub
const url = 'https://githubusercontent.com';
const destino = './arquivo.txt';

const file = fs.createWriteStream(destino);
https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download concluído!');
    // Agora pode usar fs.readFile para ler o arquivo local
  });
});
*/
///====================================


function grava_csv_php($arq,$dados){
    $arquivo = fopen($arq, 'w');

    fclose($arquivo);
}

function ler_csv_php(){
    $arquivo = fopen('saida.csv', 'r');
    if ($arquivo !== FALSE) {
        // Loop para ler linha por linha
        while (($linha = fgetcsv($arquivo, 1000, ",")) !== FALSE) {
            // $linha é um array com os elementos do CSV
            print_r($linha);
        }
        fclose($arquivo);
    }
}

function pag_origem(){
        const pagAnt = document.referrer
        if (pagAnt){
            const url = window.document.getElementById('url')
            url.innerHTML = `Veio da página: ${pagAnt}`
            window.alert(`Veio da página: ${pagAnt}`)
        } else {
                gera_codigo()
            //window.alert(`Acesso direto sem pagina anterior`)
        }
}


function gera_token_php(){  //PHP
    httpCode , $response, $data, $client_id, $client_secret, $client_Base64, $token_acesso, $token_renova;
    // 1. Dados da sua aplicação (obtidos no portal de desenvolvedor Conta Azul)
    $client_id = '3s7hmj1jf2fhesvdvfk7d3dpov'; //SEU_CLIENT_ID
    $client_secret = 'css6mpnvip3nvqgvnt8vcmdep5mcorqjgk48850e5riu5087vcm'; //'SEU_CLIENT_SECRET';
    $code = $_GET['code']; // Código recebido no redirecionamento do Auth
    $redirect_uri = 'https://www.google.com/'; // 'SUA_URL_DE_REDIRECT'; // A mesma cadastrada no App
    $url_codigo = "https://auth.contaazul.com/oauth2/authorize?response_type=code";
    $scope = 'openid+profile+aws.cognito.signin.user.admin';


    // 2. URL de autenticação do Conta Azul
    $url = 'https://auth.contaazul.com/oauth2/token';

    // 3. Montar os campos da requisição POST
    $postFields = {
        'grant_type' : 'authorization_code',
        'code' : $code,
        'redirect_uri' : $redirect_uri
    };

    //echo "<br/> code: $code";
        
    // 4. Autenticação Basic (Client ID e Secret)
    $client_Base64 = base64_encode("$client_id:$client_secret");

    // 5. Configurar a requisição cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Basic $client_Base64",
        "Content-Type: application/x-www-form-urlencoded"
    ]);

    // 6. Executar a requisição
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // 7. Tratar a resposta
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        $token_acesso = $data['access_token'];
        $token_renova = $data['refresh_token'];


        // Salve $data['access_token'] e $data['refresh_token'] no seu banco de dados
        //echo "Token gerado com sucesso!<br>";
        //echo "Access Token: " . $data['access_token'];
    } 

    // 8. Por minha conta Grava csv



}


function categorias(){
  //  global $httpCode , $response, $data, $client_id, $client_secret, $client_Base64, $token_acesso, $token_renova;

    $accessToken = $token_acesso; // Token obtido via OAuth2
    $apiUrl = 'https://api-v2.contaazul.com/v1/categorias';

    // Parâmetros de filtro
    $params = {
        //'busca_textual' => 'contas-a-pagar', // Filtro por texto
        'pagina'  : 1,                  // Página atual
        'tamanho' : 20                  // Itens por página (10, 20, 50, 100)
    };

    // Montar a URL com os filtros
    $url = $apiUrl + '?' . http_build_query($params);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token_acesso,
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    // Exibir resposta
    $categorias = json_decode($response, true);
    print_r($categorias);

}


