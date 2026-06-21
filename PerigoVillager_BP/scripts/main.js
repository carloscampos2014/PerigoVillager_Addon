import { world, system } from "@minecraft/server";

// Sistema rodando a cada tick do jogo
system.runInterval(() => {
    const dimensions = ["overworld", "nether", "the_end"];
    for (const dim of dimensions) {
        const arrows = world.getDimension(dim).getEntities({ type: "calca14:fire_arrow" });
        
        for (const arrow of arrows) {
            if (arrow.location.y >= 320 || arrow.location.y <= -64) continue;

            // TRILHA DE PARTÍCULAS
            arrow.dimension.spawnParticle("minecraft:basic_flame_particle", arrow.location);

            // ATAQUE AUTOMÁTICO RAIO 20 BLOCOS
            const monstros = arrow.dimension.getEntities({
                location: arrow.location,
                maxDistance: 20,
                families: ["monster"]
            });

            for (const monstro of monstros) {
                if (monstro.location.y >= 320 || monstro.location.y <= -64) continue;
                monstro.kill();
                arrow.dimension.spawnEntity("minecraft:lightning_bolt", monstro.location);
            }
        }
    }
}, 1);

// Garante que o arco atire a entidade correta ao disparar
world.afterEvents.itemUseOn.subscribe((event) => {
    const item = event.itemStack;
    const player = event.source;
    if (item?.typeId === "calca14:fire_bow") {
        system.runTimeout(() => {
            const entities = player.dimension.getEntities({
                location: player.location,
                maxDistance: 3,
                type: "minecraft:arrow"
            });
            for (const ent of entities) {
                const loc = ent.location;
                const vel = ent.getVelocity();
                ent.triggerEvent("minecraft:despawn");
                const customArrow = player.dimension.spawnEntity("calca14:fire_arrow", loc);
                customArrow.setVelocity(vel);
            }
        }, 1);
    }
});

// Consumo da Poção do Superman
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
        player.addEffect("minecraft:speed", 216000, { amplifier: 15 });
        player.addEffect("minecraft:jump_boost", 216000, { amplifier: 10 });
        player.addEffect("minecraft:night_vision", 216000, { amplifier: 255 });
    }
});