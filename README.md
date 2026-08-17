# Perigo Villager Addon

> "Quer comprar um relógio? Tenho um que marca as horas antes delas acontecerem."

Addon para Minecraft Bedrock que traz o **Perigo** (Todo Mundo Odeia o Chris) para o seu mundo. Um villager de procedência duvidosa que vende itens de elite por preço de lixo — tudo "caiu do caminhão".

---

## Como Invocar o Perigo

Para invocar o Perigo Villager, siga esses passos:

1. Coloque um bloco de **Dirt** no chão.
2. Posicione uma **Abóbora Entalhada** em cima da Dirt.
3. Olhe diretamente para a abóbora a menos de 3 blocos de distância.

O Perigo aparecerá e a abóbora + Dirt serão destruídas automaticamente.

> Dica: A receita de **2x Batata → 1x Abóbora** está disponível na bancada de trabalho para facilitar.

---

## Itens do Addon

### Arco de Fogo (`calca14:fire_bow`)
Arco customizado com durabilidade de 9999. Ao disparar, lança Super Flechas de Fogo.
- Crafting: Dirt + Cascalho + Graveto na bancada de trabalho.

### Super Flecha de Fogo (`calca14:fire_arrow`)
Projétil especial que, enquanto em voo, mata instantaneamente qualquer monstro num raio de 30 blocos com efeito visual de raio e explosão.
- Crafting: Cascalho + Graveto + Pedra na bancada de trabalho (rende 64 flechas).

### Poção do Superman (`calca14:pocao_superman`)
Ao ser consumida, aplica 11 efeitos por 3 horas: Regeneração, Absorção, Resistência, Resistência a Fogo, Respiração Aquática, Força, Pressa, Velocidade, Pulo, Visão Noturna e Queda Lenta.
- Crafting (com forma): Trigo (topo) + Olho de Aranha (meio) + Qualquer Poção (baixo), em coluna na bancada.

---

## Sistema de Trocas (Caiu do Caminhão)

O Perigo oferece trocas extremamente baratas porque os itens... bem, você sabe de onde vieram.

### Tier 0 (disponível imediatamente)
| Você dá | Você recebe |
| :--- | :--- |
| 1x Pedra | Fire Bow (Power V, Punch II, Flame I, Infinity I...) |
| 1x Cascalho | Espada Netherite encantada |
| 1x Areia | Picareta Netherite encantada |
| 1x Carvão | Machado Netherite encantado |
| 1x Terra | 128x Maçã Dourada Encantada |
| 1x Pepita de Ferro | 16x Ender Pearl |
| 1x Pepita de Ouro | 12x Olho do Fim |
| 1x Esmeralda | 12x End Portal Frame |
| 1x Tronco de Carvalho | Capacete Netherite encantado |
| 1x Tronco de Bétula | Peitoral Netherite encantado |

### Tier 1 (após 1 XP de comércio)
| Você dá | Você recebe |
| :--- | :--- |
| 1x Tronco de Abeto | Calças Netherite encantadas |
| 1x Tronco de Selva | Botas Netherite encantadas |
| 1x Tronco de Acácia | Escudo encantado |
| 1x Tronco de Carvalho Escuro | Élitras encantadas |
| 1x Tronco de Mangue | 64x Foguete |
| 1x Tronco de Cerejeira | 64x Super Flecha de Fogo |
| 1x Paralelepípedo | 6x Totem da Eternidade |
| 1x Andesito | Tridente encantado |
| 1x Cana-de-Açúcar | 1x Poção do Superman |
| 1x Trigo | 64x Bloco de Obsidiana |
| 5x Diamante | 1x Totem da Morte |

---

## Receitas Auxiliares

| Receita | Ingredientes | Resultado |
| :--- | :--- | :--- |
| Batata → Abóbora | 2x Batata | 1x Abóbora |
| Pão → Ferro | 2x Pão | 20x Lingote de Ferro |

---

## Idiomas Suportados

`pt_BR` · `en_US` · `es_ES` · `es_MX`

---

## Estrutura do Projeto

```
PerigoVillager_BP/   — Behavior Pack (entidades, itens, receitas, scripts, trading)
PerigoVillager_RP/   — Resource Pack (texturas, modelos, animações, localização)
```

## Instalação

1. Baixe ou clone este repositório.
2. Copie `PerigoVillager_BP` e `PerigoVillager_RP` para a pasta de development packs do seu Minecraft Bedrock.
3. Ative ambos os pacotes nas configurações do seu mundo.
4. Habilite os experimentos necessários (Beta APIs para o script funcionar).
