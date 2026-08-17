import { world, system, EquipmentSlot, GameMode } from "@minecraft/server";

// Controla erros já reportados para não spammar o chat
const errosReportados = new Set();

function reportarErro(contexto, erro) {
    const chave = `${contexto}:${erro.message}`;
    if (!errosReportados.has(chave)) {
        errosReportados.add(chave);
        for (const p of world.getPlayers()) {
            p.sendMessage(`§c§l[PerigoVillager] Erro em ${contexto}: ${erro.message}`);
        }
    }
}

// ==========================================
// UTILITÁRIO: Flash de luz na posição do monstro
// Coloca um bloco light[level=15] por 2 ticks e remove
// ==========================================
function flashLuz(dimension, pos) {
    const x = Math.floor(pos.x);
    const y = Math.floor(pos.y);
    const z = Math.floor(pos.z);
    dimension.runCommandAsync(`setblock ${x} ${y} ${z} light[block_light_level=15] replace air`);
    system.runTimeout(() => {
        dimension.runCommandAsync(`setblock ${x} ${y} ${z} air`);
    }, 2);
}

// ==========================================
// UTILITÁRIO: Calcula posição segura para o raio
// Verifica raio de 2 blocos ao redor do mob (horizontal e acima)
// Se tiver bloco sólido próximo, sobe o raio 20 blocos acima
// Se estiver ao ar livre, cai 2 blocos acima normalmente
// ==========================================
function posicaoRaio(dimension, pos) {
    const cx = Math.floor(pos.x);
    const cy = Math.floor(pos.y);
    const cz = Math.floor(pos.z);

    // Verifica blocos num raio de 2 horizontalmente e de 1 a 4 blocos acima
    // (dy começa em 1 para ignorar o chão onde o mob está de pé)
    for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
            for (let dy = 1; dy <= 4; dy++) {
                try {
                    const bloco = dimension.getBlock({ x: cx + dx, y: cy + dy, z: cz + dz });
                    if (bloco && bloco.typeId !== "minecraft:air") {
                        // Bloco sólido próximo — raio cai bem acima para não atingir estrutura
                        return { x: pos.x, y: pos.y + 20, z: pos.z };
                    }
                } catch (e) { reportarErro("posicaoRaio", e); }
            }
        }
    }

    // Área livre — raio cai 2 blocos acima normalmente
    return { x: pos.x, y: pos.y + 2, z: pos.z };
}

// ==========================================
// 1. RASTRO E SUPER ATAQUE AUTOMÁTICO (Liberado na Água)
// ==========================================
system.runInterval(() => {
    const dimensions = ["overworld", "nether", "the_end"];
    for (const dim of dimensions) {
        const arrows = world.getDimension(dim).getEntities({ type: "calca14:fire_arrow" });
        
        for (const arrow of arrows) {
            try {
                if (arrow.location.y >= 320 || arrow.location.y <= -64) continue;

                const vel = arrow.getVelocity();
                if (Math.abs(vel.x) < 0.05 && Math.abs(vel.y) < 0.05 && Math.abs(vel.z) < 0.05) {
                    continue;     
                }

                const block = arrow.dimension.getBlock(arrow.location);
                const isInWater = block && (block.typeId === "minecraft:water" || block.typeId === "minecraft:flowing_water");

                if (isInWater) {
                    arrow.runCommandAsync("particle minecraft:bubble_column_up_particle ~ ~ ~");
                    arrow.runCommandAsync("particle minecraft:water_splash_particle ~ ~ ~");
                } else {
                    arrow.runCommandAsync("particle minecraft:basic_flame_particle ~ ~ ~");
                    arrow.runCommandAsync("particle minecraft:lava_particle ~ ~ ~");
                }

                const alvos = arrow.dimension.getEntities({
                    location: arrow.location,
                    maxDistance: 30, 
                    families: ["monster"]
                });

                for (const alvosMorte of alvos) {
                    try {
                        if (alvosMorte.location.y >= 320 || alvosMorte.location.y <= -64) continue;
                        if (alvosMorte.typeId === "minecraft:player") continue;

                        const pos = alvosMorte.location;
                        alvosMorte.kill();
                        
                        const posRaio = posicaoRaio(arrow.dimension, pos);
                        arrow.dimension.spawnEntity("minecraft:lightning_bolt", posRaio);
                        arrow.dimension.spawnParticle("minecraft:huge_explosion_emitter", pos);
                        arrow.dimension.spawnParticle("minecraft:electric_spark_particle", pos);
                        flashLuz(arrow.dimension, pos);
                        arrow.runCommandAsync("playsound ambient.weather.thunder @a ~ ~ ~ 1 1");
                        arrow.runCommandAsync("playsound random.explode @a ~ ~ ~ 1 1");
                    } catch (e) { reportarErro("fire_arrow:alvo", e); }
                }
            } catch (e) { reportarErro("fire_arrow:arrow", e); }
        }
    }
}, 2);

// ==========================================
// 2. TOTEM DA MORTE (Offhand — raio 15 blocos)
// ==========================================
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        try {
            const equipment = player.getComponent("minecraft:equippable");
            if (!equipment) continue;

            const offhandItem = equipment.getEquipment(EquipmentSlot.Offhand);
            if (!offhandItem || offhandItem.typeId !== "calca14:totem_morte") continue;

            if (player.location.y >= 320 || player.location.y <= -64) continue;

            // Partícula discreta só a cada 20 ticks (1 segundo) para não atrapalhar visão
            if (system.currentTick % 20 === 0) {
                player.runCommandAsync("particle minecraft:totem_particle ~ ~1 ~");
            }

            const alvos = player.dimension.getEntities({
                location: player.location,
                maxDistance: 15,
                families: ["monster"]
            });

            for (const alvo of alvos) {
                try {
                    if (alvo.typeId === "minecraft:player") continue;
                    if (alvo.location.y >= 320 || alvo.location.y <= -64) continue;

                    const pos = alvo.location;
                    alvo.kill();

                    const posRaio = posicaoRaio(player.dimension, pos);
                    player.dimension.spawnEntity("minecraft:lightning_bolt", posRaio);
                    player.dimension.spawnParticle("minecraft:huge_explosion_emitter", pos);
                    player.dimension.spawnParticle("minecraft:electric_spark_particle", pos);
                    flashLuz(player.dimension, pos);
                    player.runCommandAsync("playsound ambient.weather.thunder @a ~ ~ ~ 1 1");
                    player.runCommandAsync("playsound random.explode @a ~ ~ ~ 1 1");
                } catch (e) { reportarErro("totem_morte:alvo", e); }
            }
        } catch (e) { reportarErro("totem_morte:player", e); }
    }
}, 2);

// ==========================================
// 3. SISTEMA DE CONSUMO DA POÇÃO DO SUPERMAN
// ==========================================
world.afterEvents.itemCompleteUse.subscribe((event) => {
    const item = event.itemStack;
    const player = event.source;

    if (player.typeId === "minecraft:player" && item.typeId === "calca14:pocao_superman") {
        player.addEffect("minecraft:regeneration", 216000, { amplifier: 255 });
        player.addEffect("minecraft:absorption", 216000, { amplifier: 255 });
        player.addEffect("minecraft:resistance", 216000, { amplifier: 255 }); 
        player.addEffect("minecraft:fire_resistance", 216000, { amplifier: 255 });
        player.addEffect("minecraft:water_breathing", 216000, { amplifier: 255 });
        player.addEffect("minecraft:strength", 216000, { amplifier: 255 });
        player.addEffect("minecraft:haste", 216000, { amplifier: 255 });
        player.addEffect("minecraft:speed", 216000, { amplifier: 10 }); 
        player.addEffect("minecraft:jump_boost", 216000, { amplifier: 6 }); // Pulo ajustado para subir em casas com facilidade
        player.addEffect("minecraft:night_vision", 216000, { amplifier: 255 });
        
        // Queda lenta em nível 1 para planar com segurança
        player.addEffect("minecraft:slow_falling", 216000, { amplifier: 1, showParticles: false });
        player.addEffect("minecraft:saturation", 216000, { amplifier: 255 });

        player.addTag("superman_ativo");

        // Habilita voo estilo Superman via API (sem precisar de Education Edition)
        const abilities = player.getComponent("minecraft:player_abilities");
        if (abilities) {
            abilities.mayFly = true;
            abilities.flying = true;
        }
        
        player.sendMessage("§e§lVocê ganhou os poderes do Superman! Use o salto duplo para voar!");
    }
});

// ==========================================
// 4. VIGILÂNCIA DE PODERES E CONTADOR DO SUPERMAN
// ==========================================
system.runInterval(() => {
    const superJogadores = world.getPlayers({ tags: ["superman_ativo"] });

    for (const p of superJogadores) {
        const temResistencia = p.getEffect("minecraft:resistance");

        // Se a poção acabar, limpa a tag
        if (!temResistencia) {
            p.removeTag("superman_ativo");
            const abilities = p.getComponent("minecraft:player_abilities");
            if (abilities) {
                abilities.flying = false;
                abilities.mayFly = false;
            }
            p.sendMessage("§c§lSeus poderes se esgotaram!");
            continue;
        }

        // Exibe contador de tempo restante no actionbar
        const ticksRestantes = temResistencia.duration;
        const totalSegundos = Math.ceil(ticksRestantes / 20);
        const horas = Math.floor(totalSegundos / 3600);
        const minutos = Math.floor((totalSegundos % 3600) / 60);
        const segundos = totalSegundos % 60;
        const tempoStr = horas > 0
            ? `${horas}h ${minutos}m ${segundos}s`
            : minutos > 0
                ? `${minutos}m ${segundos}s`
                : `${segundos}s`;
        p.onScreenDisplay.setActionBar(`§e§lSuperman §r§7| §fPoderes: §a${tempoStr}`);
    }
}, 10);