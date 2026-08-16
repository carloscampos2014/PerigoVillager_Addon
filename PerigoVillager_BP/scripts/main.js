import { world, system } from "@minecraft/server";

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
                
                // Spawna o raio e o trovão em qualquer lugar, incluindo debaixo d'água
                arrow.dimension.spawnEntity("minecraft:lightning_bolt", pos);
                arrow.dimension.spawnParticle("minecraft:huge_explosion_emitter", pos);
                arrow.dimension.runCommandAsync(`playsound ambient.weather.thunder @a ${pos.x} ${pos.y} ${pos.z} 1 1`);
            }
        }
    }
}, 2);

// ==========================================
// 2. SISTEMA DE CONSUMO DA POÇÃO DO SUPERMAN
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

        player.addTag("superman_ativo");
        
        player.sendMessage("§e§lVocê ganhou os poderes do Superman, infelizmente só não dá para fazer voar!");
    }
});

// ==========================================
// 3. VIGILÂNCIA DE PODERES E POUSO SEGURO
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