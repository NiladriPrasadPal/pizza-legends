class CollectionMenu {
    constructor({ onClose }) {
        this.onClose = onClose;
        this.selectedPizza = null;
    }

    getOwnedPizzas(pizzaId) {
        return Object.entries(playerState.pizzas).filter(([id, pizza]) => {
            return pizza.pizzaId === pizzaId;
        });
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("CollectionMenu");

        const allPizzas = Object.entries(Pizzas);
        const ownedCount = allPizzas.filter(([id]) => {
            return this.getOwnedPizzas(id).length > 0;
        }).length;

        this.element.innerHTML = `
            <div class="CollectionHeader">
                <h2>Pizza Collection</h2>
                <span>${ownedCount}/${allPizzas.length} Discovered</span>
                <button class="CollectionClose">X</button>
            </div>

            <div class="CollectionContent">
                <div class="CollectionGrid"></div>
                <div class="CollectionDetails">
                    <h3>Select a Pizza</h3>
                    <p>Choose a pizza to view its information.</p>
                </div>
            </div>
        `;

        this.gridElement = this.element.querySelector(".CollectionGrid");
        this.detailsElement = this.element.querySelector(".CollectionDetails");

        this.element.querySelector(".CollectionClose").addEventListener("click", () => {
            this.close();
        });
        this.renderPizzas();
    }

    renderPizzas() {
        Object.entries(Pizzas).forEach(([pizzaId, pizza]) => {
            const owned = this.getOwnedPizzas(pizzaId);
            const isOwned = owned.length > 0;

            const card = document.createElement("button");
            card.classList.add("CollectionCard");

            if(!isOwned) {
                card.classList.add("locked");
            }

            const image = document.createElement("img");
            image.src = isOwned
                ? pizza.src
                : "/images/characters/pizzas/pizza-shadow.png";

            image.alt = isOwned ? pizza.name : "Undiscovered Pizza";

            const name = document.createElement("span");
            name.innerText = isOwned ? pizza.name : "???";

            const count = document.createElement("small");
            count.innerText = isOwned
                ? `Owned: ${owned.length}`
                : "Undiscovered";

            card.appendChild(image);
            card.appendChild(name);
            card.appendChild(count);

            card.addEventListener("click", () => {
                this.showDetails(pizzaId);
            });

            this.gridElement.appendChild(card);
        });
    }

    showDetails(pizzaId) {
        const pizza = Pizzas[pizzaId];
        const owned = this.getOwnedPizzas(pizzaId);

        this.detailsElement.innerHTML = "";

        const heading = document.createElement("h3");
        const description = document.createElement("p");
        const image = document.createElement("img");

        if (owned.length === 0) {
            heading.innerText = "Undiscovered Pizza";
            description.innerText = "You haven't discovered this pizza yet.";
            image.src = "/images/characters/pizzas/pizza-shadow.png";
            image.alt= "Undiscovered Pizza";

            this.detailsElement.append(image, heading, description);
            return;
        }

        heading.innerText = pizza.name;
        description.innerText = pizza.description;

        image.src = pizza.src;
        image.alt = pizza.name;

        this.detailsElement.append(image, heading, description);
        const type = document.createElement("p");
        type.innerText = `Type: ${pizza.type}`;

        this.detailsElement.appendChild(type);
        const ownedHeading = document.createElement("h4");
        ownedHeading.innerText = `Owned Copies: ${owned.length}`;

        this.detailsElement.appendChild(ownedHeading);

        owned.forEach(([instanceId, instance]) => {
            const card = document.createElement("div");
            card.classList.add("CollectionInstance");

            const level = document.createElement("p");
            level.innerText = `Level ${instance.level}`;

            const hp = document.createElement("p");
            hp.innerText = `HP: ${instance.hp}/${instance.maxHp}`;

            const xp = document.createElement("p");
            xp.innerText = `XP: ${instance.xp}/${instance.maxXp}`;

            const progress = document.createElement("div");
            progress.classList.add("CollectionXP");

            const fill = document.createElement("div");
            fill.style.width = `${
                Math.min(100, instance.xp / instance.maxXp * 100)
            }%`

            progress.appendChild(fill);

            card.append(level, hp, xp, progress);

            this.detailsElement.appendChild(card);
        });
    }

    close() {
        this.element.remove();
        this.onClose();
    }

    init(container) {
        this.createElement();
        container.appendChild(this.element);
    }
}