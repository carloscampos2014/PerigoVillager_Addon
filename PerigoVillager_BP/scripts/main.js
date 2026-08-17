import { world, system, EquipmentSlot } from "@minecraft/server";

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
// 1. RASTRO E SUPER ATAQUE AUTOMÁTICO (Liberado na Água)
// ==========================================
system.runInterval(() => {
    const dimensions = ["overworld", "nether", "the_end"];
    for (const dim of dimensions) {
        // Rastreia estritamente a flecha customizada do add-on
        const arrows = world.getDimension(dim).getEntities({ type: "calca14:fire_arrow" });
        
        for (const arrow of arrows) {
            if (arrow.location.y >= 320 || arrow.location.y <= -64) continue;

            const vel = arrow.getVelocity();
            if (Math.abs(vel.x) < 0.05 && Math.abs(vel.y) < 0.05 && Math.abs(vel.z) < 0.05) {
                continue;     
            }

            // SENSOR DE ÁGUA (Apenas visual: mostra bolhas na água e fogo fora dela, mas sem bloquear o raio)
            const block = arrow.dimension.getBlock(arrow.location);
            const isInWater = block && (block.typeId === "minecraft:water" || block.typeId === "minecraft:flowing_water");

            if (isInWater) {
                arrow.runCommandAsync("particle minecraft:bubble_column_up_particle ~ ~ ~");
                arrow.runCommandAsync("particle minecraft:water_splash_particle ~ ~ ~");
            } else {
                arrow.runCommandAsync("particle minecraft:basic_flame_particle ~ ~ ~");
                arrow.runCommandAsync("particle minecraft:lava_particle ~ ~ ~");
            }

            // ATAQUE AUTOMÁTICO (Funciona tanto na terra quanto na água agora)
            const alvos = arrow.dimension.getEntities({
                location: arrow.location,
                maxDistance: 30, 
                families: ["monster"]
            });

            for (const alvosMorte of alvos) {
                if (alvosMorte.location.y >= 320 || alvosMorte.location.y <= -64) continue;
                if (alvosMorte.typeId === "minecraft:player") continue;

                const pos = alvosMorte.location;
                alvosMorte.kill();
                
                // Visual de raio + flash de luz
                arrow.dimension.spawnParticle("minecraft:lightning_recharge_station_particles", pos);
                arrow.dimension.spawnParticle("minecraft:huge_explosion_emitter", pos);
                arrow.dimension.spawnParticle("minecraft:electric_spark_particle", pos);
                arrow.dimension.spawnParticle("minecraft:totem_particle", pos);
                flashLuz(arrow.dimension, pos);
                // Som tocado a partir da posição da flecha (tem executador válido)
                arrow.runCommandAsync("playsound ambient.weather.thunder @a ~ ~ ~ 1 1");
                arrow.runCommandAsync("playsound random.explode @a ~ ~ ~ 1 1");
            }
        }
    }
}, 2);

// ==========================================
// 2. TOTEM DA MORTE (Offhand — raio 15 blocos)
// ==========================================
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        // Verifica se o totem está no slot de offhand
        const equipment = player.getComponent("minecraft:equippable");
        if (!equipment) continue;

        const offhandItem = equipment.getEquipment(EquipmentSlot.Offhand);
        if (!offhandItem || offhandItem.typeId !== "calca14:totem_morte") continue;

        if (player.location.y >= 320 || player.location.y <= -64) continue;

        // Partícula de aviso ao redor do jogador para indicar que o totem está ativo
        player.runCommandAsync("particle minecraft:totem_particle ~ ~1 ~");

        // Busca monstros no raio de 15 blocos
        const alvos = player.dimension.getEntities({
            location: player.location,
            maxDistance: 15,
            families: ["monster"]
        });

        for (const alvo of alvos) {
            if (alvo.typeId === "minecraft:player") continue;
            if (alvo.location.y >= 320 || alvo.location.y <= -64) continue;

            const pos = alvo.location;
            alvo.kill();

            // Visual de raio + flash de luz
            player.dimension.spawnParticle("minecraft:lightning_recharge_station_particles", pos);
            player.dimension.spawnParticle("minecraft:huge_explosion_emitter", pos);
            player.dimension.spawnParticle("minecraft:electric_spark_particle", pos);
            player.dimension.spawnParticle("minecraft:totem_particle", pos);
            flashLuz(player.dimension, pos);
            // Som tocado a partir do jogador (tem executador válido)
            player.runCommandAsync("playsound ambient.weather.thunder @a ~ ~ ~ 1 1");
            player.runCommandAsync("playsound random.explode @a ~ ~ ~ 1 1");
        }
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
        
        player.sendMessage("§e§lVocê ganhou os poderes do Superman, infelizmente só não dá para fazer voar!");
    }
});

// ==========================================
// 4. VIGILÂNCIA DE PODERES E POUSO SEGURO
// ==========================================
system.runInterval(() => {
    const superJogadores = world.getPlayers({ tags: ["superman_ativo"] });

    for (const p of superJogadores) {
        const temResistencia = p.getEffect("minecraft:resistance");

        // Se a poção acabar, limpa a tag
        if (!temResistencia) {
            p.removeTag("superman_ativo");
            p.sendMessage("§c§lSeus poderes se esgotaram!");
            continue;
        }
    }
}, 10);