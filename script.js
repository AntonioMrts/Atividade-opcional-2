 // Buscar o campo de texto
 const input = document.querySelector("#busca");

 // Buscar o div que vai exibir os dados da API
 const info = document.querySelector("#info");

 // Adicionar o listener no evento keypress
 input.addEventListener("keypress", async (event) => {
     if (event.key === "Enter") {
         const entrada = event.target.value.trim().toLowerCase(); // O que o usuário digitou no campo
         info.innerHTML = ""; // Limpar conteúdo anterior

         if (!entrada) {
             info.innerHTML = `<p>Por favor, insira um nome de Pokémon ou habilidade.</p>`;
             return;
         }

         try {
             // Verificar se a entrada é uma habilidade
             const habilidadeResultado = await fetch(`https://pokeapi.co/api/v2/ability/${entrada}`);

             if (habilidadeResultado.ok) {
                 const habilidadeDados = await habilidadeResultado.json();

                 if (habilidadeDados.pokemon.length > 0) {
                     const primeiroPokemon = habilidadeDados.pokemon[0].pokemon.name;

                     // Fazer uma nova busca pelo primeiro Pokémon encontrado
                     const pokemonResultado = await fetch(`https://pokeapi.co/api/v2/pokemon/${primeiroPokemon}`);

                     if (pokemonResultado.ok) {
                         const dados = await pokemonResultado.json();
                         const pokemon = {
                             nome: dados.name,
                             imagem: dados.sprites.front_default,
                             altura: (dados.height / 10).toFixed(2),
                             peso: (dados.weight / 10).toFixed(2),
                             tipos: dados.types.map(t => t.type.name),
                         };

                         // Exibir informações do Pokémon
                         info.innerHTML = `<h1>${pokemon.nome}</h1>`;
                         info.innerHTML += `<img src="${pokemon.imagem}" alt="Imagem do ${pokemon.nome}">`;
                         info.innerHTML += `<p>Altura: ${pokemon.altura} metros</p>`;
                         info.innerHTML += `<p>Peso: ${pokemon.peso} kg</p>`;
                         info.innerHTML += `<p>Tipos: ${pokemon.tipos.join(", ")}</p>`;
                     } else {
                         info.innerHTML = `<p>Não foi possível obter detalhes do Pokémon encontrado pela habilidade.</p>`;
                     }
                 } else {
                     info.innerHTML = `<p>Nenhum Pokémon encontrado com a habilidade '${entrada}'.</p>`;
                 }
                 return;
             }

             // Se a entrada não for uma habilidade, buscar como nome de Pokémon
             const resultado = await fetch("https://pokeapi.co/api/v2/pokemon/" + entrada);

             if (resultado.ok) {
                 const dados = await resultado.json();

                 // Guardar o resultado em um objeto
                 const pokemon = {
                     nome: dados.name,
                     imagem: dados.sprites.front_default,
                     altura: (dados.height / 10).toFixed(2),
                     peso: (dados.weight / 10).toFixed(2),
                     tipos: dados.types.map(t => t.type.name),
                 };

                 // Adicionar as informações básicas
                 info.innerHTML = `<h1>${pokemon.nome}</h1>`;
                 info.innerHTML += `<img src="${pokemon.imagem}" alt="Imagem do ${pokemon.nome}">`;
                 info.innerHTML += `<p>Altura: ${pokemon.altura} metros</p>`;
                 info.innerHTML += `<p>Peso: ${pokemon.peso} kg</p>`;
                 info.innerHTML += `<p>Tipos: ${pokemon.tipos.join(", ")}</p>`;

                 // Buscar as fraquezas do Pokémon pelo tipo
                 const fraquezasPromises = pokemon.tipos.map(async tipo => {
                     const tipoResultado = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
                     if (tipoResultado.ok) {
                         const tipoDados = await tipoResultado.json();
                         return tipoDados.damage_relations.double_damage_from.map(d => d.name);
                     }
                     return [];
                 });

                 const fraquezasArray = await Promise.all(fraquezasPromises);
                 const fraquezas = [...new Set(fraquezasArray.flat())]; // Remover duplicatas

                 info.innerHTML += `<p>Fraquezas: ${fraquezas.join(", ")}</p>`;
                 info.style.display = 'block';
             } else {
                 info.innerHTML = `<p>Pokémon não encontrado. Tente novamente!</p>`;
             }
         } catch (error) {
             info.innerHTML = `<p>Ocorreu um erro. Tente novamente mais tarde!</p>`;
         }
     }
 });