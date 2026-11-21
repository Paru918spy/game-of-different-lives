/* Judy Heumann, Helen Keller, Temple Grandin, Frida Kahlo, Malala Yousafzai. */
GOL.add({
  id: "heumann", name: "Judy Heumann", years: "1947 – 2023", focus: "Disability rights, wheelchair user", emoji: "♿", color: "#be185d",
  tagline: "Told she was a “fire hazard” at five, she helped write the laws that protect disabled people.",
  intro: "You are Judy, a Brooklyn girl who had polio as a baby and uses a wheelchair. Your parents will not accept that you have no place in school. You’ll teach a whole country the same lesson.",
  stages: ["Childhood", "Young adult", "The sit-in", "Lawmaker and advocate"],
  tiles: [
    ["start", 0, "Philadelphia, 1947", "Judy is born on 18 December 1947 to German-Jewish immigrant parents who had escaped the Nazis. At 18 months she gets polio and loses the use of her legs. She grows up in Brooklyn, New York."],
    ["barrier", 0, "“A fire hazard”", "In 1953 the local school will not let Judy attend kindergarten because her wheelchair is called a “fire hazard.” Her mother Ilse fights for her. For years Judy only gets a teacher at home for a few hours a week, and she is shut out from classmates.", { need: 3, label: "Fighting for the right to go to school" }],
    ["win", 0, "Camp Jened", "At a summer camp for disabled teenagers in the Catskills, Judy for the first time sees a place where disability is normal. It was later shown in the film Crip Camp, and it sparks friendships and activism.", { fx: { hope: 2, support: 1 } }],
    ["win", 1, "College", "Judy studies at Long Island University and earns her degree in speech and drama. Among her tasks is dealing with inaccessible buildings and having to ask others for help.", { fx: { hope: 1, support: 1 } }],
    ["barrier", 1, "Not allowed to teach", "In 1970 New York City refuses Judy a teaching licence because she cannot walk, saying she is a “fire hazard” again. She takes the city to court, and the news makes her a symbol. She wins and becomes the first wheelchair user to teach in New York City schools.", { need: 3, label: "Getting a fair chance to teach" }],
    ["win", 1, "Disabled in Action", "In 1970 Judy co-founds Disabled in Action. Later she moves to Berkeley, California, a centre of the independent living movement, where disabled people take control of their own lives and services.", { fx: { hope: 2, support: 1 } }],
    ["barrier", 2, "A law that wasn’t enforced", "Section 504 of the Rehabilitation Act (1973) says that programmes funded by the government cannot discriminate against disabled people. But the government delays writing the rules that would make it real.", { need: 2, label: "Waiting for rights to be put into practice" }],
    ["choice", 2, "April 1977", "Disabled activists organise protests across the US. In San Francisco, people decide to occupy a federal building until the rules are signed. It could take days or weeks, and there are no ramps, medicines or beds.", { opts: [["Go home and wait for the government", { hope: -1 }, "You wait for the law to be put into practice."], ["Join the sit-in", { hope: 1, support: 2 }, "You and about 150 others stay."]], reveal: "What Judy did: she led the sit-in. It lasted 26 days, the longest occupation of a federal building in US history at the time. Groups like the Black Panthers brought hot meals, and Judy and others travelled to Washington. The regulations were signed." }],
    ["win", 2, "Victory for 504", "Section 504 becomes the first civil rights law protecting disabled people in the US, and the foundation for later laws like the Americans with Disabilities Act (1990).", { fx: { hope: 3, support: 1 } }],
    ["win", 3, "Inside government", "In 1993 Judy is appointed Assistant Secretary in the US Department of Education, responsible for special education and rehabilitation. Later she works as an adviser to the World Bank and the US State Department on disability rights worldwide.", { fx: { hope: 2 } }],
    ["barrier", 3, "Still not fully accessible", "Even as a senior official, Judy keeps meeting inaccessible buildings, planes and meeting rooms. She says that barriers are not caused by a person’s body, but by society’s choices.", { need: 2, label: "Never finished" }],
    ["win", 3, "Telling the story", "Her memoir Being Heumann (2020) and the film Crip Camp (2020) bring the movement to a wide audience.", { fx: { hope: 2 } }],
    ["finish", 3, "2023", "Judy Heumann dies on 4 March 2023, aged 75. Her message: nothing about us without us."]
  ],
  ending: { headline: "Barriers are built, so they can be removed", real: "Judy Heumann’s life is not a story of overcoming a body. It is a story of a society that excluded people, and a movement of disabled people, parents and allies that forced it to change.", reflect: ["Which barriers in your school or town could be removed, and by whom?", "Why does it matter that disabled people lead the fight for their own rights?", "What does “nothing about us without us” mean?"] },
  sources: ["Judith Heumann with Kristen Joiner, Being Heumann (2020)", "Netflix documentary Crip Camp (2020)", "Disability Rights Education & Defense Fund (dredf.org)"]
});

GOL.add({
  id: "keller", name: "Helen Keller", years: "1880 – 1968", focus: "Deaf-blindness, gender, politics", emoji: "🤟", color: "#0e7490",
  tagline: "A deaf-blind woman who became an author, a campaigner, and a voice for workers and women.",
  intro: "You are Helen, a little girl in Alabama who lost sight and hearing as a toddler. The world around you is silent and dark, until a teacher arrives.",
  stages: ["Silent childhood", "Education", "Author", "Activist"],
  tiles: [
    ["start", 0, "Tuscumbia, 1880", "Helen is born on 27 June 1880 in Alabama. At 19 months she has a severe illness, and recovers, but is left deaf and blind."],
    ["barrier", 0, "No way to communicate", "For years Helen has no language. She uses a few signs, and she is frustrated, as nobody can understand her or teach her. Some relatives think she should be sent away to an institution.", { need: 3, label: "Reaching out without words" }],
    ["win", 0, "Anne Sullivan", "In March 1887 teacher Anne Sullivan arrives. Anne herself was almost blind and grew up in a poorhouse. She spells words into Helen’s hand. On 5 April, at a water pump, Helen suddenly understands that everything has a name.", { fx: { hope: 3, support: 2 } }],
    ["win", 1, "Learning fast", "Helen learns the manual alphabet, braille and, later, to speak, and studies at the Perkins School for the Blind and other schools.", { fx: { hope: 2 } }],
    ["barrier", 1, "Accused of copying", "At 11, Helen writes a story that looks similar to another author’s. She is accused of plagiarism and questioned by a panel. The experience hurts her badly. She had absorbed the story through hand-spelling years earlier without remembering.", { need: 2, label: "Facing suspicion as a child" }],
    ["win", 1, "Radcliffe College", "In 1904 Helen graduates with honours from Radcliffe College, the first deaf-blind person in the US to earn a Bachelor of Arts. Anne spells every lecture into her hand.", { fx: { hope: 3, support: 1 } }],
    ["win", 2, "The Story of My Life", "Helen writes her autobiography (1903) and many essays and books. Mark Twain becomes a friend and calls her one of the two most interesting characters of her century.", { fx: { hope: 2 } }],
    ["barrier", 2, "Seen as a “miracle”", "Newspapers praise Helen as a wonder. But when she supports socialism, workers’ rights and women’s right to vote, some critics say her views are not her own because of her disability. She answers that they were happy to praise her, until she disagreed.", { need: 3, label: "Being taken seriously as a thinker" }],
    ["choice", 3, "Safe fame or hard causes?", "You are famous and loved. You could stay as a gentle symbol, or you could speak for causes that make powerful people angry.", { opts: [["Stay a symbol", { hope: 0 }, "You remain a gentle symbol for everyone."], ["Campaign for justice", { hope: 1, support: 1 }, "You put your fame to work."]], reveal: "What Helen did: she campaigned. She joined the Socialist Party, supported women’s suffrage and workers’ unions, helped found the American Civil Liberties Union (1920), and worked for the rights of blind people and the NAACP." }],
    ["win", 3, "Around the world", "With Anne (and later Polly Thomson), Helen travels to more than 30 countries, raising funds and awareness for blind and deaf people, including soldiers blinded in war.", { fx: { hope: 2, support: 1 } }],
    ["barrier", 3, "Losing Anne", "Anne Sullivan dies in 1936, after nearly fifty years at Helen’s side. Helen grieves, and has to rebuild her life with other companions.", { need: 2, label: "Carrying on after a great loss" }],
    ["win", 3, "Honours", "Helen receives the Presidential Medal of Freedom (1964). Her work for blind and deaf people continues through organisations such as Helen Keller International.", { fx: { hope: 2 } }],
    ["finish", 3, "1968", "Helen Keller dies on 1 June 1968, aged 87."]
  ],
  ending: { headline: "More than a miracle: a mind, a teacher, and a lifetime of causes", real: "Helen Keller’s life is often told as a simple inspirational story. The full story includes a teacher who devoted her life to her, a society that gave only some access, and a woman who took strong political stands that often are left out of children’s books.", reflect: ["Why do you think her political views are often left out of the story?", "What does Anne Sullivan’s role teach us about teaching and support?", "What does it mean to call someone “inspiring” instead of respecting their opinions?"] },
  sources: ["Helen Keller, The Story of My Life (1903)", "American Foundation for the Blind: Helen Keller Archive (afb.org)", "Perkins School for the Blind (perkins.org)"]
});

GOL.add({
  id: "grandin", name: "Temple Grandin", years: "b. 1947", focus: "Autism", emoji: "🐄", color: "#15803d",
  tagline: "A woman diagnosed with autism who didn’t speak until she was almost four, and went on to redesign how animals are treated.",
  intro: "You are Temple, a child in 1950s America. You see and feel the world differently, loud noises hurt, and doctors have a theory that your brain is damaged. Your mother has other plans.",
  stages: ["Early years", "School", "A scientist", "Author & speaker"],
  tiles: [
    ["start", 0, "Boston, 1947", "Temple is born on 29 August 1947. As a toddler she doesn’t speak, is easily overwhelmed by sound and touch, and has trouble with eye contact."],
    ["barrier", 0, "“Brain damage”", "Doctors say she has brain damage, and advise her parents to put her in an institution, as was common at that time. Her mother, Eustacia Cutler, refuses and finds speech therapy for her.", { need: 3, label: "Avoiding the institution" }],
    ["win", 0, "First words", "With speech therapy and a lot of practice, Temple starts speaking at almost four years old. Her mother also teaches her manners and routines, and pushes her to try new things.", { fx: { hope: 2, support: 2 } }],
    ["barrier", 1, "Bullying", "At school, classmates tease Temple for being “weird” and for repeating herself. She feels lonely and overwhelmed by noise, crowds and unspoken social rules.", { need: 2, label: "Surviving school" }],
    ["win", 1, "A teacher who saw her talent", "Her science teacher, Mr. Carlock, notices her curiosity and gives her projects that draw on her visual way of thinking, which gives her focus and confidence.", { fx: { hope: 2, support: 1 } }],
    ["win", 1, "The squeeze machine", "On her aunt’s ranch in Arizona, Temple sees cattle calmly stay in a squeeze chute. At 18 she builds a “hug machine” that applies firm pressure to calm her own body. Scientists later study it.", { fx: { hope: 2 } }],
    ["win", 2, "College and graduate school", "Temple studies psychology (BA, 1970), animal science (MS, 1975) and later earns a PhD (1989), working with cattle handling and animal behaviour.", { fx: { hope: 2, support: 1 } }],
    ["barrier", 2, "A woman in the cattle yard", "In the 1970s, the livestock industry is full of men who don’t welcome a young woman who talks about how cows feel. She is mocked, locked out of sites and made to prove herself over and over.", { need: 3, label: "Being heard in a man’s world" }],
    ["choice", 2, "How to be heard?", "A rancher dismisses your ideas about calmer cattle chutes. You could give up, or you could try something different.", { opts: [["Walk away", { hope: -1 }, "You look for another job."], ["Show him with a design", { hope: 1 }, "You draw it, and walk through it."]], reveal: "What Temple did: she designed curved chutes and handling systems based on how animals see and move. They reduced stress, and today many cattle facilities in North America use designs influenced by her work." }],
    ["win", 3, "Writing her story", "Temple writes “Emergence: Labeled Autistic” (1986) and “Thinking in Pictures” (1995). She explains that she thinks mostly in pictures, while noting that autistic people think in many different ways.", { fx: { hope: 2 } }],
    ["win", 3, "Seen by millions", "The 2010 HBO film “Temple Grandin” shows her story. She is named in Time’s list of the 100 most influential people. She speaks widely for neurodiversity and better schooling for autistic people.", { fx: { hope: 2, support: 1 } }],
    ["finish", 3, "Different, not less", "Temple continues teaching at Colorado State University. Her message: the world needs different kinds of minds, and every person with autism is different."]
  ],
  ending: { headline: "Different minds, different strengths, and the right support", real: "Temple Grandin’s story shows how much difference early support, understanding teachers and workplaces make. She is also clear that autism is a spectrum: her story is one story, and many autistic people need very different kinds of support.", reflect: ["What helped Temple most: her mother, her teacher, or her own interests?", "What would make school easier for people who are sensitive to noise or crowds?", "Why is it a mistake to expect all autistic people to be alike?"] },
  sources: ["Temple Grandin, Thinking in Pictures (1995), Emergence: Labeled Autistic (1986)", "Temple Grandin official site (templegrandin.com)", "HBO film Temple Grandin (2010), dramatised"]
});

GOL.add({
  id: "kahlo", name: "Frida Kahlo", years: "1907 – 1954", focus: "Chronic pain, disability, gender & Mexican identity", emoji: "🎨", color: "#c026d3",
  tagline: "She turned years of pain in bed into some of the most powerful self-portraits ever painted.",
  intro: "You are Frida, a lively girl in Mexico City who wants to be a doctor. In a few years a single accident will change your whole life, and your art.",
  stages: ["Childhood & school", "The accident", "Artist", "Fame & final years"],
  tiles: [
    ["start", 0, "Coyoacán, 1907", "Frida is born on 6 July 1907 in Coyoacán, near Mexico City, to a German-born photographer father and a Mexican mother. Later she says she was born in 1910, the year of the Mexican Revolution."],
    ["barrier", 0, "Polio at six", "At six Frida gets polio, spends months in bed and is left with a thin right leg. Children tease her as “peg-leg Frida.” Her father encourages sports, swimming and boxing to make her stronger.", { need: 2, label: "Dealing with teasing" }],
    ["win", 0, "One of few girls", "Frida is one of very few girls at the elite National Preparatory School, where she studies hoping to become a doctor. She joins a group of clever, rebellious friends.", { fx: { hope: 2, support: 1 } }],
    ["barrier", 1, "17 September 1925", "At 18, the bus Frida rides collides with a streetcar. An iron handrail pierces her body. She breaks her spine, collarbone, ribs, pelvis and leg. Over her life she undergoes more than thirty operations.", { need: 3, label: "Surviving a near-fatal accident" }],
    ["win", 1, "Painting in bed", "During months of bed rest, her mother has a special easel and mirror made so Frida can paint from her bed. Her first major subject is herself: “I paint myself because I am so often alone.”", { fx: { hope: 2, support: 1 } }],
    ["win", 2, "Diego Rivera", "Frida shows her paintings to the famous muralist Diego Rivera, who encourages her. They marry in 1929. Their relationship is passionate but troubled, with both having affairs (Frida also had relationships with women), a divorce and a remarriage.", { fx: { hope: 1, support: 1 } }],
    ["win", 2, "Mexican pride", "Frida wears traditional Tehuana dresses and fills her paintings with Mexican folk art, plants and symbols. She refuses to follow European style or what “a woman painter” was supposed to be.", { fx: { hope: 2 } }],
    ["barrier", 2, "Pain, surgery and loss", "Frida suffers constant pain, wears heavy corsets, endures miscarriages and many hospital stays. Her painting “Henry Ford Hospital” (1932) shows her grief openly, subjects that were rarely painted by women.", { need: 3, label: "Making art from pain" }],
    ["choice", 2, "Be labelled or be yourself?", "A famous critic calls you a surrealist. You say: “I never painted dreams. I painted my own reality.” Will you adopt labels that sell?", { opts: [["Accept the label", { hope: 0, support: 1 }, "You get a gallery."], ["Insist on your own reality", { hope: 1 }, "You refuse to be pinned down."]], reveal: "What Frida did: she rejected the label. Even so, her art travelled: in 1938 she had her first solo show in New York, and in 1939 the Louvre bought one of her paintings, the first by a Mexican artist." }],
    ["win", 3, "Recognition", "Galleries in New York and Paris show her work. She teaches art in Mexico City and her students become known as “Los Fridos.”", { fx: { hope: 2 } }],
    ["barrier", 3, "Amputation", "In 1953, circulation problems lead to the amputation of her right leg below the knee. She falls into depression but keeps painting.", { need: 2, label: "Losing a leg and keeping on" }],
    ["win", 3, "Her only Mexican solo show", "In April 1953, Frida attends the opening of her first solo exhibition in Mexico, arriving in her four-poster bed carried by an ambulance. The night becomes legendary.", { fx: { hope: 2, support: 1 } }],
    ["finish", 3, "Casa Azul, 1954", "Frida Kahlo dies on 13 July 1954, aged 47, at her blue house in Coyoacán. Today the house is a museum, and her image is known around the world."]
  ],
  ending: { headline: "Pain, identity and art made visible", real: "Frida Kahlo is often turned into a poster. Behind the image was a woman with lifelong disability and pain, who used painting to look honestly at her body, her heritage and her feelings, at a time when women artists, disabled people and queer people were rarely allowed to.", reflect: ["How did Frida turn what was hidden into art?", "Why do you think she is more famous now than during her life?", "What stories are still missing from museums?"] },
  sources: ["Hayden Herrera, Frida: A Biography of Frida Kahlo", "Museo Frida Kahlo, Casa Azul (museofridakahlo.org.mx)", "Frida Kahlo, The Diary of Frida Kahlo"]
});

GOL.add({
  id: "malala", name: "Malala Yousafzai", years: "b. 1997", focus: "Girls’ education, gender", emoji: "📚", color: "#ea580c",
  tagline: "A girl who refused to stop going to school, and became the youngest Nobel Peace Prize winner.",
  intro: "You are Malala, a girl in Pakistan’s Swat Valley. Your father runs a school and wants you to learn. Soon armed men will say girls may not study at all.",
  stages: ["Swat Valley", "Under the Taliban", "After the attack", "A global voice"],
  tiles: [
    ["start", 0, "Mingora, 1997", "Malala is born on 12 July 1997 in Mingora, in Pakistan’s Swat Valley. Her father Ziauddin runs a school and treats his daughter as equal to any son. She loves school."],
    ["win", 0, "A girl who loved to learn", "Malala is a top student who loves to read and to speak up in class. In her community, many girls do not get the chance to study, but her family insists that she and her brothers get the same.", { fx: { hope: 2, support: 1 } }],
    ["barrier", 1, "The Taliban arrive", "From 2007 the Pakistani Taliban take over parts of Swat. They ban music and television, and attack girls’ schools. In January 2009 they announce that girls must not go to school at all.", { need: 3, label: "Losing the right to learn" }],
    ["win", 1, "A secret blog", "At 11, Malala writes a diary for BBC Urdu under a false name, “Gul Makai.” She describes life under the Taliban and how much she wants to go to school.", { fx: { hope: 2 } }],
    ["choice", 1, "Speak out or stay silent?", "Your blog and interviews are getting attention. Speaking up might be dangerous. Your family is worried about threats.", { opts: [["Keep quiet and stay safe", { hope: -1 }, "You stay at home."], ["Keep speaking for girls’ education", { hope: 1, support: 1 }, "You become better known."]], reveal: "What Malala did: she kept speaking. Her father and she gave interviews, and after the army pushed the Taliban back from Swat in 2009, she kept campaigning. In 2011 she received Pakistan’s first National Youth Peace Prize." }],
    ["barrier", 2, "9 October 2012", "On her school bus, a Taliban gunman shoots Malala in the head. She is 15. She is flown to Birmingham, UK, for treatment. She survives, after surgery and months of recovery.", { need: 3, label: "Recovering from an attack" }],
    ["win", 2, "Support from around the world", "Millions of people send messages and support. Malala continues school in England, and her family settles in Birmingham.", { fx: { hope: 2, support: 2 } }],
    ["win", 2, "UN speech, July 2013", "On her 16th birthday Malala speaks at the United Nations: “One child, one teacher, one book and one pen can change the world.” She and her father set up the Malala Fund to support girls’ education.", { fx: { hope: 3, support: 1 } }],
    ["barrier", 3, "Hate and conspiracy theories", "Online and in some places, people accuse Malala without evidence of being a Western agent or deny the attack. She is also criticised for being famous. She continues to receive threats.", { need: 2, label: "Facing lies and criticism" }],
    ["win", 3, "Nobel Peace Prize, 2014", "At 17, Malala is the youngest person ever to receive the Nobel Peace Prize, shared with Kailash Satyarthi, an Indian child-rights campaigner.", { fx: { hope: 3 } }],
    ["win", 3, "Oxford and home", "Malala graduates from Oxford University in 2020 (philosophy, politics and economics). She is able to visit Pakistan again from 2018.", { fx: { hope: 2, support: 1 } }],
    ["finish", 3, "Millions of girls", "Malala continues to campaign. Worldwide, millions of girls still cannot go to school. She says: “We realise the importance of our voices only when we are silenced.”"]
  ],
  ending: { headline: "A pen, a book, and the courage to keep going", real: "Malala’s story shows how close and how fragile a girl’s right to learn can be, and also how much support from family, teachers and strangers can help. Millions of girls around the world still need that support.", reflect: ["What part did her father play, and what did friends and strangers add?", "Why do some groups try to stop girls from learning?", "What can you do to support access to education?"] },
  sources: ["Malala Yousafzai with Christina Lamb, I Am Malala (2013)", "Nobel Prize: Malala Yousafzai (nobelprize.org)", "Malala Fund (malala.org)"]
});
