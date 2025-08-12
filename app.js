let listaAmigos = [];

let inputNome;
let listaAmigosElement;
let resultadoElement;

function adicionarAmigo() {
    const nome = inputNome.value.trim();
    
    if (!nome) {
        mostrarAlerta('Ops! Parece que você esqueceu de digitar um nome. Tente novamente!');
        inputNome.focus();
        return;
    }
    
    if (listaAmigos.includes(nome)) {
        mostrarAlerta('Ei! Este nome já está na lista. Que tal escolher outro?');
        inputNome.focus();
        return;
    }
    
    listaAmigos.push(nome);
    
    inputNome.value = '';
    
    atualizarListaAmigos();
    
    mostrarMensagemSucesso(`Perfeito! ${nome} foi adicionado à lista com sucesso!`);
    
    inputNome.focus();
}

function atualizarListaAmigos() {
    if (listaAmigos.length === 0) {
        listaAmigosElement.innerHTML = '<li class="lista-vazia">Ainda não há ninguém na lista. Que tal começar adicionando alguns amigos?</li>';
        return;
    }
    
    listaAmigosElement.innerHTML = '';
    
    listaAmigos.forEach((nome, index) => {
        const item = document.createElement('li');
        item.className = 'item-lista';
        item.innerHTML = `
            <span class="nome-amigo">${nome}</span>
            <button class="btn-remover" onclick="removerAmigo(${index})" title="Remover ${nome} da lista">
                ✕
            </button>
        `;
        listaAmigosElement.appendChild(item);
    });
}

function removerAmigo(index) {
    const nomeRemovido = listaAmigos[index];
    listaAmigos.splice(index, 1);
    atualizarListaAmigos();
    mostrarMensagemSucesso(`Tudo bem! ${nomeRemovido} foi removido da lista.`);
}

function sortearAmigo() {
    if (listaAmigos.length === 0) {
        mostrarAlerta('Calma aí! Você precisa adicionar pelo menos um amigo antes de fazer o sorteio!');
        return;
    }
    
    if (listaAmigos.length === 1) {
        mostrarAlerta('Hmm... Para fazer um sorteio, você precisa de pelo menos dois amigos na lista!');
        return;
    }
    
    resultadoElement.innerHTML = '';
    
    resultadoElement.classList.add('sorteando');
    
    setTimeout(() => {
        const indiceSorteado = Math.floor(Math.random() * listaAmigos.length);
        const amigoSorteado = listaAmigos[indiceSorteado];
        
        resultadoElement.classList.remove('sorteando');
        
        resultadoElement.innerHTML = `
            <li class="resultado-sorteio">
                <div class="amigo-sorteado">
                    <h3>🎉 E o amigo sorteado é... 🎉</h3>
                    <p class="nome-sorteado">${amigoSorteado}</p>
                    <p class="mensagem-sorteio">Parabéns! ${amigoSorteado} foi escolhido para ser seu amigo secreto!</p>
                </div>
            </li>
        `;
        
        resultadoElement.classList.add('resultado-ativo');
        
        resultadoElement.scrollIntoView({ behavior: 'smooth' });
        
    }, 1500);
}

function mostrarAlerta(mensagem) {
    const alertaAnterior = document.querySelector('.alerta');
    if (alertaAnterior) {
        alertaAnterior.remove();
    }
    
    const alerta = document.createElement('div');
    alerta.className = 'alerta alerta-erro';
    alerta.innerHTML = `
        <span>${mensagem}</span>
        <button onclick="this.parentElement.remove()" class="btn-fechar" title="Fechar mensagem">✕</button>
    `;
    
    const inputSection = document.querySelector('.input-section');
    inputSection.insertBefore(alerta, inputSection.firstChild);
    
    setTimeout(() => {
        if (alerta.parentElement) {
            alerta.remove();
        }
    }, 5000);
}

function mostrarMensagemSucesso(mensagem) {
    const msgAnterior = document.querySelector('.mensagem-sucesso');
    if (msgAnterior) {
        msgAnterior.remove();
    }
    
    const msg = document.createElement('div');
    msg.className = 'mensagem-sucesso';
    msg.innerHTML = `
        <span>${mensagem}</span>
        <button onclick="this.parentElement.remove()" class="btn-fechar" title="Fechar mensagem">✕</button>
    `;
    
    const inputSection = document.querySelector('.input-section');
    inputSection.insertBefore(msg, inputSection.firstChild);
    
    setTimeout(() => {
        if (msg.parentElement) {
            msg.remove();
        }
    }, 4000);
}

function adicionarComEnter(event) {
    if (event.key === 'Enter') {
        adicionarAmigo();
    }
}

function limparLista() {
    if (listaAmigos.length === 0) {
        mostrarAlerta('A lista já está vazia! Não há nada para limpar.');
        return;
    }
    
    if (confirm('Tem certeza que quer limpar toda a lista? Essa ação não pode ser desfeita, viu?')) {
        listaAmigos = [];
        atualizarListaAmigos();
        resultadoElement.innerHTML = '';
        mostrarMensagemSucesso('Pronto! A lista foi limpa e você pode começar tudo de novo!');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    inputNome = document.getElementById('amigo');
    listaAmigosElement = document.getElementById('listaAmigos');
    resultadoElement = document.getElementById('resultado');
    
    if (!inputNome || !listaAmigosElement || !resultadoElement) {
        console.error('Ops! Algo deu errado ao carregar a página. Verifique se todos os elementos estão presentes.');
        return;
    }
    
    atualizarListaAmigos();
    
    inputNome.addEventListener('keypress', adicionarComEnter);
    
    const buttonContainer = document.querySelector('.button-container');
    if (buttonContainer) {
        const btnLimpar = document.createElement('button');
        btnLimpar.className = 'button-clear';
        btnLimpar.innerHTML = 'Limpar Lista';
        btnLimpar.onclick = limparLista;
        buttonContainer.appendChild(btnLimpar);
    }
    
    inputNome.focus();
    
    console.log('Sistema de Amigo Secreto carregado com sucesso! Divirta-se!');
});

function exportarLista() {
    if (listaAmigos.length === 0) {
        mostrarAlerta('Não há nomes na lista para exportar! Adicione alguns amigos primeiro.');
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
    
    mostrarMensagemSucesso('Excelente! Sua lista foi exportada com sucesso!');
}
