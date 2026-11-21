/* Fictional characters. Invented people; situations are based on widely documented real-world experiences. */
GOL.add({
  id: "amira", fictional: true, name: "Amira", years: "fictional", focus: "Refugee experience", emoji: "🧭", color: "#a16207",
  illus: { style: "hijab", scarf: "#7c3aed", skin: "#d9a577", shirt: "#f59e0b", bg: "#fde68a", label: "Illustration of Amira" },
  tagline: "A fictional 16-year-old who has to rebuild her life in a new country.",
  intro: "Amira is an invented character. Her story is based on experiences many refugees describe. She was a top student at home, and her family has had to leave everything behind.",
  stages: ["Home", "The journey", "Arrival", "Building a life"],
  tiles: [
    ["start", 0, "Home", "Amira is 16 and loves maths and football. Her father is a teacher, her mother a nurse. Then war arrives in her city, and their school and hospital are damaged."],
    ["barrier", 0, "Leaving everything", "Her family decides to leave. They can only take what they can carry. Amira says goodbye to friends, her grandmother and her school books.", { need: 2, label: "Leaving home", ill: true }],
    ["barrier", 1, "The journey", "The journey takes months. The family is afraid, tired and sometimes hungry, and relies on strangers. Amira helps her younger brother keep calm by telling him stories.", { need: 3, label: "Surviving the journey", ill: true }],
    ["win", 1, "Kindness on the way", "At a border camp, a volunteer doctor treats her brother and a teacher gives Amira a notebook. Small acts of kindness mean everything.", { fx: { hope: 2, support: 1 }, ill: true }],
    ["info", 2, "Arrival in Germany", "The family arrives in Germany and lives in a shared accommodation. Amira waits for months for papers and for a school place. Everything is new: the language, the food, the rules, the weather."],
    ["barrier", 2, "A language she doesn’t speak", "In class she understands almost nothing. She feels clever at home, but here classmates see only a girl who can’t speak. Some are kind, and some tease her scarf.", { need: 2, label: "Learning a new language", ill: true }],
    ["win", 2, "A teacher and a classmate", "A teacher stays after class to help her with German, and a classmate named Jana invites her to football. Amira starts to feel that she belongs.", { fx: { hope: 2, support: 2 }, ill: true }],
    ["barrier", 2, "Paperwork and waiting", "The family waits years for decisions about their status. Her parents can’t work in their old jobs because their qualifications aren’t recognised. Her father drives a delivery van.", { need: 3, label: "Waiting for a decision", ill: true }],
    ["choice", 3, "Which way?", "Amira’s grades are good. A counsellor says that many pupils with her background are advised to take a shorter, practical path. She wants to study medicine.", { opts: [["Follow the counsellor’s advice", { hope: 0 }, "You choose the easier route."], ["Insist on the Abitur, the route to university", { hope: 1, support: 1 }, "You ask your teacher and Jana’s mother for help."]], reveal: "This is an invented scene, based on research that students from migrant families are often recommended lower school tracks, even with the same grades. Teachers, mentors and community groups can make a difference.", ill: true }],
    ["win", 3, "Her Abitur", "With extra tutoring and a mentor, Amira passes the Abitur. Her parents cry with pride, and she is accepted to study medicine.", { fx: { hope: 3, support: 1 }, ill: true }],
    ["win", 3, "Giving back", "Amira volunteers as an interpreter at a clinic, helping new arrivals. She remembers how it felt to have nobody who understood her.", { fx: { hope: 2, support: 1 }, ill: true }],
    ["finish", 3, "Home, twice", "Amira feels she now has two homes. She hopes to be a doctor who helps newcomers, and who changes how people see refugees."]
  ],
  ending: { headline: "An invented story, built from real experiences", real: "Amira is not a real person. Her story combines experiences that many refugees describe: loss, a dangerous journey, language barriers, unrecognised qualifications and being steered to lower school tracks, and also teachers, friends and volunteers who made a difference.", reflect: ["Which of her barriers were about her, and which were about rules?", "What small acts helped Amira most?", "How could a school or town welcome a newcomer better?"] },
  sources: ["UNHCR: refugee education and integration reports (unhcr.org)", "OECD: “Education in Germany: students with migrant backgrounds”", "Accounts collected by refugee-support organisations"]
});

GOL.add({
  id: "jonas", fictional: true, name: "Jonas", years: "fictional, aged 58", focus: "Age discrimination", emoji: "💼", color: "#0d9488",
  illus: { style: "grey", skin: "#e6b890", glasses: true, shirt: "#0d9488", bg: "#ccfbf1", beard: "#cfd4da", label: "Illustration of Jonas" },
  tagline: "A fictional 58-year-old who loses his job and finds out how employers see age.",
  intro: "Jonas is an invented character. He has worked in the same company for 28 years. Then his job disappears, and he realises that experience does not always count.",
  stages: ["A long career", "Looking for work", "Starting again"],
  tiles: [
    ["start", 0, "Monday morning", "Jonas, 58, is a logistics manager with 28 years of experience. He’s well liked and reliable. Then his company is taken over."],
    ["barrier", 0, "Redundancy", "Jonas is told his position is being cut. The company says it is “restructuring.” Younger, cheaper staff stay.", { need: 2, label: "Losing a job after 28 years", ill: true }],
    ["info", 1, "The first search", "Jonas sends out dozens of applications. Many companies don’t reply. At interviews, he’s asked how he feels about reporting to someone younger. He is told he may be “overqualified.”"],
    ["barrier", 1, "“Overqualified”", "Employers worry that older workers cost more, aren’t flexible or will leave soon. Jonas has the skills, but the hidden stereotypes about age work against him.", { need: 3, label: "Getting past stereotypes", ill: true }],
    ["barrier", 1, "Online systems", "Jonas has to complete long online forms and tests that he has never used before. Without help, he feels lost, and the digital process has no space to show his experience.", { need: 2, label: "Mastering new application tools", ill: true }],
    ["win", 1, "A former colleague", "An old colleague, Mira, passes on a tip about an opening in a smaller firm. Personal networks often matter more than the formal process.", { fx: { hope: 2, support: 2 }, ill: true }],
    ["choice", 2, "Retrain or retire early?", "Jonas can take early retirement with a smaller pension or retrain for a new field. Both are tough.", { opts: [["Retire early", { hope: -1 }, "You’d have time, but less money."], ["Retrain in a new area", { hope: 1, support: 1 }, "You sit in a class with people half your age."]], reveal: "Invented scene. In reality, many older workers face this choice, and the best path depends on health, savings and support. Programmes that help older people retrain have helped many to find new roles.", ill: true }],
    ["barrier", 2, "The classroom", "At the retraining course, Jonas is the oldest. Some classmates are friendly and some assume he won’t manage. He learns quickly and, in the end, helps the others.", { need: 2, label: "Learning among much younger people", ill: true }],
    ["win", 2, "Mentoring each other", "A young classmate, Aylin, teaches Jonas about new software, and he teaches her how to run a team. Both benefit.", { fx: { hope: 2, support: 1 }, ill: true }],
    ["win", 2, "A new job", "A company hires Jonas as an operations coordinator. His manager says that his experience is exactly what the team has been missing.", { fx: { hope: 3, support: 1 }, ill: true }],
    ["finish", 2, "Not too old", "Jonas now trains younger staff. He says: “Nobody warned me that you can be too old before you feel old.”"]
  ],
  ending: { headline: "Experience should count", real: "Jonas is invented, but age discrimination is a well-documented problem in many countries. Older workers often need longer to find a job. Mixed-age teams usually do well, since each age group brings different strengths.", reflect: ["What assumptions about age did Jonas meet?", "What helped him: networks, retraining, or a new employer?", "What would help older people in your community who want to keep working?"] },
  sources: ["OECD: Working Better with Age (oecd.org)", "Federal Anti-Discrimination Agency, Germany (antidiskriminierungsstelle.de)", "WHO: Global report on ageism (2021)"]
});

GOL.add({
  id: "lena", fictional: true, name: "Lena", years: "fictional", focus: "Disability, accessibility, work", emoji: "🛝", color: "#2563eb",
  illus: { style: "long", hair: "#7a4b25", skin: "#f0c8a0", shirt: "#2563eb", chair: true, bg: "#dbeafe", label: "Illustration of Lena" },
  tagline: "A fictional young woman who uses a wheelchair and wants an ordinary life in a small German town.",
  intro: "Lena is an invented character. She has used a wheelchair since a spinal injury as a child. She dreams of being an architect.",
  stages: ["School", "Training", "Working life"],
  tiles: [
    ["start", 0, "A small town", "Lena is 12. She loves drawing houses and bridges. She lives in a small German town where the old market square has cobblestones and many shops have steps."],
    ["barrier", 0, "Which school?", "The nearest school has no lift. A special school is an hour away by bus. Lena’s parents have to fight for months to get her a place at her local school with a ramp and support.", { need: 3, label: "Getting into the local school", ill: true }],
    ["win", 0, "Friends and a good teacher", "At her new school, her classmates quickly forget the wheelchair. A teacher, Ms Berger, makes sure that the class trips go to places Lena can reach.", { fx: { hope: 2, support: 2 }, ill: true }],
    ["barrier", 0, "Left out of the trip", "In year 9, the class plans a trip to a hostel without a lift. Lena is told she can “stay home or be carried.” Her friends refuse to go without her until the plans are changed.", { need: 2, label: "Being left out", ill: true }],
    ["barrier", 1, "Choosing a university", "Lena applies to study architecture. Some lecture halls and design studios are not accessible. Applying for support and technical help means many forms and many months of waiting.", { need: 3, label: "Navigating the bureaucracy", ill: true }],
    ["win", 1, "A flat of her own", "Lena finds a small accessible flat near the university. Finding it took 40 viewings, as many landlords say “It isn’t suitable” before she even visits.", { fx: { hope: 2, support: 1 }, ill: true }],
    ["choice", 1, "The professor’s remark", "A professor says, “Architecture is demanding. Are you sure you can do site visits?” You know the sites will often be inaccessible, and you also know that you have better ideas than most.", { opts: [["Say nothing and doubt yourself", { hope: -1 }, "You question yourself."], ["Answer with a plan", { hope: 1, support: 1 }, "You propose solutions: drones, site photos, a partner."]], reveal: "Invented scene based on common experience. Many disabled professionals find solutions, and workplaces that adapt benefit everyone. The problem is rarely the wheelchair, but the missing ramp.", ill: true }],
    ["win", 1, "Her degree", "Lena graduates with a design for an accessible community centre. Her professor says it’s the best of the year.", { fx: { hope: 3, support: 1 }, ill: true }],
    ["barrier", 2, "Job interviews", "At interviews, Lena is asked about her “limitations” and the cost of adapting the office. Several offices turn out to have no step-free entrance.", { need: 3, label: "Being seen for her skills", ill: true }],
    ["win", 2, "An inclusive employer", "A mid-sized firm hires Lena. They adapt the workspace within two weeks. They note that the changes (wider doors, a lift button at a lower height) help everyone.", { fx: { hope: 3, support: 1 }, ill: true }],
    ["win", 2, "Designing for everyone", "Lena helps design a market square with level paths. When it opens, parents with prams, older people and cyclists thank her too.", { fx: { hope: 2, support: 1 }, ill: true }],
    ["finish", 2, "Her dream", "Lena runs her own studio focusing on accessible design. She says: “I’m not stuck in a wheelchair. I’m stuck with stairs.”"]
  ],
  ending: { headline: "Barriers are built, and can be un-built", real: "Lena is invented, but her experiences are drawn from stories told by wheelchair users: a school without a lift, inaccessible trips, endless forms, and skeptical employers, and also the difference made by good teachers and inclusive workplaces.", reflect: ["Which barriers were physical and which were attitudes?", "What changes helped everyone, not just Lena?", "What could be changed in a place you know?"] },
  sources: ["UN Convention on the Rights of Persons with Disabilities (un.org/disabilities)", "Aktion Mensch: inclusion studies (aktion-mensch.de)", "Accounts and interviews with wheelchair users in public reports"]
});

GOL.add({
  id: "sam", fictional: true, name: "Sam", years: "fictional", focus: "Non-binary identity, gender stereotypes", emoji: "🌈", color: "#e11d48",
  illus: { style: "short", hair: "#8b3a62", skin: "#e8bd96", shirt: "#e11d48", bg: "#ffe4e6", label: "Illustration of Sam" },
  tagline: "A fictional young person who is neither a boy nor a girl, and wants to be called by their own name.",
  intro: "Sam is an invented character, who uses they/them pronouns. Sam is 15 and has just told close friends that they feel they are neither a boy nor a girl.",
  stages: ["School", "Family", "Growing up"],
  tiles: [
    ["start", 0, "Sam’s name", "Sam was named Samuel at birth. They have always felt that “boy” didn’t fit, and “girl” didn’t either. They’ve picked the name Sam, and the pronouns they/them."],
    ["barrier", 0, "Everyday friction", "At school, forms only have “male” or “female.” Changing rooms and sports teams are split in two. Teachers read out names from the register, including the old one.", { need: 2, label: "Not fitting the boxes", ill: true }],
    ["barrier", 0, "Whispers and jokes", "Some classmates joke, whisper or call Sam names. Sam starts to eat lunch in the library and avoids PE.", { need: 3, label: "Facing bullying", ill: true }],
    ["win", 0, "One teacher, one friend", "A teacher, Mr Okafor, quietly asks Sam what name they would like to use and always uses it. Sam’s friend Noor says, “I’ve got you.”", { fx: { hope: 2, support: 2 }, ill: true }],
    ["choice", 1, "Telling the family", "Sam is afraid of telling their parents and grandparents. What if they’re angry, or don’t understand?", { opts: [["Wait until later", { hope: 0 }, "You carry the secret a bit longer."], ["Tell their parents now", { hope: 1, support: 1 }, "You choose a quiet moment and write a letter."]], reveal: "Invented scene. Research shows that family acceptance is among the strongest factors for the wellbeing of LGBTQ+ young people. But telling is a personal choice, and nobody should be forced to do it. Sam’s parents are shocked at first, and then ask questions.", ill: true }],
    ["barrier", 1, "A grandfather’s doubts", "Sam’s grandfather says, “It’s a phase.” Sam feels hurt, but their mother shows she stands behind them and keeps using their name.", { need: 2, label: "Facing doubt at home", ill: true }],
    ["win", 1, "A youth group", "Sam joins a local youth group for queer young people. For the first time they’re surrounded by others who understand. They laugh more.", { fx: { hope: 3, support: 1 }, ill: true }],
    ["barrier", 2, "Paperwork and the world", "At 18 Sam wants their documents to match who they are. In Germany, the options for people who don’t identify as male or female have grown since 2018 (“divers” option), but the process is still difficult for many and not all forms are updated.", { need: 3, label: "Getting documents recognised", ill: true }],
    ["win", 2, "A workplace that listens", "In an apprenticeship, Sam’s boss asks which pronouns to use, puts them on the staff list and trains the team. Sam says: “It sounds small, but it changed everything.”", { fx: { hope: 2, support: 1 }, ill: true }],
    ["win", 2, "Speaking up", "Sam is asked to talk at their old school about being non-binary. The room is quiet at first, and then a young student asks, “How can I support my friend?”", { fx: { hope: 3, support: 1 }, ill: true }],
    ["finish", 2, "Just Sam", "Sam is not defined by one identity. They like music, bike repair and baking. “I want people to see me, not the box.”"]
  ],
  ending: { headline: "Respect costs nothing", real: "Sam is invented, but the situations are well documented: forms without options, jokes, doubts at home and the huge difference a supportive teacher, friend or employer can make. Using someone’s name and pronouns is a simple sign of respect.", reflect: ["What small changes by people around Sam made the biggest difference?", "How do you treat a person whose name or pronouns you’re not used to?", "What “boxes” in your school or workplace could be made more flexible?"] },
  sources: ["Federal Constitutional Court of Germany, 2017 ruling on a third gender option", "Trevor Project research on family acceptance (thetrevorproject.org)", "Bundesverband Trans* (bundesverband-trans.de)"]
});
