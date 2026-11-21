/* Stephen Hawking: playable story.
   Tile types: start | info | win | barrier | choice | finish
   barrier.gate = { need: 2|3 }  -> you must spin at least `need` (plus your Support bonus) to move on.
   Facts come from widely documented public sources; see docs/characters.md. Anything illustrative is flagged with `illustrative: true`. */
window.GOL = window.GOL || { characters: [] };
GOL.characters.push({
  id: "hawking",
  name: "Stephen Hawking",
  years: "1942 – 2018",
  tagline: "A physicist who was given two years to live and kept asking questions about the universe for 55 more.",
  focus: "Disability (motor neurone disease)",
  avatar: { emoji: "🔭", color: "#3b5bdb" },
  start: { hope: 6, support: 0 },
  intro: "You are Stephen Hawking, a curious boy in post-war England. Your path is full of discoveries, and one very unfair obstacle. Spin the wheel and see how far curiosity, friends and technology can carry you.",
  stages: ["Childhood & school", "Student years", "Diagnosis", "Scientist & family", "Voice & fame", "Legacy"],
  tiles: [
    { id: "start", stage: 0, type: "start", title: "Oxford, 1942",
      text: "Stephen is born on 8 January 1942 in Oxford, exactly 300 years after Galileo died. His parents are both scientists. The family later settles in St Albans." },
    { id: "school", stage: 0, type: "info", title: "Nicknamed “Einstein”",
      text: "At St Albans School Stephen is not top of the class, but he loves board games and taking things apart. With friends he builds a simple computer from recycled parts. His classmates jokingly call him “Einstein”." },
    { id: "oxford", stage: 1, type: "win", title: "Oxford at 17",
      text: "Stephen wins a place at University College, Oxford. His father hoped for medicine, but Stephen wanted mathematics and physics. He studies far less than most, yet narrowly earns the first-class degree he needs to continue to Cambridge.",
      effects: { hope: 1 } },
    { id: "cambridge", stage: 1, type: "info", title: "Cambridge, 1962",
      text: "Stephen begins his PhD in cosmology under Dennis Sciama. Soon he notices he is clumsy: he stumbles, drops things, and his speech sometimes slurs." },
    { id: "diagnosis", stage: 2, type: "barrier", title: "Diagnosis: ALS",
      text: "At 21 Stephen is diagnosed with motor neurone disease (ALS). Doctors give him about two years to live. He falls into depression, until he realises that if his life is short, he wants to make it count.",
      gate: { need: 3, label: "Finding the strength to carry on" },
      effects: { hope: -3 } },
    { id: "jane", stage: 2, type: "win", title: "A reason to live",
      text: "Stephen meets Jane Wilde and they get engaged. He later says the engagement “gave me something to live for.” They marry in 1965. Friends, family and fellow students become the support network that makes his work possible.",
      effects: { hope: 2, support: 1 } },
    { id: "access", stage: 2, type: "barrier", title: "A world built for others",
      text: "He begins using walking sticks, then a wheelchair. Old Cambridge buildings have stairs and no ramps, and everyday tasks take much more time and help. Colleagues and students pitch in to make the work possible.",
      gate: { need: 2, label: "Getting around an inaccessible world" },
      effects: { hope: -1 } },
    { id: "choice-work", stage: 3, type: "choice", title: "Keep going, or slow down?",
      text: "Your body is weakening. Roger Penrose’s new work on black holes could answer a big question about how the universe began, and it would be a lot of effort.",
      options: [
        { label: "Dive into the research", effects: { hope: 2 }, result: "You work on singularities." },
        { label: "Take time to rest and recover", effects: { hope: 1, support: 1 }, result: "You rest and your friends help you." }
      ],
      reveal: "What Stephen did: he threw himself into the work. Together with Penrose he showed that the Big Bang must have started from a singularity, and his 1966 thesis earned him a prestigious prize. Disabled people choose different paths, and both are valid. Rest and support matter too." },
    { id: "radiation", stage: 3, type: "win", title: "Hawking radiation",
      text: "In 1974 Stephen shows that black holes are not completely black: they slowly leak energy, now called Hawking radiation. At 32 he becomes one of the youngest Fellows of the Royal Society.",
      effects: { hope: 2 } },
    { id: "family", stage: 3, type: "info", title: "Daily help, daily teamwork",
      text: "Stephen and Jane have three children. As his illness progresses he needs more and more care: nurses, family, and graduate students help with daily life. Behind every “lone genius” stands a lot of people.",
      effects: { support: 1 } },
    { id: "lucasian", stage: 3, type: "win", title: "Newton’s old chair",
      text: "In 1979 Stephen becomes Lucasian Professor of Mathematics at Cambridge, the post once held by Isaac Newton. He keeps it for 30 years.",
      effects: { hope: 2 } },
    { id: "voice", stage: 4, type: "barrier", title: "Geneva, 1985: losing his voice",
      text: "During a trip to Switzerland Stephen gets severe pneumonia. To save his life, doctors perform a tracheotomy. He survives, but can no longer speak. By now only very close friends can understand him at all, and he needs round-the-clock care.",
      gate: { need: 3, label: "Rebuilding how to communicate" },
      effects: { hope: -2 } },
    { id: "tech", stage: 4, type: "win", title: "Technology gives him a voice",
      text: "A computer program called Equalizer lets him pick words with a hand clicker, later with a tiny sensor on his cheek. A speech synthesizer speaks for him. The American accent becomes his trademark, and he refuses to change it because it feels like his voice.",
      effects: { hope: 2, support: 1 } },
    { id: "book", stage: 4, type: "win", title: "A Brief History of Time",
      text: "His 1988 book explaining the universe to everyone sells more than 25 million copies. A scientist who can’t speak becomes one of the best-known voices on Earth.",
      effects: { hope: 2 } },
    { id: "talkedover", stage: 4, type: "barrier", illustrative: true, title: "Spoken over, spoken about",
      text: "Illustrative: People with speech impairments often report being ignored, talked about in the third person, or wrongly assumed to be less intelligent. Strangers address the carer instead of the person. Patience and respect would cost nothing.",
      gate: { need: 2, label: "Being taken seriously" },
      effects: { hope: -1 } },
    { id: "zerog", stage: 5, type: "win", title: "Weightless, 2007",
      text: "At 65 Stephen takes a zero-gravity flight. For the first time in decades his body is free of its limits. He says he could have gone on forever.",
      effects: { hope: 2 } },
    { id: "paralympics", stage: 5, type: "win", title: "Paralympics 2012",
      text: "Stephen speaks at the opening ceremony of the London Paralympics. He asks everyone to “look up at the stars and not down at your feet,” and says that however difficult life may seem, there is always something you can do and succeed at.",
      effects: { hope: 2, support: 1 } },
    { id: "legacy", stage: 5, type: "info", title: "Honours and impact",
      text: "He receives the US Presidential Medal of Freedom (2009) among countless honours, and becomes a global voice for science and for disability rights. He campaigns for access to healthcare and technology for disabled people." },
    { id: "finish", stage: 5, type: "finish", title: "Cambridge, 2018",
      text: "Stephen Hawking dies on 14 March 2018 at 76, 55 years after doctors expected him to die. His ashes are placed in Westminster Abbey, near Isaac Newton and Charles Darwin." }
  ],
  ending: {
    headline: "Not despite difference: with support, tools and stubborn curiosity",
    real: "Stephen Hawking lived 55 years after his diagnosis. His life shows what becomes possible when a person is supported, with technology, with caregivers, with colleagues who see the mind and not the wheelchair. It also shows that his “superpower” was only half genius: the other half was the network around him.",
    reflect: [
      "How many of the barriers in this story were about his body, and how many about the world around him?",
      "What helped him most: technology, people, or his own attitude?",
      "Which small change (a ramp, patience, a speech tool) would make life easier for someone you know?"
    ]
  },
  sources: [
    "Stephen Hawking, My Brief History (2013)",
    "Encyclopaedia Britannica: Stephen Hawking",
    "stephenhawking.com (official site, family & estate)",
    "BBC and Royal Society obituaries/profiles, March 2018"
  ]
});
