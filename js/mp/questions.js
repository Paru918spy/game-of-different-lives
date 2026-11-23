/* Question bank for the multiplayer mode. Facts follow the character data in js/characters/*.js.
   Formats
     who   : { p, c:[clue, clue] }                  -> "Who am I?" (3 names are generated)
     fact  : { p, q, a:[right, wrong, wrong], x }   -> multiple choice (first answer is right, order is shuffled)
     tf    : { p, s, v, x }                          -> true / false statement
     words : { q, a:[right, wrong, wrong], x }      -> inclusive language
     task  : { icon, t, d }                          -> a small task the group confirms
   p = id of a real character. x = short explanation shown after the answer. */
(function (root) {
  const MP = root.MP = root.MP || {};

  const who = [
    { p: "hawking", c: ["I was told at 21 that I had about two years to live. I kept researching black holes for 55 more years.", "I could no longer speak, so a computer voice spoke for me. I wrote “A Brief History of Time”."] },
    { p: "parks", c: ["In 1955 I refused to give up my bus seat in Montgomery, Alabama. A boycott followed.", "I was the secretary of the local NAACP and people call me “the mother of the civil rights movement”."] },
    { p: "wonder", c: ["I have been blind since I was a baby. At 13 I had a number one hit with “Fingertips”.", "I sing, play piano and harmonica and wrote a song to make a birthday a national holiday."] },
    { p: "king", c: ["I gave the “I Have a Dream” speech in Washington in 1963 and believed in nonviolent protest.", "I led the Montgomery Bus Boycott and won the Nobel Peace Prize at 35."] },
    { p: "kaepernick", c: ["I was a famous quarterback. I knelt during the anthem to protest racism, and then no team signed me.", "I was adopted as a baby and started the Know Your Rights Camp for young people."] },
    { p: "curie", c: ["I was the first woman to win a Nobel Prize, and I won two, in two different sciences.", "Women were not allowed at university in Warsaw, so I studied in secret and later discovered polonium and radium."] },
    { p: "heumann", c: ["A school said my wheelchair was a “fire hazard”. Later I fought for laws that protect disabled people.", "I got polio as a baby and became the first wheelchair user to teach in New York City schools."] },
    { p: "keller", c: ["I am deaf and blind. My teacher Anne Sullivan spelled words into my hand at a water pump.", "I was the first deaf-blind person in the US to earn a university degree."] },
    { p: "grandin", c: ["I am autistic and did not speak until I was almost four. I think in pictures.", "I designed calmer ways to handle cattle, and I built a “hug machine” for myself."] },
    { p: "kahlo", c: ["After a bus accident I painted from my bed, mostly self-portraits. I lived in a blue house in Mexico.", "I had polio as a child, many operations, and painted my own pain and pride."] },
    { p: "malala", c: ["I was shot on my school bus for wanting girls to go to school. I survived and kept speaking.", "At 17 I became the youngest person to win the Nobel Peace Prize."] },
    { p: "cox", c: ["I played Sophia in “Orange Is the New Black” and was the first openly transgender person on the cover of Time.", "I am a dancer and actor from Alabama and I speak up for transgender people."] },
    { p: "johnson", c: ["My middle initial P. stands for “Pay it no mind”. I helped start a shelter for homeless queer youth.", "I co-founded STAR House with my friend Sylvia Rivera and I was loved in Greenwich Village."] },
    { p: "singh", c: ["I could not walk until I was about five, and I ran my first marathon at 89.", "I carried the Olympic torch in London when I was around 100 years old."] },
    { p: "mandela", c: ["I spent 27 years in prison for fighting apartheid, then became president of South Africa.", "I won the Nobel Peace Prize in 1993 together with F. W. de Klerk."] },
    { p: "beethoven", c: ["I became deaf but kept writing symphonies. At the premiere of my Ninth I did not hear the applause.", "I was born in Bonn, moved to Vienna, and my music starts with four famous notes."] },
    { p: "turing", c: ["I helped break the Enigma code in World War II. Later I was punished because I loved men.", "I came up with the “Turing machine” and asked: Can machines think?"] }
  ];

  const fact = [
    { p: "hawking", q: "Which illness was Stephen Hawking diagnosed with at 21?", a: ["Motor neurone disease (ALS)", "Polio", "Chickenpox"], x: "Doctors expected he would live only about two years. He lived 55 more." },
    { p: "hawking", q: "How did Stephen Hawking “speak” in his later life?", a: ["With a computer that spoke for him", "He learned to whistle words", "He never spoke again and never gave talks"], x: "A speech synthesizer, controlled first by a hand clicker and later by a sensor on his cheek, gave him his famous voice." },
    { p: "hawking", q: "What did doctors expect after his diagnosis?", a: ["That he would live about two more years", "That he would be fine in a week", "That he should become a doctor"], x: "He proved them wrong and lived until he was 76." },
    { p: "parks", q: "What did Rosa Parks do on 1 December 1955?", a: ["She refused to give up her bus seat", "She won a marathon", "She flew a plane"], x: "She was arrested, and the Montgomery Bus Boycott began." },
    { p: "parks", q: "How long did the Montgomery Bus Boycott last?", a: ["381 days", "3 days", "A single weekend"], x: "About 40,000 riders walked, carpooled or took taxis for 381 days, until bus segregation ended." },
    { p: "parks", q: "What was Rosa Parks’s job at the NAACP?", a: ["Secretary", "Pilot", "Football coach"], x: "She typed, filed and recorded cases of injustice, as the only woman in the room." },
    { p: "wonder", q: "How old was Stevie Wonder when “Fingertips” reached number one?", a: ["13", "30", "6"], x: "It was recorded live and was the first live album to top the US chart." },
    { p: "wonder", q: "What did Stevie Wonder fight for when he turned 21?", a: ["Control over his own music", "A longer holiday", "A bigger house"], x: "Adults had chosen his songs for him. At 21 he negotiated artistic control." },
    { p: "wonder", q: "For which holiday did Stevie Wonder write a song and campaign?", a: ["Martin Luther King Jr. Day", "Halloween", "New Year"], x: "He wanted Dr King’s birthday to become a national holiday. Since 1986 it is one." },
    { p: "king", q: "What kind of protest did Martin Luther King Jr. believe in?", a: ["Nonviolent protest", "Violent fights", "Staying silent"], x: "He learned a lot from Gandhi’s peaceful resistance." },
    { p: "king", q: "Where did Dr King give the “I Have a Dream” speech?", a: ["At the Lincoln Memorial in Washington", "At a football stadium", "On a ship"], x: "About 250,000 people came on 28 August 1963." },
    { p: "king", q: "What happened to 14-year-old Martin on the bus ride home?", a: ["He had to give up his seat and stand about 90 miles", "He won a free ticket", "The bus was cancelled"], x: "He later called it the angriest night of his life." },
    { p: "kaepernick", q: "How did Colin Kaepernick protest against racism?", a: ["He knelt during the national anthem", "He stopped playing sport at once", "He wrote a song"], x: "Many people booed him. Others, including players and veterans, supported him." },
    { p: "kaepernick", q: "How old was Colin when he was adopted?", a: ["Five weeks", "Ten years", "Sixteen"], x: "He was adopted by Rick and Teresa Kaepernick and grew up in California." },
    { p: "kaepernick", q: "What did Colin start to teach young people about?", a: ["Their legal rights", "Cooking", "Gardening"], x: "The Know Your Rights Camp teaches legal rights, money skills and how to act in police stops." },
    { p: "curie", q: "Why did Maria study at a secret “Flying University”?", a: ["Women were not allowed at the University of Warsaw", "The university was too far away", "She wanted to travel"], x: "Women were shut out, so she and her sister studied in secret." },
    { p: "curie", q: "What did Marie Curie win?", a: ["Two Nobel Prizes", "An Olympic medal", "A chess title"], x: "She is still the only person to win Nobel Prizes in two different sciences." },
    { p: "curie", q: "Which element did Marie name after her home country Poland?", a: ["Polonium", "Gold", "Helium"], x: "Poland was ruled by Russia then, and its language was suppressed. Naming it was a quiet protest." },
    { p: "heumann", q: "Which illness left Judy Heumann using a wheelchair?", a: ["Polio", "Measles", "A broken leg"], x: "She got polio at 18 months old." },
    { p: "heumann", q: "Why did a school refuse Judy Heumann in 1953?", a: ["Her wheelchair was called a “fire hazard”", "She was too young", "She was too loud"], x: "Her mother Ilse fought for her. Judy later sued the city to be allowed to teach." },
    { p: "heumann", q: "What did Judy Heumann help win in 1977?", a: ["Rules against discrimination of disabled people", "A free bicycle for everyone", "A new holiday"], x: "Section 504 became the first US civil rights law protecting disabled people." },
    { p: "keller", q: "Which two senses was Helen Keller missing?", a: ["Seeing and hearing", "Smelling and tasting", "Walking and swimming"], x: "An illness at 19 months left her deaf and blind." },
    { p: "keller", q: "Who taught Helen Keller to communicate?", a: ["Anne Sullivan", "Marie Curie", "Rosa Parks"], x: "Anne arrived in 1887 and stayed at Helen’s side for almost 50 years." },
    { p: "keller", q: "How did Anne Sullivan teach Helen words?", a: ["By spelling them into her hand", "By singing songs", "By writing on a blackboard"], x: "At a water pump Helen suddenly understood that everything has a name." },
    { p: "grandin", q: "At what age did Temple Grandin start to speak?", a: ["Almost four", "Two months", "Twelve"], x: "Speech therapy and her mother’s support helped her." },
    { p: "grandin", q: "What did Temple build at 18 to calm her body?", a: ["A “hug machine” that presses firmly", "A tree house", "A rocket"], x: "It was inspired by cattle calmly standing in a squeeze chute." },
    { p: "grandin", q: "With which animals does Temple Grandin work?", a: ["Cattle", "Dolphins", "Bees"], x: "She designed calmer, kinder ways to handle them." },
    { p: "kahlo", q: "What did Frida Kahlo paint most often?", a: ["Herself", "Football players", "Spaceships"], x: "“I paint myself because I am so often alone,” she said." },
    { p: "kahlo", q: "Which illness did Frida have at six years old?", a: ["Polio", "Flu", "Hay fever"], x: "It left her right leg thin, and other children teased her." },
    { p: "kahlo", q: "How did Frida paint during months of bed rest?", a: ["Her mother had a special easel and mirror made", "She did not paint at all", "She painted on the ceiling with a helper"], x: "She could paint her self-portraits right from her bed." },
    { p: "malala", q: "What does Malala Yousafzai fight for?", a: ["That girls can go to school", "Cheaper sneakers", "Longer holidays"], x: "The Malala Fund supports girls’ education." },
    { p: "malala", q: "Which prize did Malala win at 17?", a: ["The Nobel Peace Prize", "An Oscar", "A chess cup"], x: "She is the youngest person ever to receive it." },
    { p: "malala", q: "In which country was Malala born?", a: ["Pakistan", "Brazil", "Norway"], x: "She grew up in the Swat Valley." },
    { p: "cox", q: "Which series made Laverne Cox world famous?", a: ["Orange Is the New Black", "Game of Thrones", "Sesame Street"], x: "She played Sophia Burset, a transgender woman played by a transgender actor." },
    { p: "cox", q: "On the cover of which magazine was Laverne Cox the first openly transgender person?", a: ["Time", "A cooking magazine", "A car magazine"], x: "The 2014 issue was called “The Transgender Tipping Point”." },
    { p: "johnson", q: "What did STAR House offer?", a: ["A home for homeless trans and queer youth", "Free football lessons", "A pizza restaurant"], x: "Marsha and Sylvia Rivera paid for it with money they earned themselves." },
    { p: "johnson", q: "What did the “P.” in Marsha P. Johnson stand for?", a: ["“Pay it no mind”", "“Peaceful”", "“Paris”"], x: "It was her answer to nosy questions about her gender." },
    { p: "singh", q: "How old was Fauja Singh at his first marathon?", a: ["About 89", "About 19", "About 49"], x: "He ran the London Marathon in 2000." },
    { p: "singh", q: "Why did Fauja Singh start running?", a: ["To cope with grief after his wife and son died", "To win money", "Because his doctor ordered it"], x: "Running helped him heal. He said age is only a number." },
    { p: "mandela", q: "How many years did Nelson Mandela spend in prison?", a: ["27", "2", "100"], x: "He walked free on 11 February 1990." },
    { p: "mandela", q: "Which system of racist laws did Mandela fight against?", a: ["Apartheid", "Democracy", "Tourism"], x: "Under apartheid, people in South Africa were separated by race." },
    { p: "mandela", q: "What did Mandela become in 1994?", a: ["President of South Africa", "A famous chef", "A pilot"], x: "People of all races could vote for the first time." },
    { p: "beethoven", q: "What happened to Beethoven’s hearing?", a: ["It slowly got worse until he was deaf", "It got better every year", "He never had trouble hearing"], x: "It began with ringing in his ears at about 27. Still, he kept composing." },
    { p: "beethoven", q: "Which symphony did Beethoven present in 1824, without hearing the applause?", a: ["The Ninth", "The Zeroth", "The Hundredth"], x: "A singer turned him around so that he could see the cheering audience." },
    { p: "turing", q: "Which secret code did Alan Turing help to break in the Second World War?", a: ["The German Enigma code", "A pirate map", "A bank PIN"], x: "His work at Bletchley Park probably shortened the war by about two years." },
    { p: "turing", q: "Why was Alan Turing arrested in 1952?", a: ["Because he loved a man, which was a crime back then", "Because he was too fast on the road", "Because he lost a book"], x: "Today we know that this law was deeply unjust. In 2013 he received a royal pardon." }
  ];

  const tf = [
    { p: "hawking", s: "Stephen Hawking lived about 55 years after doctors expected him to die within two years.", v: true, x: "He died in 2018 at 76." },
    { p: "hawking", s: "Because he could not speak, Stephen Hawking never wrote a book.", v: false, x: "“A Brief History of Time” sold more than 25 million copies." },
    { p: "hawking", s: "Colleagues, students and carers helped Hawking to do his work.", v: true, x: "Behind every “lone genius” stands a lot of people." },
    { p: "parks", s: "Rosa Parks worked as the secretary of her local NAACP chapter.", v: true, x: "She was active in the movement for 12 years before the bus." },
    { p: "parks", s: "The Montgomery Bus Boycott lasted only one weekend.", v: false, x: "It lasted 381 days." },
    { p: "parks", s: "Rosa Parks was arrested after she refused to give up her seat.", v: true, x: "She was fined $14 and lost her job soon after." },
    { p: "wonder", s: "Stevie Wonder lost his sight because he got too much oxygen in an incubator as a premature baby.", v: true, x: "The condition is called retinopathy of prematurity." },
    { p: "wonder", s: "Being blind stopped Stevie Wonder from playing instruments.", v: false, x: "He taught himself harmonica, piano and drums as a child." },
    { p: "king", s: "Martin Luther King Jr. studied the nonviolent resistance of Gandhi.", v: true, x: "It shaped his entire movement." },
    { p: "king", s: "Martin Luther King Jr. won the Nobel Peace Prize.", v: true, x: "He was 35, one of the youngest winners at the time." },
    { p: "king", s: "Dr King wanted to answer violence with violence.", v: false, x: "When his house was bombed, he told the angry crowd not to answer violence with violence." },
    { p: "kaepernick", s: "Colin Kaepernick was adopted when he was a baby.", v: true, x: "He grew up with his adoptive family in California." },
    { p: "kaepernick", s: "After his protest, many NFL teams were eager to sign him.", v: false, x: "In 2017 no team signed him, and he has not played in the NFL since." },
    { p: "kaepernick", s: "Colin Kaepernick founded the Know Your Rights Camp.", v: true, x: "It teaches young people about their rights." },
    { p: "curie", s: "Marie Curie came up with the word “radioactivity”.", v: true, x: "She and her husband also discovered polonium and radium." },
    { p: "curie", s: "Marie and Pierre Curie patented radium to become rich.", v: false, x: "They chose not to patent it so that science could use it freely." },
    { p: "curie", s: "Marie Curie was the first woman to become a professor at the Sorbonne.", v: true, x: "She took over Pierre’s teaching job after his death." },
    { p: "heumann", s: "Judy Heumann became the first wheelchair user to teach in New York City schools.", v: true, x: "She had to take the city to court to get her licence." },
    { p: "heumann", s: "In 1953 her school welcomed her with open arms.", v: false, x: "The school said her wheelchair was a “fire hazard”." },
    { p: "heumann", s: "At Camp Jened Judy saw for the first time a place where disability was normal.", v: true, x: "The camp was later shown in the film “Crip Camp”." },
    { p: "keller", s: "Helen Keller graduated from college with honours.", v: true, x: "In 1904 she finished Radcliffe College, the first deaf-blind person in the US with a degree." },
    { p: "keller", s: "Helen Keller only learned to communicate when she was 20.", v: false, x: "The breakthrough at the water pump happened when she was almost seven." },
    { p: "keller", s: "Helen Keller supported women’s right to vote.", v: true, x: "Some critics said her views were not her own because of her disability." },
    { p: "grandin", s: "Temple Grandin’s mother refused to send her to an institution.", v: true, x: "She found speech therapy for her instead." },
    { p: "grandin", s: "All autistic people think in exactly the same way.", v: false, x: "Temple says she thinks in pictures, but autistic people think in many different ways." },
    { p: "grandin", s: "Temple Grandin has a PhD.", v: true, x: "She earned it in 1989 and works with animal behaviour." },
    { p: "kahlo", s: "Frida Kahlo had more than thirty operations in her life.", v: true, x: "She suffered pain after a bus accident at 18." },
    { p: "kahlo", s: "Pain stopped Frida Kahlo from painting.", v: false, x: "She painted in bed and kept painting after her leg was amputated." },
    { p: "kahlo", s: "Frida often wore traditional Mexican dresses and showed Mexican folk art in her paintings.", v: true, x: "She was proud of her Mexican identity." },
    { p: "malala", s: "As a girl, Malala wrote a secret blog under a false name.", v: true, x: "She used the name “Gul Makai” for BBC Urdu." },
    { p: "malala", s: "Malala is the oldest person ever to win the Nobel Peace Prize.", v: false, x: "She is the youngest." },
    { p: "malala", s: "Malala and her father started the Malala Fund for girls’ education.", v: true, x: "Millions of girls worldwide still cannot go to school." },
    { p: "cox", s: "Laverne Cox studied dance.", v: true, x: "She went to the Alabama School of Fine Arts and later graduated in dance in New York." },
    { p: "cox", s: "Laverne Cox was the first openly transgender person nominated for an acting Emmy.", v: true, x: "It happened in 2014." },
    { p: "cox", s: "Fame ended all prejudice against Laverne Cox.", v: false, x: "Even as a star she faces misgendering and threats." },
    { p: "johnson", s: "Marsha P. Johnson and Sylvia Rivera founded STAR House together.", v: true, x: "It was a shelter for homeless young trans people and queer youth." },
    { p: "johnson", s: "Neighbours remember Marsha as generous, giving food and money to others.", v: true, x: "She had a gift for making people feel seen." },
    { p: "singh", s: "Fauja Singh could not walk until he was about five years old.", v: true, x: "His legs were very weak as a little boy." },
    { p: "singh", s: "Fauja Singh ran his first marathon when he was 20.", v: false, x: "He was 89." },
    { p: "singh", s: "Fauja Singh carried the Olympic torch in London in 2012.", v: true, x: "He was about 100 years old." },
    { p: "mandela", s: "Nelson Mandela was released from prison in 1990.", v: true, x: "He walked free on 11 February 1990." },
    { p: "mandela", s: "Nelson Mandela never went to prison.", v: false, x: "He spent 27 years in prison, 18 of them on Robben Island." },
    { p: "mandela", s: "In 1994 South Africans of all races could vote in a national election for the first time.", v: true, x: "Mandela became president." },
    { p: "beethoven", s: "Beethoven kept composing after he lost his hearing.", v: true, x: "He wrote his Ninth Symphony when he was almost completely deaf." },
    { p: "beethoven", s: "Beethoven was born deaf.", v: false, x: "His hearing started to fade at about 27." },
    { p: "turing", s: "Alan Turing worked on breaking the Enigma code at Bletchley Park.", v: true, x: "His team protected convoys and saved many lives." },
    { p: "turing", s: "Turing’s war work was famous right after the war.", v: false, x: "It stayed secret for decades." },
    { p: "turing", s: "Alan Turing received a royal pardon in 2013.", v: true, x: "The law he was punished under is long gone." }
  ];

  const words = [
    { q: "What is the respectful way to talk about a person who uses a wheelchair?", a: ["“A wheelchair user”", "“Confined to a wheelchair”", "“A poor cripple”"], x: "A wheelchair is not a prison. It gives people freedom to move." },
    { q: "What does “inclusion” mean?", a: ["Everyone belongs and can take part", "Only some people may join", "Keeping groups apart"], x: "Inclusion is about making room for everyone." },
    { q: "What does “discrimination” mean?", a: ["Treating people unfairly because of a group they belong to", "Treating everyone fairly", "Helping a friend"], x: "For example because of skin colour, disability, age, gender or religion." },
    { q: "What is a stereotype?", a: ["A fixed idea about a whole group that is not true for everyone", "A kind of music", "A proven fact"], x: "People are individuals. “All girls…” or “all old people…” is never true." },
    { q: "What does “accessible” mean?", a: ["Everyone can use it, for example with ramps or lifts", "It costs a lot of money", "Only experts can use it"], x: "Ramps also help prams, bikes and people with heavy bags." },
    { q: "A friend is hard of hearing. What helps in a conversation?", a: ["Face them, speak clearly and do not cover your mouth", "Turn away and shout", "Ignore them"], x: "Many people use lip-reading to follow speech." },
    { q: "You meet a blind person who seems to be lost. What do you do?", a: ["Ask: “Would you like some help?” and wait for the answer", "Grab their arm and pull", "Walk away"], x: "Ask first. People know best what they need." },
    { q: "A person tells you which name and pronouns they use. What do you do?", a: ["Use the name and pronouns they told you", "Argue about it", "Use a different name"], x: "Respect shows in small things, like using someone’s real name." },
    { q: "What does “neurodiversity” mean?", a: ["People’s brains work in many different ways, and that is okay", "Everyone thinks the same way", "A kind of medicine"], x: "Autism, dyslexia and ADHD are examples of different ways of thinking." },
    { q: "Someone takes a long time to speak or uses a speech device. What do you say?", a: ["“Take your time, I’m listening.”", "“Hurry up!”", "Finish their sentences without asking"], x: "Patience is a bridge. Hawking’s speech device was slow, but worth waiting for." },
    { q: "What does “equal opportunities” mean?", a: ["Everyone gets fair chances, with support where it is needed", "Nobody gets any help", "Only the fastest win"], x: "A ramp does not give a wheelchair user an advantage. It removes a barrier." },
    { q: "A classmate makes fun of another child’s accent. What is a good thing to do?", a: ["Say that it is not okay and include the child", "Laugh along", "Pretend nothing happened"], x: "Allies speak up, even when it is hard." }
  ];

  const tasks = [
    { icon: "👀", t: "Eyes closed", d: "Close your eyes for 10 seconds and name three sounds you hear. Then tell the group one thing that would be harder if you could not see." },
    { icon: "🤟", t: "Spell it", d: "Spell your first name letter by letter, tapping each letter into a friend’s hand. This is how Helen Keller first learned words." },
    { icon: "🤫", t: "Lip reading", d: "Say a short word without a sound. The group has to guess it from your lips. Notice how hard that is." },
    { icon: "🙌", t: "No words", d: "Without speaking, tell the group “Good morning” using only gestures and your face. They have to guess." },
    { icon: "💬", t: "Be an ally", d: "Tell the group what you would do if you saw someone being teased for their skin colour, accent or disability." },
    { icon: "🏫", t: "Spot a barrier", d: "Look around you. Name one thing in this room or at school that would be hard for a person in a wheelchair. How could it be fixed?" },
    { icon: "🌟", t: "A kind word", d: "Give a real compliment to the player on your left. Say what you like about them." },
    { icon: "🎙️", t: "Malala’s sentence", d: "In one sentence, say why every child should be able to go to school." },
    { icon: "🏃", t: "Fauja’s warm-up", d: "Move for 10 seconds in a way that suits you: jog on the spot, swing your arms or clap a rhythm. Fauja Singh began running at 89." },
    { icon: "🎨", t: "Quick portrait", d: "Draw a self-portrait on paper (or in the air) in 20 seconds. Frida Kahlo painted herself a lot." },
    { icon: "🧠", t: "Name them", d: "Name two people from this game and one barrier each of them faced." },
    { icon: "🌈", t: "A dream", d: "Tell the group one dream you have for a fairer world, like Dr King’s." },
    { icon: "🎵", t: "Hum it", d: "Hum the four famous notes of Beethoven’s Fifth (da-da-da-DAAA). Beethoven wrote it while losing his hearing." },
    { icon: "🤝", t: "Respectful words", d: "Say one respectful sentence you could use to start a conversation with someone who is different from you." }
  ];

  MP.Questions = { who, fact, tf, words, tasks };
  if (typeof module !== "undefined") module.exports = MP.Questions;
})(typeof window !== "undefined" ? window : global);
