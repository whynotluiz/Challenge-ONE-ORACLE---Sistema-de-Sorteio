// Amigo Secreto - Sistema de Sorteio
// Desenvolvido com carinho para tornar o sorteio mais divertido!

// Array para armazenar os nomes dos amigos
let listaAmigos = [];

// Variáveis para elementos do DOM (serão inicializadas quando o DOM carregar)
let inputNome;
let listaAmigosElement;
let resultadoElement;

// Função para adicionar um amigo à lista
function adicionarAmigo() {
    const nome = inputNome.value.trim();
    
    // Validação: verifica se o campo não está vazio
    if (!nome) {
        mostrarAlerta('Por favor, digite um nome válido!');
        inputNome.focus();
        return;
    }
    
    // Verifica se o nome já existe na lista
    if (listaAmigos.includes(nome)) {
        mostrarAlerta('Este nome já está na lista! Tente outro nome.');
        inputNome.focus();
        return;
    }
    
    // Adiciona o nome à lista
    listaAmigos.push(nome);
    
    // Limpa o campo de entrada
    inputNome.value = '';
    
    // Atualiza a visualização da lista
    atualizarListaAmigos();
    
    // Mostra mensagem de sucesso
    mostrarMensagemSucesso(`${nome} foi adicionado com sucesso!`);
    
    // Foca no campo para facilitar a adição de mais nomes
    inputNome.focus();
}

// Função para atualizar a visualização da lista de amigos
function atualizarListaAmigos() {
    if (listaAmigos.length === 0) {
        listaAmigosElement.innerHTML = '<li class="lista-vazia">Nenhum amigo adicionado ainda. Comece adicionando alguns nomes!</li>';
        return;
    }
    
    listaAmigosElement.innerHTML = '';
    
    listaAmigos.forEach((nome, index) => {
        const item = document.createElement('li');
        item.className = 'item-lista';
        item.innerHTML = `
            <span class="nome-amigo">${nome}</span>
            <button class="btn-remover" onclick="removerAmigo(${index})" title="Remover ${nome}">
                ✕
            </button>
        `;
        listaAmigosElement.appendChild(item);
    });
}

// Função para remover um amigo da lista
function removerAmigo(index) {
    const nomeRemovido = listaAmigos[index];
    listaAmigos.splice(index, 1);
    atualizarListaAmigos();
    mostrarMensagemSucesso(`${nomeRemovido} foi removido da lista.`);
}

// Função para sortear um amigo
function sortearAmigo() {
    if (listaAmigos.length === 0) {
        mostrarAlerta('Adicione pelo menos um amigo antes de fazer o sorteio!');
        return;
    }
    
    if (listaAmigos.length === 1) {
        mostrarAlerta('Você precisa de pelo menos dois amigos para fazer um sorteio!');
        return;
    }
    
    // Limpa resultado anterior
    resultadoElement.innerHTML = '';
    
    // Adiciona classe para animação
    resultadoElement.classList.add('sorteando');
    
    // Simula suspense com delay
    setTimeout(() => {
        // Seleciona um nome aleatório
        const indiceSorteado = Math.floor(Math.random() * listaAmigos.length);
        const amigoSorteado = listaAmigos[indiceSorteado];
        
        // Remove a classe de animação
        resultadoElement.classList.remove('sorteando');
        
        // Mostra o resultado
        resultadoElement.innerHTML = `
            <li class="resultado-sorteio">
                <div class="amigo-sorteado">
                    <h3>Amigo Sorteado!</h3>
                    <p class="nome-sorteado">${amigoSorteado}</p>
                    <p class="mensagem-sorteio">Parabéns! ${amigoSorteado} foi escolhido!</p>
                </div>
            </li>
        `;
        
        // Adiciona efeito de destaque
        resultadoElement.classList.add('resultado-ativo');
        
        // Scroll suave para o resultado
        resultadoElement.scrollIntoView({ behavior: 'smooth' });
        
    }, 1500);
}

// Função para mostrar alertas
function mostrarAlerta(mensagem) {
    // Remove alerta anterior se existir
    const alertaAnterior = document.querySelector('.alerta');
    if (alertaAnterior) {
        alertaAnterior.remove();
    }
    
    // Cria novo alerta
    const alerta = document.createElement('div');
    alerta.className = 'alerta alerta-erro';
    alerta.innerHTML = `
        <span>${mensagem}</span>
        <button onclick="this.parentElement.remove()" class="btn-fechar">✕</button>
    `;
    
    // Insere o alerta no início da seção
    const inputSection = document.querySelector('.input-section');
    inputSection.insertBefore(alerta, inputSection.firstChild);
    
    // Remove automaticamente após 5 segundos
    setTimeout(() => {
        if (alerta.parentElement) {
            alerta.remove();
        }
    }, 5000);
}

// Função para mostrar mensagens de sucesso
function mostrarMensagemSucesso(mensagem) {
    // Remove mensagem anterior se existir
    const msgAnterior = document.querySelector('.mensagem-sucesso');
    if (msgAnterior) {
        msgAnterior.remove();
    }
    
    // Cria nova mensagem
    const msg = document.createElement('div');
    msg.className = 'mensagem-sucesso';
    msg.innerHTML = `
        <span>${mensagem}</span>
        <button onclick="this.parentElement.remove()" class="btn-fechar">✕</button>
    `;
    
    // Insere a mensagem no início da seção
    const inputSection = document.querySelector('.input-section');
    inputSection.insertBefore(msg, inputSection.firstChild);
    
    // Remove automaticamente após 4 segundos
    setTimeout(() => {
        if (msg.parentElement) {
            msg.remove();
        }
    }, 4000);
}

// Função para permitir adicionar com Enter
function adicionarComEnter(event) {
    if (event.key === 'Enter') {
        adicionarAmigo();
    }
}

// Função para limpar a lista
function limparLista() {
    if (listaAmigos.length === 0) {
        mostrarAlerta('A lista já está vazia!');
        return;
    }
    
    if (confirm('Tem certeza que deseja limpar toda a lista? Esta ação não pode ser desfeita.')) {
        listaAmigos = [];
        atualizarListaAmigos();
        resultadoElement.innerHTML = '';
        mostrarMensagemSucesso('Lista limpa com sucesso!');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa as variáveis do DOM
    inputNome = document.getElementById('amigo');
    listaAmigosElement = document.getElementById('listaAmigos');
    resultadoElement = document.getElementById('resultado');
    
    // Verifica se os elementos foram encontrados
    if (!inputNome || !listaAmigosElement || !resultadoElement) {
        console.error('Erro: Elementos do DOM não encontrados!');
        return;
    }
    
    // Inicializa a lista
    atualizarListaAmigos();
    
    // Adiciona evento de Enter no campo de entrada
    inputNome.addEventListener('keypress', adicionarComEnter);
    
    // Adiciona botão para limpar lista
    const buttonContainer = document.querySelector('.button-container');
    if (buttonContainer) {
        const btnLimpar = document.createElement('button');
        btnLimpar.className = 'button-clear';
        btnLimpar.innerHTML = 'Limpar Lista';
        btnLimpar.onclick = limparLista;
        buttonContainer.appendChild(btnLimpar);
    }
    
    // Foca no campo de entrada para melhor UX
    inputNome.focus();
    
    console.log('Sistema de Amigo Secreto inicializado com sucesso!');
});

// Função para exportar lista (bonus)
function exportarLista() {
    if (listaAmigos.length === 0) {
        mostrarAlerta('Não há nomes na lista para exportar!');
        return;
    }
    
    const conteudo = listaAmigos.join('\n');
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lista-amigos-secretos.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    mostrarMensagemSucesso('Lista exportada com sucesso!');
}
