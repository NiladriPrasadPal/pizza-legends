class Hud {
    constructor() {
        this.scoreboards = [];
        this.questCompletionShown = false;
    }

    update() {
        this.scoreboards.forEach(s => {
            s.update(window.playerState.pizzas[s.id])
        })

        this.updateQuestTracker();
    }

    createElement() {

        if (this.element) {
            this.element.remove();
            this.scoreboards = [];
        }

        this.element = document.createElement("div");
        this.element.classList.add("Hud");

        const {playerState} = window;
        playerState.lineup.forEach(key => {
            const pizza = playerState.pizzas[key];
            const scoreboard = new Combatant({
                id: key,
                ...Pizzas[pizza.pizzaId],
                ...pizza,
            }, null)
            scoreboard.createElement();
            this.scoreboards.push(scoreboard);
            this.element.appendChild(scoreboard.hudElement);
        })
        this.update();
    }

    createQuestTracker(container) {
        this.questElement = document.createElement("div");
        this.questElement.classList.add("QuestTracker");
        container.appendChild(this.questElement);

        this.updateQuestTracker();
    }

    updateQuestTracker() {
        if (!this.questElement) return;
        if (window.isBattleActive) {
            this.questElement.style.display = "none";
            return;
        }

        const flags = window.playerState.storyFlags;

        const started = flags.STREET_QUEST_STARTED;
        const ready = flags.STREET_QUEST_READY;
        const claimed = flags.STREET_QUEST_CLAIMED;

        if (!started && !claimed) {
            this.questElement.style.display = "none";
            return;
        }

        this.questElement.style.display = "block";

        if(claimed) {
            if (this.questCompletionShown) {
                this.questElement.style.display = "none";
                return;
            }

            this.questElement.innerHTML = `
                <div class="QuestTracker_title">QUEST COMPLETE</div>
                <div class="QuestTracker_text">Street Challenge</div>
            `;
            
            this.questElement.style.display = "block";
            this.questElement.classList.remove("fade-out");

            this.questCompletionShown = true;

            setTimeout(() => {
                this.questElement.classList.add("fade-out");
                setTimeout(() => {
                    this.questElement.style.display = "none";
                }, 600);
            }, 2500);

            return;
        }
        const wins = Math.min(flags.STREET_QUEST_WINS || 0,3);

        this.questElement.innerHTML = `
            <div class="QuestTracker_title">STREET CHALLENGE</div>
            <div class="QuestTracker_text">
                ${ready ? "Return to the quest giver!" : `Defeat opponnents: ${wins}/3`}
            </div>
        `;
    }

    init(container) {
        this.createElement();
        container.appendChild(this.element);

        this.createQuestTracker(container);

        document.addEventListener("PlayerStateUpdated", () => {
            this.update();
        })

        document.addEventListener("LineupChanged", () => {
            this.createElement();
            container.appendChild(this.element);
        })
    }
}