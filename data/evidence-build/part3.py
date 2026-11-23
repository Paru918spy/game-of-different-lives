D3 = {}
D3["malala"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="2009", ev="In January 2009 the Taliban in Swat ordered that girls must stop going to school.", src=1),
  dict(id="e2", y="2009", ev="She wrote a BBC Urdu diary under the name Gul Makai about life under the ban.", src=1),
  dict(id="e3", y="2012", ev="On 9 October 2012 a gunman shot her on her school bus; she was treated in Birmingham, UK.", src=2),
  dict(id="e4", y="1997 onwards", ev="Her father Ziauddin ran the school and backed her; teachers, classmates and strangers around the world stood with her.", src=1),
  dict(id="e5", y="2013 to 2014", ev="She spoke at the United Nations in July 2013 and won the Nobel Peace Prize in 2014, aged 17.", src=2)],
 zones=dict(ladder=["block","e1","School: the Taliban closed the way to school for girls in Swat."],
  rope=["slow","e3","Safety: she was shot for speaking up about education."],
  bridge=["fast","e4","Family and teachers: her father's school and her classmates stood with her."],
  market=["fast","e5","Platform: the BBC diary, the UN and the Nobel Prize gave her a worldwide audience."]),
 adv_ev="e4",
 look=dict(skin="#d9a679",hair="#2a1d16",hairStyle="headscarf",top="#e8a6c6",bottom="#4a6fa5",outfit="casual",prop="book"))
D3["mandela"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="1948 to 1952", ev="Apartheid laws (pass laws, group areas, the 1950 Suppression of Communism Act) limited where he lived and spoke; he was banned in 1952.", src=1),
  dict(id="e2", y="1960 to 1964", ev="At Sharpeville in 1960 police killed 69 protesters; in 1964 he faced a possible death sentence at the Rivonia trial.", src=2),
  dict(id="e3", y="1962 to 1990", ev="After his arrest in 1962 he spent 27 years in prison, 18 on Robben Island, with very few visits and letters.", src=1),
  dict(id="e4", y="1952", ev="With Oliver Tambo he opened the first Black-run law practice in Johannesburg, and he built the ANC's network.", src=1),
  dict(id="e5", y="1940s to 1989", ev="He studied at Fort Hare and later for a law degree by correspondence, even in prison.", src=1)],
 zones=dict(office=["slow","e1","Law: apartheid laws and banning orders decided where he could live, speak and work."],
  rope=["slow","e2","Safety: Sharpeville, arrest and a trial that could end in the death sentence."],
  tunnel=["slow","e3","Prison: 27 years apart, with very few visits and letters."],
  bridge=["fast","e4","Movement: the ANC, Oliver Tambo and many allies."],
  ladder=["fast","e5","Study: Fort Hare, then a law degree by correspondence."]),
 adv_ev="e4",
 look=dict(skin="#5a3a28",hair="#cfcfcf",hairStyle="short",top="#d9822b",bottom="#2c3a2c",outfit="shirt",prop="none"))
D3["parks"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="1920s to 1933", ev="Black children had no school bus and walked to school; Rosa left school to care for her grandmother and mother and finished later.", src=1),
  dict(id="e2", y="1943 to 1945", ev="She was refused when she tried to register to vote twice; a poll tax and a literacy test were used to keep Black people off the rolls.", src=1),
  dict(id="e3", y="1955 to 1957", ev="After the boycott she lost her job, got threatening calls and moved to Detroit in 1957.", src=1),
  dict(id="e4", y="1943 to 1956", ev="She was secretary of the Montgomery NAACP; community carpools kept the 381-day boycott going.", src=2)],
 zones=dict(ladder=["slow","e1","School: no bus for Black children, and she left school to care for her family."],
  office=["slow","e2","Voting: she was refused registration twice because of a test and a tax."],
  rope=["slow","e3","Safety: threatening calls after the bus arrest."],
  market=["slow","e3","Work: she lost her job and could not find work in Montgomery."],
  bridge=["fast","e4","Community: NAACP friends and carpools carried the boycott."]),
 adv_ev="e4",
 look=dict(skin="#7a5238",hair="#555555",hairStyle="bun",top="#b89a6a",bottom="#3a3a44",outfit="coat",prop="bag"))
D3["sam"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="2017 to 2018", ev="Germany's Federal Constitutional Court ruled in 2017 that civil status must allow a third entry; 'divers' was introduced in 2018. Before that, forms offered two boxes.", src=1),
  dict(id="e2", y="research", ev="Young LGBTQ people with at least one accepting adult report better mental health (Trevor Project, a US study).", src=2),
  dict(id="e3", y="research", ev="Trans and non-binary young people report more bullying and exclusion at school (Trevor Project).", src=2),
  dict(id="e4", y="typical case", ev="School routines such as sports teams, toilets and trips are often split into two groups.", src=2)],
 zones=dict(office=["slow","e1","Forms and law: for years the paperwork had only two boxes."],
  tunnel=["slow","e3","School climate: jokes and exclusion at school isolate."],
  ladder=["slow","e4","School routines: sports, toilets and trips are split in two groups."],
  bridge=["fast","e2","One adult who gets it: acceptance changes a young person's chances a lot."]),
 adv_ev="e2",
 look=dict(skin="#e8c7a0",hair="#6b4acf",hairStyle="short",top="#3aa39a",bottom="#33384a",outfit="hoodie",prop="none"))
D3["singh"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="around 1911 to 1916", ev="He could not walk until about five because his legs were weak.", src=4),
  dict(id="e2", y="childhood", ev="He was a farmer's son in a Punjab village with almost no schooling.", src=4),
  dict(id="e3", y="2000s", ev="He had no birth certificate, so Guinness World Records could not certify his age records.", src=3),
  dict(id="e4", y="1992 onwards", ev="After family losses he moved to Ilford in London, where a Sikh running coach and a club took him in.", src=2),
  dict(id="e5", y="2000", ev="He ran the London Marathon for the first time at around 89, and finished marathons until 101.", src=2)],
 zones=dict(stairs=["slow","e1","Legs: weak legs as a child kept him from walking until about five."],
  office=["slow","e3","Papers: no birth certificate, so records could not be certified."],
  bridge=["fast","e4","Coach and club: the Sikh community and his coach in Ilford took him in."],
  sprint=["fast","e5","Running: marathons from about 89 years old."]),
 adv_ev="e5",
 look=dict(skin="#b8845a",hair="#f0f0f0",hairStyle="turban",top="#f2c230",bottom="#2b3f66",outfit="runner",prop="beard"))
D3["turing"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="1952", ev="He was convicted of 'gross indecency' under a law that made gay sex a crime; he accepted hormone treatment instead of prison.", src=2),
  dict(id="e2", y="1952", ev="His security clearance was withdrawn, so he lost his work for the secret service.", src=1),
  dict(id="e3", y="1939 to 1945", ev="His wartime codebreaking at Bletchley Park was covered by the Official Secrets Act, so he could not tell anyone.", src=1),
  dict(id="e4", y="1926", ev="At Sherborne School the headmaster wanted classics and Latin; he preferred science.", src=1),
  dict(id="e5", y="1935 to 1936", ev="He was elected fellow of King's College, Cambridge, and wrote 'On Computable Numbers' in 1936.", src=1),
  dict(id="e6", y="1947 to 1948", ev="He ran a marathon in 2 hours 46 minutes and trained with Walton Athletic Club.", src=1)],
 zones=dict(office=["slow","e1","Law: a 1952 conviction for being gay ended his security clearance and his career."],
  tunnel=["slow","e3","Secrecy: the Official Secrets Act forced him to stay silent about his work."],
  ladder=["slow","e4","School: Sherborne wanted Latin, not mathematics."],
  quiet=["fast","e5","Study and thought: Cambridge gave him time to work out what computing means."],
  sprint=["fast","e6","Running: he ran a marathon in 2h46 and trained with a club."]),
 adv_ev="e5",
 look=dict(skin="#f0d2b0",hair="#2a2018",hairStyle="short",top="#555a66",bottom="#3a3a44",outfit="suit",prop="none"))
D3["wonder"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="1950s", ev="Born premature and blind, he went to the Michigan School for the Blind, one of the separate schools that blind children were sent to at the time.", src=2),
  dict(id="e2", y="1961 to 1971", ev="Signed to Motown at 11; his contract held his earnings in trust until 21, and at 21 he renegotiated and gained creative control.", src=2),
  dict(id="e3", y="1960s", ev="Motown's Berry Gordy, mentor Clarence Paul and his family supported his career.", src=2),
  dict(id="e4", y="1972 to 1976", ev="He recorded a run of classic albums, playing many instruments himself.", src=2)],
 zones=dict(ladder=["slow","e1","School: blind children of his time were taught in separate schools for the blind."],
  office=["slow","e2","Contracts: until 21 others controlled his contract and money."],
  market=["slow","e2","Business: his earnings and his songs were not his to control."],
  bridge=["fast","e3","Support: his family, Clarence Paul and Motown backed him."],
  quiet=["fast","e4","Studio: he played many instruments himself on his classic albums."]),
 adv_ev="e4",
 look=dict(skin="#7a5238",hair="#1a1410",hairStyle="braids",top="#26262e",bottom="#26262e",outfit="suit",prop="sunglasses"))
