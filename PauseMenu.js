class PauseMenu {
    constructor({progress, onComplete}) {
        this.progress = progress;
        this.onComplete = onComplete;
    }

    getOptions(pageKey) {
        if (pageKey === "root") {
            const lineupPizzas = playerState.lineup.map(id => {
                const {pizzaId} = playerState.pizzas[id];
                const base = Pizzas[pizzaId];
                return {
                    label: base.name,
                    description: base.description,
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions(id) )
                    }
                }
            })
            return [
                ...lineupPizzas,
                {
                    label: "Pizza Collection",
                    description: "View all discovered and undiscovered pizzas",
                    handler: () => {
                        console.log("1. Collection button clicked")
                        if (window.isBattleActive) {
                            console.log("2. Battle is active");
                            return;
                        }

                        console.log("3. Opening collection");
                    
                        this.keyboardMenu.end();
                        this.element.remove();

                        this.collectionMenu = new CollectionMenu({
                            onClose: () => {
                                this.collectionMenu = null;

                                this.createElement();
                                this.keyboardMenu = new KeyboardMenu({
                                    descriptionContainer: this.container
                                });

                                this.keyboardMenu.init(this.element);
                                this.keyboardMenu.setOptions(this.getOptions("root"));

                                this.container.appendChild(this.element);
                                this.esc = new KeyPressListener("Escape", () => {
                                    this.close();
                                })
                            }
                        });

                        console.log("4. Collection object created");

                        this.collectionMenu.init(this.container);

                        console.log("5. Collection initialized");
                    },
                },
                {
                    label: "Save",
                    description: "Save your progress",
                    handler: () => {
                        this.progress.save();
                        this.close();
                    }
                },
                {
                    label: "Close",
                    description: "Close the pause menu",
                    handler: () => {
                        this.close();
                    }
                }
            ]
        }

        const unequipped = Object.keys(playerState.pizzas).filter(id => {
            return playerState.lineup.indexOf(id) === -1;
        }).map(id => {
            const {pizzaId} = playerState.pizzas[id];
            const base = Pizzas[pizzaId];
            return {
                label: `Swap for ${base.name}`,
                description: base.description,
                handler: () => {
                    playerState.swapLineup(pageKey, id);
                    this.keyboardMenu.setOptions( this.getOptions("root") );
                }
            }
        })

        return [
            ...unequipped,
            {
                label: "Move to front",
                description: "Move this pizza to the front of the list",
                handler: () => {
                    playerState.moveToFront(pageKey);
                    this.keyboardMenu.setOptions( this.getOptions("root") );
                }
            },
            {
                label: "Back",
                description: "Back to root menu",
                handler: () => {
                    this.keyboardMenu.setOptions( this.getOptions("root") );
                }
            }
        ];
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("PauseMenu");
        this.element.classList.add("overlayMenu");
        this.element.innerHTML = (`
            <h2>Pause Menu</h2>    
        `)
    }

    close() {
        this.esc?.unbind();
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    async init(container) {
        this.container = container;
        this.createElement();
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions("root"));

        container.appendChild(this.element);

        utils.wait(200);
        this.esc = new KeyPressListener("Escape", () => {
            if (this.collectionMenu) {
                this.collectionMenu.close();
            } else {
                this.close();
            }
        })
    }
}