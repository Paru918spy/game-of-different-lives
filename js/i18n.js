/* UI strings (English only). */
window.GOL = window.GOL || { characters: [] };
GOL.ui = {
    title: "Game of Different Lives",
    lead: "Walk through the real life stories of people who faced barriers, prejudice and doubt, and who made history anyway. Pick a life and spin the wheel.",
    soonTitle: "Coming soon",
    note: "Details are based on public biographies; scenes marked “Illustrative” are not about one specific person.",
    play: "Play this life", soon: "Soon", chapter: "Chapter", hope: "Hope", support: "Support (bonus to your spin)",
    spin: "Spin the wheel", spinning: "Spinning…", quit: "Back to all lives",
    tile: "Space", of: "of", illustrative: "Illustrative scene",
    gateTitle: "A barrier blocks the way",
    gateText: (need, label) => `To get past this, you need to spin ${need} or more (your Support is added). “${label}”`,
    gateSpin: (r, s, need) => `You spun ${r}${s ? ` + ${s} support` : ""} = ${r + s}. You need ${need}.`,
    gateFail: "Not this time. You stay here and lose a turn. Barriers cost real time and energy.",
    gatePass: "You push through! Time to move on.",
    gatePersist: "Persistence bonus: after repeated tries, +1 to your next spin.",
    withoutBarrier: "Without this barrier, you would simply have moved on.",
    gotIt: "Continue", choose: "What would you do?", realTitle: "What really happened",
    support1: "+1 Support", hopeUp: n => `Hope +${n}`, hopeDown: n => `Hope −${n}`,
    movedLabel: n => `Moved ${n} space${n > 1 ? "s" : ""}.`,
    endTitle: "The journey ends", stats: "Your journey in numbers",
    sTurns: "Turns taken", sBarriers: "Barriers met", sLost: "Turns lost to barriers", sHope: "Final hope", sSupport: "Support gathered",
    realStory: "The real story", reflect: "Think about it", sources: "Where this comes from",
    again: "Play another life", replay: "Play again", pickFirst: "Pick a life to begin"
};
