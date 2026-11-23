# Evidence (documented events), zones with event references, look and sources per figure. Applied by apply.py.
# zone: [fx, evidenceId, why(<=150)]
D = {}
D["amira"] = dict(
 add_sources=["Federal Recognition Act (Anerkennungsgesetz) 2012, anerkennung-in-deutschland.de", "DOSB programme 'Integration durch Sport' (dosb.de)"],
 evidence=[
  dict(id="e1", y="typical case", ev="Refugees in Germany often wait months or years for residence decisions, and foreign diplomas have to pass a recognition procedure before they count.", src=3),
  dict(id="e2", y="typical case", ev="Newly arrived pupils often sit in class before they speak German; this isolates them even when they are strong in maths or sport.", src=2),
  dict(id="e3", y="typical case", ev="At the same performance level, pupils with a migrant background are placed in lower school tracks more often (OECD, German school studies).", src=2),
  dict(id="e4", y="typical case", ev="Sports clubs are one of the most common first places where refugee children find friends; the DOSB has run integration programmes since 1989.", src=4),
  dict(id="e5", y="typical case", ev="Teachers, volunteers and neighbours are one of the most important factors for refugee children arriving in a new country (UNHCR).", src=1)],
 zones=dict(office=["slow","e1","Papers and recognition: foreign diplomas and residence status are decided slowly, whatever your effort."],
  tunnel=["slow","e2","Arriving without the language: for a while you understand little, and few people understand you."],
  ladder=["slow","e3","School tracks: pupils with a migrant background more often land on lower tracks at equal marks."],
  sprint=["fast","e4","Sport club: football needs no shared language, and clubs are a common first home for refugee children."],
  bridge=["fast","e5","Teachers, neighbours and volunteers open doors for newly arrived families."]),
 adv_ev="e5",
 look=dict(skin="#d9a679",hair="#3b2a20",hairStyle="headscarf",top="#3a8f85",bottom="#3b4a6b",outfit="casual",prop="football"))
D["beethoven"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="1802", ev="In the Heiligenstadt Testament he wrote that his hearing had been failing for years and that it had pushed him to withdraw from people.", src=1),
  dict(id="e2", y="from about 1818", ev="He used conversation books: visitors wrote their side of a talk, he answered aloud.", src=1),
  dict(id="e3", y="1814", ev="His last public appearance as a pianist in a new work was in 1814; after that his hearing no longer let him perform on stage.", src=2),
  dict(id="e4", y="1815 to 1820", ev="After his brother died he fought in the Vienna courts for guardianship of his nephew Karl, a case that cost him years and money.", src=2),
  dict(id="e5", y="1809", ev="Archduke Rudolph and two princes promised him a yearly income so he would stay in Vienna and keep composing.", src=2),
  dict(id="e6", y="1824 to 1826", ev="He kept sketchbooks and heard music in his head; the late quartets and the Ninth were written deaf.", src=1)],
 zones=dict(tunnel=["slow","e2","Communication: from about 1818 every talk goes through paper and the conversation books."],
  market=["slow","e3","Stage and public life: after 1814 deafness ended his career as a performing pianist."],
  office=["slow","e4","Courts: the guardianship fight over his nephew took years of hearings."],
  bridge=["fast","e5","Patrons: Archduke Rudolph, Lobkowitz and Kinsky guaranteed his income in 1809."],
  quiet=["fast","e6","Inner ear: he sketched at home and composed the late works from imagination."]),
 adv_ev="e6",
 look=dict(skin="#e8c7a0",hair="#7a7a7a",hairStyle="wild",top="#2f5d46",bottom="#c9b99a",outfit="coat",prop="score"))
D["cox"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="childhood and adult life", ev="Laverne Cox has told TIME and other outlets that she was bullied as a child and harassed on the street as an adult; violence against trans women is a real risk.", src=1),
  dict(id="e2", y="1980s to 1990s", ev="She trained in dance at the Alabama School of Fine Arts, then studied in New York (Marymount Manhattan College).", src=0),
  dict(id="e3", y="1990s to 2012", ev="For many years there were few roles written for trans women; she auditioned, taught and worked until Orange Is the New Black (2013).", src=1),
  dict(id="e4", y="1970s onwards", ev="Her mother and her twin brother raised and backed her; friends and the trans community lifted her after insults.", src=1),
  dict(id="e5", y="2020", ev="The documentary Disclosure, which she produced and appears in, collects trans voices about how media shaped their lives.", src=2)],
 zones=dict(rope=["slow","e1","Safety: harassment and violence against trans women, which she has described."],
  market=["slow","e3","Casting: for years there were almost no roles for trans actresses."],
  ladder=["fast","e2","Arts school and college: dance training opened a way into New York."],
  bridge=["fast","e4","Her mother, twin brother and community held her up after rejection."]),
 adv_ev="e4",
 look=dict(skin="#8a5a3c",hair="#1a1410",hairStyle="long",top="#c0392b",bottom="#c0392b",outfit="dress",prop="none"))
D["curie"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="1880s", ev="Warsaw was under Russian rule: Polish was suppressed in schools, and women could not attend university.", src=3),
  dict(id="e2", y="1880s", ev="She joined the secret Flying University in Warsaw, where Polish women studied in private flats.", src=3),
  dict(id="e3", y="1891 to 1894", ev="She enrolled at the Sorbonne in Paris in 1891 and earned degrees in physics and mathematics.", src=2),
  dict(id="e4", y="1898 to 1902", ev="With Pierre she processed tonnes of pitchblende in a leaky shed to isolate radium.", src=3),
  dict(id="e5", y="1911", ev="The French Academy of Sciences narrowly voted against her membership; no woman was admitted until 1962.", src=3),
  dict(id="e6", y="1911", ev="A press campaign around the Langevin affair attacked her, often with xenophobic and sexist language.", src=2),
  dict(id="e7", y="1903", ev="Pierre made sure she was named with him for the Nobel Prize in Physics after the first nomination left her out.", src=2)],
 zones=dict(ladder=["slow","e1","Education: in Russian-ruled Warsaw women were barred from university and Polish was banned."],
  office=["slow","e5","Institutions: the Academy of Sciences refused to admit her by a narrow vote."],
  market=["slow","e6","Press and public: in 1911 newspapers attacked her with sexist and xenophobic language."],
  quiet=["fast","e4","Lab work: the leaky shed with Pierre is where radium was found."],
  bridge=["fast","e7","Partnership: Pierre insisted that she be named with him for the Nobel Prize."]),
 adv_ev="e4",
 look=dict(skin="#f0d2b0",hair="#7a5b3a",hairStyle="bun",top="#2c2c34",bottom="#2c2c34",outfit="labcoat",prop="flask"))
D["grandin"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="1950", ev="Without speech at three, she was seen by doctors who advised an institution; her mother refused and arranged speech therapy.", src=1),
  dict(id="e2", y="childhood and school", ev="Sudden sounds such as school bells hurt her; she was teased at school and called names for how she spoke.", src=1),
  dict(id="e3", y="1960s", ev="At Hampshire Country School her science teacher Mr Carlock turned her fixations into projects, which led to college.", src=1),
  dict(id="e4", y="1970s", ev="She entered the male-dominated livestock industry and was kept out of some feedlot meetings and harassed by cowboys.", src=1),
  dict(id="e5", y="1960s", ev="Her aunt's ranch in Arizona, her mother and later mentors gave her room to find her path.", src=1),
  dict(id="e6", y="1970s", ev="She designed curved cattle chutes by picturing animals' view; her squeeze machine came from the same insight.", src=1)],
 zones=dict(office=["slow","e1","Medical authority: doctors advised an institution, and others decided about her."],
  tunnel=["slow","e2","Noise and teasing: sudden sounds hurt, and many classmates stayed away or mocked her."],
  market=["slow","e4","Workplace: the cattle industry was a closed men's world for a woman who is also autistic."],
  ladder=["fast","e3","A teacher who saw her talent: Mr Carlock channelled her fixations into school projects."],
  bridge=["fast","e5","Mother, aunt and mentors gave her chances and patient time."]),
 adv_ev="e6",
 look=dict(skin="#f0cfa8",hair="#8a6b3c",hairStyle="short",top="#a63a3a",bottom="#2b3f66",outfit="western",prop="none"))
