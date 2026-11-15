class OverworldEvent {
    constructor({ map, event }) {
        this.map = map;
        this.event = event;
    }

    stand(resolve) {
        const who = this.map.gameObjects[ this.event.who ];
        who.startBehavior({
            map: this.map
        }, {
            type: "stand",
            direction: this.event.direction,
            time: this.event.time
        })

        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonStandComplete", completeHandler);
                resolve();
            }
        }
        document.addEventListener("PersonStandComplete", completeHandler)
    }

    walk(resolve) {
        const who = this.map.gameObjects[ this.event.who ];
        who.startBehavior({
            map: this.map
        }, {
            type: "walk",
            direction: this.event.direction,
            retry: true
        })

        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonWalkingComplete", completeHandler);
                resolve();
            }
        }
        document.addEventListener("PersonWalkingComplete", completeHandler)
    }

    textMessage(resolve) {
        if (this.event.faceHero) {
            const obj = this.map.gameObjects[this.event.faceHero];
            obj.direction= utils.oppositeDirection(this.map.gameObjects['hero'].direction);
        }

        const message = new TextMessage({
            text: this.event.text,
            onComplete: () => resolve()
        })
        message.init( document.querySelector(".game-container") )
    }

    changeMap(resolve) {
        const sceneTransition = new SceneTransition();
        const hud = this.map.overworld.hud;

        if (hud && hud.questElement) {
            hud.questElement.classList.add("fade-out");
        }

        setTimeout(() => {
            sceneTransition.init(document.querySelector(".game-container"), () => {
                this.map.overworld.startMap(
                    window.OverworldMaps[this.event.map],
                    {
                        x: this.event.x,
                        y: this.event.y,
                        direction: this.event.direction,
                    }
                );
                if (hud && hud.questElement) {
                    hud.questElement.classList.remove("fade-out");
                }
            
                resolve();
                sceneTransition.fadeOut();    
            });
        }, 600);
    }

    battle(resolve) {
        const battle = new Battle({
            enemy: Enemies[this.event.enemyId],
            arena: this.event.arena || null,
            questBattle: this.event.questBattle || false,
            onComplete: (didWin) => {
                resolve(didWin ? "WON_BATTLE" : "LOST_BATTLE");
            }
        })
        battle.init(document.querySelector(".game-container"));
    }

    pause(resolve) {
        this.map.isPaused = true;
        const menu = new PauseMenu({
            progress: this.map.overworld.progress,
            onComplete: () => {
                resolve();
                this.map.isPaused = false;
                this.map.overworld.startGameLoop();
            }
        });
        menu.init(document.querySelector(".game-container"));
    }

    addStoryFlag(resolve) {
        window.playerState.storyFlags[this.event.flag] = true;
        utils.emitEvent("PlayerStateUpdated");
        resolve();
    }

    giveXp(resolve) {
        const amount = this.event.amount;
        const pizzaId = this.event.pizzaId || playerState.lineup[0];
        const pizza = playerState.pizzas[pizzaId];

        if (!pizza) {
            resolve();
            return;
        }

        pizza.xp += amount;

        while (pizza.xp >= pizza.maxXp) {
            pizza.xp -= pizza.maxXp;
            pizza.level += 1;
            pizza.maxHp += 5;
            pizza.hp = pizza.maxHp;
        }
        utils.emitEvent("PlayerStateUpdated")
        resolve();
    }

    craftingMenu(resolve) {
        const menu = new CraftingMenu({
            pizzas: this.event.pizzas,
            onComplete: () => {
                resolve();
            }
        })
        menu.init(document.querySelector(".game-container"))
    }

    init() {
        return new Promise(resolve => {
            this[this.event.type](resolve)
        })
    }
}