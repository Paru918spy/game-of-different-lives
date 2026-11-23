/* More stations for every life. Each entry: [insert after original space, type (i=story, w=milestone, b=barrier), stage, title, text].
   Inserted after the original script load; bridges, setbacks and event photos are re-indexed automatically. */
window.GOL = window.GOL || { characters: [] };
GOL.extras = {
  hawking: [
    [1, "i", 0, "Toy trains and fireworks", "As a boy Stephen loves board games, model aeroplanes and boats, and making fireworks with friends. He is not a star pupil at first, but he always wants to know how things work."],
    [2, "i", 1, "Rowing at Oxford", "At Oxford he finds lectures dull and joins the boat club as a coxswain. He does little work, yet still finishes with a first-class degree after a tense oral exam."],
    [3, "i", 1, "Clumsy at 21", "In Cambridge he notices he is falling over and slurring words. Doctors keep him in hospital for tests, and the news is not good."],
    [5, "w", 2, "Engaged to Jane", "He gets engaged to Jane Wilde in 1964 and marries her in 1965. Having a future to plan for gives him a reason to finish his doctorate."],
    [6, "i", 3, "Penrose and the beginning of time", "In the 1960s he works with Roger Penrose and shows that the universe may have started from a single point, a singularity. He completes his PhD in 1966."],
    [8, "i", 3, "A growing family", "Robert is born in 1967, Lucy in 1970 and Timothy in 1979. At home, family and friends help him up the stairs and at meals as his body weakens."],
    [10, "w", 3, "Fellow of the Royal Society", "In 1974, at 32, he is elected a Fellow of the Royal Society, one of the youngest ever."],
    [12, "i", 4, "Every word takes minutes", "First a hand-held clicker, later a sensor on his cheek: a single sentence can take minutes. He gives lectures by preparing every word in advance."],
    [14, "i", 4, "On television as himself", "He appears in The Simpsons and Star Trek: The Next Generation, and jokes about himself. Humour is one of his ways of being seen as a person, not a patient."],
    [16, "i", 5, "The Reith Lectures", "In 2016 he gives the BBC Reith Lectures on black holes, millions listening to a computer voice that has become famous."]
  ],
  parks: [
    [1, "i", 0, "Learning at home", "Rosa’s mother Leona is a teacher and teaches her to read before school. Rosa grows up with books, church and the strict rules of her grandparents’ home."],
    [2, "i", 1, "Sewing for a living", "Rosa works as a seamstress and later at a department store. The work is long and badly paid, especially for Black women."],
    [4, "i", 1, "A home for meetings", "Raymond is a barber and money is short, but their small home becomes a place where activists meet and plan."],
    [6, "i", 2, "Youth leader", "In the NAACP she also advises the Youth Council, encouraging teenagers to challenge segregated libraries and shops."],
    [9, "i", 3, "Learning about nonviolence", "At Highlander she meets people from many backgrounds working side by side, and she sees that change can start in small groups."],
    [12, "i", 4, "Carpools and church basements", "Black residents organise a carpool system with hundreds of cars and hold mass meetings in churches. Many walk for 381 days instead of riding the buses."],
    [14, "i", 4, "The buses integrate", "On 21 December 1956 the buses are integrated after the Supreme Court’s decision. Rosa has helped to change the law, and her family is still not safe."],
    [16, "w", 5, "A school for young people", "In 1987 she co-founds the Rosa and Raymond Parks Institute for Self Development to guide young people."],
    [17, "i", 5, "Telling her own story", "She writes her autobiography “My Story” and later “Quiet Strength”, so that her words, not only the myth of a tired woman, are remembered."]
  ],
  wonder: [
    [0, "i", 0, "Born too early", "Stevland Hardaway Judkins is born prematurely in 1950. Too much oxygen in the incubator damages his eyes, and he is blind from infancy."],
    [1, "i", 0, "School for the blind", "He attends the Michigan School for the Blind, where he learns braille and plays piano, harmonica and drums."],
    [2, "i", 0, "Church choir", "In Detroit he sings in the church choir. He teaches himself instrument after instrument, mostly by ear."],
    [3, "w", 1, "A new name", "Berry Gordy renames him “Little Stevie Wonder”. His first hit is still two years away, but he is on his way."],
    [5, "i", 1, "School between concerts", "On tour he has a tutor, because Motown insists that he finishes school. He graduates in 1968."],
    [6, "i", 2, "Synthesizers", "He is one of the first stars to use synthesizers in pop and plays most instruments on his albums himself."],
    [9, "w", 2, "Album of the Year", "He wins the Grammy for Album of the Year for Innervisions, Fulfillingness’ First Finale and Songs in the Key of Life."],
    [11, "i", 3, "Against apartheid", "In 1985 he dedicates his Oscar to Nelson Mandela. South Africa’s state broadcaster bans his music."],
    [12, "i", 3, "Messenger of Peace", "The United Nations names him a Messenger of Peace in 2009, for his work for people with disabilities and for peace."]
  ],
  king: [
    [0, "i", 0, "Ebenezer Baptist Church", "Michael King Jr. grows up in his father’s church in Atlanta. Faith and public speaking shape him from early on, and his father later changes both their names to Martin Luther."],
    [2, "i", 0, "Skipping grades", "Martin skips two grades in school and enters college at 15. He is eager, but he does not yet know what to do with his life."],
    [4, "w", 1, "Coretta", "In 1953 he marries Coretta Scott, a singer and activist who will be a partner in the movement for the rest of his life."],
    [5, "i", 1, "Pastor at 25", "In 1954 he becomes pastor of Dexter Avenue Baptist Church in Montgomery. A year later the bus boycott begins."],
    [6, "w", 2, "Leader at 26", "He is elected president of the Montgomery Improvement Association, the group that organises the boycott."],
    [8, "i", 2, "Letter from Birmingham Jail", "Writing on scraps of paper in April 1963, he answers white clergymen who called the protests “unwise and untimely”. Waiting, he says, “has almost always meant never”."],
    [9, "i", 3, "Children march in Birmingham", "In May 1963 thousands of students march. Police use dogs and fire hoses, and the pictures shock the world."],
    [10, "w", 3, "Nobel Peace Prize, 1964", "At 35 he is the youngest person ever to receive the Nobel Peace Prize, and he donates the prize money to the movement."],
    [10, "i", 3, "Selma to Montgomery", "On Bloody Sunday in March 1965 marchers are beaten on the Edmund Pettus Bridge. Two weeks later, thousands complete the march, and the Voting Rights Act follows."],
    [11, "i", 4, "Chicago, 1966", "He campaigns against housing discrimination in Chicago and finds that the hatred in the North can be as fierce as in the South."],
    [12, "i", 4, "Against the war and for the poor", "He speaks out against the Vietnam War and plans a Poor People’s Campaign. Many former friends say he should stay out of it."]
  ],
  kaepernick: [
    [0, "i", 0, "Adopted", "Colin is adopted as a baby by Rick and Teresa Kaepernick, a white couple, and grows up in Wisconsin and California."],
    [1, "i", 0, "Baseball or football?", "He is a talented pitcher and is even drafted by a professional baseball team, but he chooses football."],
    [3, "i", 1, "College records", "At the University of Nevada he sets records as a passer and runner, and gets noticed by the NFL."],
    [4, "w", 1, "Super Bowl", "In 2013 he leads the San Francisco 49ers to the Super Bowl as their quarterback."],
    [5, "i", 2, "Sitting, then kneeling", "In August 2016 he sits during the anthem. After a talk with a former soldier, Nate Boyer, he decides to kneel instead as a sign of respect for veterans."],
    [7, "i", 2, "Others follow", "Other players, teams and even high-school students kneel in solidarity. The debate reaches the president."],
    [9, "i", 3, "Know Your Rights Camp", "His camp teaches young people about their rights, how to deal with police encounters, and about money and health."],
    [11, "i", 3, "Books and stories", "He starts a publishing company and writes a graphic memoir about growing up Black and adopted in a white family."]
  ],
  curie: [
    [0, "i", 0, "Maria Skłodowska", "Maria is the youngest of five children. Her parents are teachers, and she finishes school at 15 as the best of her class."],
    [2, "i", 0, "The Flying University", "Women may not attend university in Warsaw, so Maria joins a secret “Flying University”, taught in private flats."],
    [3, "i", 0, "Governess", "For years she works as a governess to pay for her sister’s medical studies in Paris, and agrees that her turn will come next."],
    [4, "i", 1, "An attic room", "In Paris she lives in a cold attic and sometimes faints from hunger. She finishes first in physics and second in maths."],
    [5, "i", 1, "A shared passion", "She and Pierre marry in 1895 and spend their honeymoon cycling through France. Physics is their common language."],
    [6, "i", 2, "A leaky shed", "They work in an old shed that leaks in winter, stirring tonnes of ore for years to isolate a tiny amount of radium."],
    [8, "w", 3, "First woman professor", "After Pierre’s death she takes over his teaching, and in 1906 becomes the first woman professor at the Sorbonne."],
    [9, "w", 3, "A second Nobel Prize", "In 1911 she wins the Nobel Prize in Chemistry. She is the first person to win two Nobel Prizes."],
    [10, "i", 4, "Little Curies at the front", "In the First World War she equips cars with X-ray machines and drives them to the front, helping to treat wounded soldiers."]
  ],
  heumann: [
    [0, "i", 0, "Polio", "Judy gets polio as a baby in 1949 and uses a wheelchair for the rest of her life."],
    [1, "i", 0, "Home teaching", "The school refuses her, and the city sends a teacher for just a few hours a week. Her mother, a refugee from Germany, refuses to accept it."],
    [2, "i", 0, "Finally in school", "After years of her mother’s protests, Judy gets to attend a regular school. She says she never forgot what it felt like to be allowed in."],
    [3, "i", 1, "College", "She studies at Long Island University, where she and other students fight to make the campus usable."],
    [4, "w", 1, "She sues, and wins", "In 1970 she takes the New York City Board of Education to court over the denied teaching licence, and wins."],
    [5, "i", 1, "Independent living in Berkeley", "She joins the Center for Independent Living in California, where disabled people run services themselves."],
    [8, "i", 2, "Almost four weeks", "The sit-in in San Francisco lasts almost four weeks. Supporters including the Black Panthers bring food."],
    [9, "i", 3, "World Bank adviser", "She becomes the World Bank’s first adviser on disability and development, and works in many countries."],
    [11, "i", 3, "Crip Camp and memoir", "Her story reaches millions in the film Crip Camp and in her memoir, “Being Heumann”."]
  ],
  keller: [
    [0, "i", 0, "A fever at 19 months", "A serious illness leaves Helen blind and deaf. The world becomes dark and silent, and she can hardly make anyone understand her."],
    [1, "i", 0, "Home signs", "She invents about sixty signs to ask for things. Her frustration grows, and she has terrible outbursts."],
    [3, "i", 1, "Perkins School", "Helen goes to the Perkins School for the Blind, where she meets other deaf-blind people and learns braille."],
    [3, "i", 1, "Learning to speak", "At ten she learns to speak. Her voice is hard to understand, but she keeps practising for the rest of her life."],
    [5, "w", 1, "Cum laude", "In 1904 she graduates cum laude from Radcliffe, the first deaf-blind person to earn a university degree."],
    [8, "i", 3, "Socialist and suffragist", "She joins the Socialist Party and campaigns for women’s right to vote and for workers’ rights. Newspapers that praised her turn on her."],
    [8, "i", 3, "On the vaudeville stage", "In the 1920s she tours on stage to earn money, because there is almost no support for a deaf-blind woman who wants to work."],
    [9, "i", 3, "American Foundation for the Blind", "From 1924 she works for the foundation and travels the world to improve the lives of blind people."],
    [11, "w", 3, "Medal of Freedom", "In 1964 she receives the Presidential Medal of Freedom."]
  ],
  grandin: [
    [1, "i", 0, "Taking turns", "A nanny uses games that need turn-taking to teach Temple social skills, and her mother keeps her busy and challenged."],
    [3, "i", 1, "Summers on a ranch", "On her aunt’s ranch in Arizona she watches how cattle calm down in a squeeze chute, an observation that will matter later."],
    [5, "i", 1, "Thinking in pictures", "Temple thinks in pictures, not words: ideas come as images, like a search engine. She later says that this is a different way of thinking, not a lesser one."],
    [6, "w", 2, "Degrees in animal science", "She earns a master’s degree and later a doctorate in animal science."],
    [7, "i", 2, "Designing gentler handling", "She designs curved chutes and handling systems for cattle that reduce fear and stress, now used in many plants."],
    [8, "i", 2, "Auditing animal welfare", "Large companies hire her to inspect their plants and to raise standards for how animals are treated."],
    [9, "i", 3, "Professor", "She becomes a professor at Colorado State University and teaches generations of students."],
    [10, "w", 3, "A film about her life", "The film “Temple Grandin” (2010) wins several Emmy Awards and brings her story to millions."]
  ],
  kahlo: [
    [0, "i", 0, "A photographer’s daughter", "Her father Guillermo is a photographer. Frida learns from him to look closely, and to retouch photos."],
    [1, "i", 0, "Rebellious at school", "At the National Preparatory School she is one of the few girls and joins a lively group of friends. Diego Rivera paints a mural in the school."],
    [4, "i", 1, "Painting herself", "In bed she paints self-portraits with a mirror above her. “I paint myself because I am so often alone,” she says."],
    [5, "i", 2, "Travels to the United States", "She travels with Diego to San Francisco, Detroit and New York, and sees the factories and the grand museums."],
    [8, "i", 3, "Trotsky at the Blue House", "In 1937 the exiled Russian revolutionary Leon Trotsky and his wife stay in her family house for two years."],
    [9, "w", 3, "The Louvre buys a painting", "In 1939 the Louvre in Paris buys her painting “The Frame”, the first by a Mexican artist of the 20th century in the museum."],
    [10, "i", 3, "Teaching in her garden", "She teaches at an art school and, when her health fails, invites her students to her home. They are called “Los Fridos”."],
    [11, "i", 3, "A colourful diary", "She fills a diary with drawings, thoughts and jokes about her pain and her wish to live."]
  ],
  malala: [
    [0, "i", 0, "Named after a heroine", "Malala is named after Malalai of Maiwand, a legendary Afghan heroine. Her father hopes his daughter will be strong and free."],
    [1, "i", 0, "Her father’s school", "Her father Ziauddin runs a school for girls and boys. Malala grows up between blackboards and books."],
    [2, "i", 1, "Music and TV banned", "When the Taliban take over the valley, they ban music, television and girls’ education. Girls’ schools close in January 2009."],
    [3, "i", 1, "A secret name", "On the BBC she writes a diary under the name “Gul Makai”, to tell the world what life is like under the Taliban."],
    [5, "i", 2, "A hospital in Birmingham", "She is flown to a hospital in Birmingham, England, where doctors operate several times. She wakes up in a country she has never seen."],
    [6, "i", 2, "A new school", "She attends a school in England and slowly learns a new life, far from home and missing her friends."],
    [7, "w", 3, "The Malala Fund", "With her father she founds the Malala Fund, to help girls go to school around the world."],
    [9, "i", 3, "The youngest laureate", "At 17 she is the youngest person ever to receive the Nobel Peace Prize, which she shares with Kailash Satyarthi."]
  ],
  cox: [
    [0, "i", 0, "A twin brother", "Laverne has an identical twin brother. They are raised by their mother, and her love is the anchor of her childhood."],
    [2, "i", 0, "Dance and performing", "She takes dance and music classes at an arts school and discovers that the stage is where she feels free."],
    [3, "i", 1, "Becoming herself", "In her early twenties she begins her gender transition, a process that is not only private but also public, and sometimes dangerous."],
    [4, "i", 1, "Waitress and bit parts", "For years she works in bars and restaurants and takes small roles, while auditions fade after the first few words."],
    [5, "i", 2, "Cameras, but no control", "On reality TV, producers often push stories about her body instead of her talent. She learns to say what she wants her story to be."],
    [7, "w", 2, "TIME magazine cover", "In 2014 she is on the cover of TIME as the first openly transgender person, with the headline “The Transgender Tipping Point”."],
    [8, "i", 3, "Speaking for trans rights", "She speaks at universities and the United Nations and says that visibility is not the same as safety."],
    [10, "w", 3, "A film for everyone", "As executive producer of the documentary “Disclosure” (2020) she helps tell how trans people have been shown, and shamed, in film."]
  ],
  johnson: [
    [0, "i", 0, "Church and dresses", "Marsha grows up in a big family and goes to church. As a child she sometimes wears dresses, and is bullied for it."],
    [1, "i", 0, "Fifteen dollars", "She finishes school and moves to Greenwich Village in New York in 1963 with very little money and a bag of clothes."],
    [2, "i", 1, "Surviving", "To survive she does any work she can, including sex work, and often sleeps outside. The pier on Christopher Street is her second home."],
    [3, "i", 1, "A stage and a camera", "She performs in a drag troupe and is photographed by Andy Warhol. Her bright hats of fresh flowers become famous."],
    [5, "i", 2, "Gay Liberation Front", "After the Stonewall uprising she joins the Gay Liberation Front and marches for the rights of queer people."],
    [7, "i", 3, "Caring for friends", "She gives food and shelter to young people who have been thrown out, even when she has very little herself."],
    [8, "i", 3, "ACT UP", "She joins the protests of ACT UP for people with AIDS, and keeps showing up for her community."],
    [9, "w", 3, "A monument", "In 2019 New York announces a monument to Marsha P. Johnson and Sylvia Rivera, among the first dedicated to trans women."]
  ],
  singh: [
    [0, "i", 0, "A village in Punjab", "Fauja is born in a farming village in Punjab around 1911, and as a child he cannot walk until he is about five."],
    [1, "i", 0, "Legs that grew strong", "As he grows, farm work turns his thin legs into strong ones. Fauja walks and works in the fields for most of his life."],
    [3, "i", 1, "Moving to England", "After more loss he joins his son in Ilford, England, and has to learn a new country, a new language and a very different climate."],
    [4, "i", 2, "A coach who believes", "He meets a coach, Harmander Singh, who agrees to train him although many people say he is far too old."],
    [6, "i", 2, "Marathons around the world", "He runs marathons in London, New York and Toronto, and keeps his plain diet of tea, ginger curry and simple food."],
    [7, "w", 2, "A famous face", "In 2004 a sports brand makes him the star of an advert next to famous footballers. The old farmer is suddenly everywhere."],
    [8, "i", 3, "No birth certificate", "Because Indian records of his birth don’t exist, record books can’t officially confirm his age. His age is confirmed with a letter from the Queen instead."],
    [9, "i", 3, "The last race", "He retires from marathons in 2013 after a 10-kilometre race in Hong Kong, but keeps walking every day."]
  ],
  mandela: [
    [0, "i", 0, "Herding cattle", "Rolihlahla herds cattle as a small boy, plays stick-fighting games and listens to the elders tell stories of resistance."],
    [2, "i", 0, "Johannesburg", "He escapes an arranged marriage and runs to Johannesburg, where he works as a night watchman in a gold mine and later as a law clerk."],
    [3, "i", 1, "Mandela & Tambo", "In 1952 he and Oliver Tambo open the first Black law firm in Johannesburg. Clients queue every day for help."],
    [4, "i", 1, "The Youth League", "He joins the African National Congress Youth League, which pushes the older ANC to take more direct action."],
    [5, "i", 1, "The Treason Trial", "He is charged with treason in 1956, together with 155 others. The trial drags on for years before everyone is found not guilty."],
    [6, "i", 2, "Underground", "After the ANC is banned he goes underground. The press calls him the “Black Pimpernel” because he keeps escaping the police."],
    [7, "i", 2, "One visit a year", "In the early prison years he may have one visitor a year for thirty minutes and write only one letter every six months."],
    [8, "i", 2, "The limestone quarry", "He and the other prisoners hammer limestone in the glaring sun. The dust damages his eyes for life."],
    [10, "i", 3, "Rugby, 1995", "He walks onto the pitch at the Rugby World Cup final wearing the jersey of the national team, a sport once seen as white. The crowd chants his name."],
    [11, "i", 3, "Truth and Reconciliation", "The new government sets up a commission where victims and perpetrators can speak, aiming at truth, not revenge."]
  ],
  beethoven: [
    [0, "i", 0, "Pressure to be a prodigy", "His father Johann wants him to be a second Mozart and drills him hard, sometimes into the night. Ludwig’s talent is clear, but his childhood is not happy."],
    [1, "i", 0, "A court organist at 13", "By 13 he is an assistant court organist and earns money for the family."],
    [2, "i", 1, "Lessons from Haydn", "In Vienna he studies with Joseph Haydn and others, and quickly becomes known as a fiery pianist."],
    [3, "i", 1, "Improvising", "At the piano he beats other pianists in contests of improvisation. Audiences are moved, and some people weep."],
    [4, "i", 2, "Ear trumpets", "He tries ear trumpets and later uses “conversation books”, in which visitors write their questions so he can answer aloud."],
    [6, "i", 2, "The Eroica", "His third symphony, the “Eroica”, is longer and bolder than anything before it. Many listeners are confused, and many are thrilled."],
    [7, "i", 2, "Fidelio", "His only opera, about a woman who saves her husband from prison, fails at first. He rewrites it, and it becomes a success."],
    [9, "w", 3, "Standing ovation he can’t hear", "At the premiere of the Ninth Symphony a singer turns him around so that he can see the applause he cannot hear."]
  ],
  turing: [
    [0, "i", 0, "A boarding school", "At Sherborne School he is more interested in science than the school’s classics, and often misses the point of sports."],
    [3, "i", 1, "A paper on computability", "In 1936 he writes “On Computable Numbers”, which describes an imaginary machine that can run any program. It is the idea behind every computer."],
    [3, "i", 1, "Princeton", "He studies at Princeton, completes a doctorate in 1938, and returns to England as war approaches."],
    [4, "i", 2, "Hut 8", "He leads the team in Hut 8 that tackles the German navy’s Enigma code, working days and nights in secret."],
    [4, "i", 2, "The Bombe", "He helps to design the Bombe, a machine that tests thousands of Enigma settings and speeds up codebreaking."],
    [5, "w", 2, "Convoys get through", "Decoded messages help Allied ships avoid submarines in the Atlantic. His work is believed to have shortened the war."],
    [7, "i", 3, "Can machines think?", "In 1950 he proposes the “imitation game”, now called the Turing Test, to ask whether a machine can behave like a human."],
    [7, "i", 3, "A fast runner", "He is also a gifted runner and nearly makes the British Olympic team in the marathon."]
  ],
  amira: [
    [0, "i", 0, "Sunday football", "Every Sunday Amira plays football in the street with her cousins. She is the fastest, and she never lets her brother win."],
    [0, "i", 0, "Her mother’s hospital", "Her mother is a nurse and sometimes takes Amira to the hospital. She wants to be a doctor who can help like her mother does."],
    [1, "i", 0, "What fits in a bag?", "The family can take only one bag each. Amira chooses her notebook, a photo of her grandmother and a phone charger."],
    [2, "i", 1, "A crowded camp", "In a camp at the border, the family shares a tent with strangers. There is little food, but a volunteer teaches children games."],
    [3, "i", 1, "A call home", "At a charging point she gets a call from her grandmother, who says she is proud. It is the last time they speak for a long time."],
    [4, "i", 2, "A welcome class", "At school Amira joins a class for newcomers, where everyone is learning German. For the first time she feels less alone."],
    [4, "i", 2, "Strange rules", "Separate bins for rubbish and being exactly on time: everything has rules that nobody explains. Amira learns them by making mistakes."],
    [5, "w", 2, "The football club", "A neighbour takes her to a girls’ team. They don’t share a language, but they share a game."],
    [7, "i", 3, "A letter that took years", "After years of waiting, a letter arrives that the family may stay. Her mother cries for an hour and then starts reading job adverts."],
    [9, "w", 3, "Her first white coat", "Amira puts on a white coat for the first time as a medical student. She thinks of the nurse who is her mother."]
  ],
  jonas: [
    [0, "i", 0, "Thirty years at one company", "Jonas has worked at the same company for thirty years. He knows every machine, every customer, and he trained half of the department."],
    [0, "i", 0, "Plans for the weekend", "On Friday he talks about the weekend: the garden, a trip to see his daughter. Nothing suggests that Monday will be different."],
    [1, "i", 1, "A kind goodbye", "His boss is friendly when she tells him. He gets a card and cake, but the cake does not make it easier to go home."],
    [2, "i", 1, "A long list of applications", "He writes to forty companies in two months. Most don’t reply, and some send a standard letter that doesn’t even use his name."],
    [3, "i", 1, "Friends and awkward questions", "At a party, people ask “So, what are you doing now?” Jonas learns to say “I’m between jobs” with a smile that doesn’t feel real."],
    [4, "i", 1, "A younger interviewer", "He is interviewed by someone half his age. She asks whether he can “work with young people”, and he wonders if she would ask the same of a younger candidate."],
    [5, "w", 1, "A coffee with Katrin", "A former colleague, Katrin, invites him for a coffee and offers to recommend him. It is the first good news in months."],
    [7, "i", 2, "Back in the classroom", "He is the oldest in the course, and the youngest teach him the new tools. He teaches them what they don’t learn on screens."],
    [8, "w", 2, "A new team", "He joins a small team as a mentor and learns that young colleagues also need someone to explain the unwritten rules."],
    [9, "i", 2, "Rebuilding", "His salary is lower than before, but he has a purpose again. He realises how many people in the same situation never get a second chance."]
  ],
  lena: [
    [0, "i", 0, "A town with steps", "Lena’s small town has cobbled streets and shops with steps. She learns early which places are for everyone and which are not."],
    [1, "i", 0, "A new school bus", "The school bus has no lift, so her parents drive her. Every morning they have to leave an hour earlier than anyone else."],
    [2, "i", 0, "A teacher who asks", "Her teacher doesn’t say “I know what is best for you”. She asks Lena what she needs, and changes the classroom."],
    [3, "w", 0, "Friends who change the plan", "When the class trip is moved to a place with a lift, Lena realises how much it meant to her friends to do things together."],
    [4, "i", 1, "Open days", "At open days she checks each building before the course: lifts, doors, toilets. Some universities answer the question with a polite silence."],
    [5, "i", 1, "A student flat", "Finding a flat she can enter and use takes months. The landlord says, “Who is going to carry her up if there’s a fire?”"],
    [6, "i", 1, "A professor’s remark", "In a lecture a professor says that some people “should choose a profession that suits them”. Lena looks around and nobody speaks."],
    [8, "i", 2, "Application number 31", "She sends thirty applications. Employers praise her grades but ask what she “can really do”, and never ask what she wants to build."],
    [9, "w", 2, "A trial day", "An employer invites her to a trial day with a ramp ready and a desk adjusted. The difference isn’t the building, it’s the attitude."],
    [10, "i", 2, "Everyone can use it", "She designs apps and websites that work for people with different abilities. What helps one person often helps many."]
  ],
  sam: [
    [0, "i", 0, "A name on a list", "The teacher reads out names with “Mr” or “Ms”. Sam waits for the sound of the list to pass over them like weather."],
    [0, "i", 0, "A drawing", "Sam draws a self-portrait with colours and no labels. Another child asks, “But are you a boy or a girl?” and Sam says, “I’m Sam.”"],
    [1, "i", 0, "The changing room", "Changing for sports is a daily test. Sam learns which toilets are safe and which are not."],
    [2, "i", 0, "Forms with two boxes", "School forms have only two boxes for gender. Sam ticks neither, and the secretary says that’s “not allowed”."],
    [3, "w", 0, "A teacher’s sentence", "A teacher says, “In this class everyone is called what they want to be called.” It is a small sentence with a big effect."],
    [4, "i", 1, "A long evening", "Sam practises the words for days. At the dinner table the silence feels like an hour."],
    [5, "i", 1, "A grandmother’s hug", "Grandma doesn’t understand every word, but she says, “You’re still my child.” It is a start."],
    [6, "w", 1, "A youth group", "At a youth group Sam meets people who don’t need things explained. Laughing together without translating is a feeling Sam had never known."],
    [7, "i", 2, "A bank, a doctor, a ticket", "Everyday things like a bank account or a train ticket come with a title, “Mr” or “Mrs”. Every time, Sam has to choose or explain."],
    [8, "w", 2, "A workplace that asks", "On the first day the manager asks, “What name and pronouns should we use?” Sam almost cries about such a simple question."]
  ]
};
GOL.applyExtras = function () {
  GOL.characters.forEach(c => {
    const ex = GOL.extras[c.id]; if (!ex || c._extras) return; c._extras = true;
    const old = c.tiles, out = [], map = [], byAfter = {}; let nx = 0;
    ex.forEach(e => { (byAfter[e[0]] = byAfter[e[0]] || []).push(e); });
    old.forEach((t, i) => {
      map[i] = out.length; out.push(t);
      (byAfter[i] || []).forEach(e => {
        if (i === old.length - 1) return;
        const type = { i: "info", w: "win", b: "barrier" }[e[1]], nt = { id: "x" + c.id + (nx++), stage: e[2], type, title: e[3], text: e[4] };
        if (type === "win") nt.effects = { hope: 1, support: nx % 3 === 0 ? 1 : 0 };
        if (type === "barrier") { nt.gate = { need: 3, label: e[3] }; nt.effects = { hope: -1 }; }
        out.push(nt);
      });
    });
    c.tiles = out;
    c.bridges.forEach(b => { b.from = map[b.from]; b.to = map[b.to]; });
    c.setbacks.forEach(s => { s.at = map[s.at]; s.to = map[s.to]; });
    if (GOL.events[c.id]) { const ne = {}; Object.keys(GOL.events[c.id]).forEach(k => { ne[map[+k]] = GOL.events[c.id][k]; }); GOL.events[c.id] = ne; }
  });
};
GOL.applyExtras();
