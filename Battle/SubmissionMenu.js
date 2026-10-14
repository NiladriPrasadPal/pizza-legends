class SubmissionMenu {
    constructor({ caster, enemy, onComplete}) {
        this.caster = caster;
        this.enemy = enemy;
        this.onComplete = onComplete;
    }

    decide() {
        console.log("Caster:", this.caster);
        console.log("Enemy:", this.enemy);
        console.log("Actions object:", window.Actions);

        if (!this.caster) {
            console.error("The caster is undefined!");
            return;
        }

        const action = window.Actions[this.caster.actions?.[0]];
        console.log("Selected action:", action);
        
        this.onComplete({
            action,
            target: this.enemy
        })
    }

    init(container) {
        this.decide()
    }
}