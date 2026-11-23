D2 = {}
D2["hawking"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="1963 to 1964", ev="At 21 he was diagnosed with motor neurone disease (ALS) and told he might have about two years.", src=2),
  dict(id="e2", y="late 1960s to 1970s", ev="He moved from sticks to a wheelchair; many Cambridge buildings of the time were not step-free, so he often depended on help to get in.", src=2),
  dict(id="e3", y="1985", ev="After pneumonia and a tracheotomy he lost his voice; he first used a spelling card, later a computer with a synthesiser.", src=2),
  dict(id="e4", y="1960s to 2018", ev="His wife, nurses, students and colleagues made his daily life and work possible.", src=2),
  dict(id="e5", y="1970s", ev="As writing equations became impossible, he trained himself to hold geometry and equations in his head.", src=2)],
 zones=dict(stairs=["slow","e2","Steps and old buildings: in a wheelchair he often depended on help to get into buildings."],
  tunnel=["slow","e3","Voice: after 1985 every sentence had to be spelled out, so every talk takes much longer."],
  bridge=["fast","e4","Carers, students and colleagues made his daily life and research possible."],
  quiet=["fast","e5","Thinking in his head: he trained himself to see equations without paper."]),
 adv_ev="e5",
 look=dict(skin="#f0cfa8",hair="#5a4630",hairStyle="short",top="#6f7b88",bottom="#2f3440",outfit="wheelchair",prop="glasses"))
D2["heumann"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="about 1952", ev="Her Brooklyn school principal refused to let her in because a wheelchair was 'a fire hazard'; she had home lessons for years.", src=1),
  dict(id="e2", y="1950s to 1970s", ev="Steps, buses without lifts and inaccessible buildings and planes limited where she could go, and strangers often had to carry her.", src=1),
  dict(id="e3", y="1970", ev="New York's Board of Education refused her a teaching licence; she sued and became the first wheelchair user to teach there.", src=1),
  dict(id="e4", y="1960s", ev="At Camp Jened in the Catskills she met other disabled teenagers and found a community.", src=2),
  dict(id="e5", y="1977", ev="She led the 25-day sit-in in San Francisco that forced the government to sign the Section 504 rules; Black Panthers brought food.", src=1)],
 zones=dict(stairs=["block","e2","Steps and transport: buses, buildings and planes were built without wheelchair access."],
  ladder=["slow","e1","School: she was refused entry as 'a fire hazard' and taught at home for years."],
  office=["slow","e3","Licences and rules: New York refused her teaching licence until she sued."],
  bridge=["fast","e5","Allies: other disabled activists, even the Black Panthers, stood with her in 1977."]),
 adv_ev="e5",
 look=dict(skin="#f0cfa8",hair="#4a3322",hairStyle="long",top="#3f8f5a",bottom="#33384a",outfit="wheelchair",prop="glasses"))
D2["johnson"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="1963", ev="Marsha moved to New York from New Jersey as a teenager with little money and slept in the streets and with friends.", src=2),
  dict(id="e2", y="1960s to 1980s", ev="Police arrested and harassed trans women and drag performers for how they dressed; Marsha was arrested many times.", src=2),
  dict(id="e3", y="1960s to 1970s", ev="Trans women faced almost total job discrimination; Marsha worked as a waitress and in survival sex work.", src=2),
  dict(id="e4", y="1970", ev="In 1970 she and Sylvia Rivera founded STAR; a house for homeless trans youth followed in 1971.", src=2),
  dict(id="e5", y="1975", ev="She performed with the Hot Peaches troupe and was photographed by Andy Warhol.", src=2)],
 zones=dict(rope=["slow","e2","Safety: street harassment and police violence against trans women."],
  office=["slow","e2","Police and courts: repeated arrests for how she dressed and lived."],
  market=["slow","e3","Work: job doors closed to trans women, leaving survival work."],
  bridge=["fast","e4","Chosen family: STAR gave shelter to homeless trans youth, and Marsha shared what she had."]),
 adv_ev="e4",
 look=dict(skin="#6b4a33",hair="#1a1410",hairStyle="flowers",top="#e0509a",bottom="#7a4acf",outfit="dress",prop="none"))
D2["jonas"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="2021", ev="The WHO reports that about one in two people hold ageist attitudes, and that ageism harms people's chances at work.", src=1),
  dict(id="e2", y="2006", ev="Germany's General Equal Treatment Act bans age discrimination in hiring, but applicants rarely can prove it.", src=3),
  dict(id="e3", y="2010s", ev="Online application portals, tests and video interviews are harder for older applicants (OECD, Working Better with Age).", src=2),
  dict(id="e4", y="2010s", ev="Workers over 55 take part in further training less often, and are less often offered it (OECD).", src=2),
  dict(id="e5", y="2010s", ev="Mixed-age teams share knowledge both ways; older workers often hold the networks and know-how.", src=2),
  dict(id="e6", y="2010s", ev="Long experience lets older professionals solve familiar problems faster (OECD).", src=2)],
 zones=dict(market=["slow","e1","Work: ageist assumptions decide before your skills are read."],
  office=["slow","e2","Law: age discrimination is banned, but very hard to prove."],
  tunnel=["slow","e3","Digital hiring: portals and tests are built for younger applicants."],
  ladder=["slow","e4","Further training: older workers are less often offered courses."],
  bridge=["fast","e5","A network across generations: tips and skill swaps with colleagues."]),
 adv_ev="e6",
 look=dict(skin="#e8c7a0",hair="#9a9a9a",hairStyle="short",top="#3f6fb0",bottom="#2f3440",outfit="shirt-tie",prop="none"))
D2["kaepernick"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="2013", ev="He was quarterback of the 49ers in the Super Bowl XLVII, a game he led to the final minutes.", src=3),
  dict(id="e2", y="2016", ev="After he sat and then knelt during the anthem to protest police violence, he faced boos, burned jerseys and threats.", src=3),
  dict(id="e3", y="2017 to 2019", ev="No NFL team signed him after the 2016 season; his collusion grievance was settled in 2019.", src=3),
  dict(id="e4", y="2016", ev="He founded the Know Your Rights Camp for young people.", src=2)],
 zones=dict(rope=["slow","e2","Backlash: boos, burned jerseys and threats after the kneeling protest."],
  market=["slow","e3","Work: after 2016 no team signed him, though he was still good enough to play."],
  sprint=["fast","e1","Sport: at the top of his game he led a team to the Super Bowl."],
  bridge=["fast","e4","Community: the Know Your Rights Camp and fellow players stood with him."]),
 adv_ev="e1",
 look=dict(skin="#9a6a4a",hair="#1a1410",hairStyle="afro",top="#c8102e",bottom="#e5d9a8",outfit="football",prop="helmet"))
D2["kahlo"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="1913", ev="At six she had polio; her right leg stayed thinner, and children teased her.", src=1),
  dict(id="e2", y="1925", ev="On 17 September 1925 a tram hit her bus; she broke her spine, pelvis and leg, and had many operations over her life.", src=1),
  dict(id="e3", y="1953", ev="Her right leg was amputated below the knee in 1953 after gangrene; afterwards she used crutches, a wheelchair and a prosthetic boot.", src=1),
  dict(id="e4", y="1925 to 1926", ev="During recovery her family built an easel above the bed with a mirror, and she started painting self-portraits.", src=1),
  dict(id="e5", y="1930s to 1940s", ev="Diego Rivera, friends and her students (Los Fridos) supported her; the Louvre bought a painting in 1939.", src=1)],
 zones=dict(stairs=["slow","e3","Steps: after the 1953 amputation she used crutches, a wheelchair and a prosthetic boot."],
  sprint=["slow","e2","Stamina: after the 1925 accident, pain and many operations limited her body."],
  quiet=["fast","e4","Work in bed: the easel above her bed and the mirror made her art possible."],
  bridge=["fast","e5","Friends and students (Los Fridos) supported her work and her days."]),
 adv_ev="e4",
 look=dict(skin="#c89a73",hair="#1a1410",hairStyle="braids",top="#c0392b",bottom="#1f8a5b",outfit="dress",prop="flowers"))
D2["keller"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="1882 to 1887", ev="After an illness at 19 months she was deaf and blind; for years she had no shared language with her family, only home signs.", src=1),
  dict(id="e2", y="1887", ev="Anne Sullivan taught her the word 'water' at the pump and then many more words by finger-spelling.", src=1),
  dict(id="e3", y="1904", ev="She graduated from Radcliffe College with honours, the first deaf-blind person to earn a BA.", src=1),
  dict(id="e4", y="1912", ev="When she wrote about socialism, newspaper editors dismissed her views as products of her disability.", src=2),
  dict(id="e5", y="1892", ev="After her story 'The Frost King' was accused of plagiarism, she faced an inquiry that left her afraid to write.", src=1)],
 zones=dict(tunnel=["slow","e1","Silence and darkness: before words she could not share what she knew."],
  market=["slow","e4","Public voice: editors said her opinions came from her disability."],
  bridge=["fast","e2","A teacher: Anne Sullivan opened language and the world for her."],
  ladder=["fast","e3","College: with Anne at her side she graduated from Radcliffe with honours."]),
 adv_ev="e3",
 look=dict(skin="#f0d2b0",hair="#7a5b3a",hairStyle="updo",top="#f5f0e6",bottom="#4a5a7a",outfit="dress",prop="book"))
D2["king"] = dict(
 add_sources=[],
 evidence=[
  dict(id="e1", y="1929 to 1944", ev="Segregation laws shaped his childhood in Atlanta; on a bus ride at 15 he was made to stand for about 90 miles.", src=1),
  dict(id="e2", y="1956 to 1968", ev="His house was bombed in 1956, he was stabbed in 1958, jailed in Birmingham in 1963 and watched by the FBI.", src=1),
  dict(id="e3", y="1940s to 1950s", ev="His family and the Ebenezer Baptist Church were a strong base for him.", src=1),
  dict(id="e4", y="1944 to 1955", ev="He entered Morehouse College at 15 and earned a doctorate at Boston University in 1955.", src=2)],
 zones=dict(office=["slow","e1","Law: segregation laws decided where he could sit, eat and learn."],
  rope=["slow","e2","Safety: a bomb at home, a stabbing, jail and FBI surveillance."],
  bridge=["fast","e3","Church and family: a community that carried the movement."],
  ladder=["fast","e4","Education: Morehouse at 15 and a doctorate opened a path for his voice."]),
 adv_ev="e3",
 look=dict(skin="#6b4a33",hair="#1a1410",hairStyle="short",top="#26262e",bottom="#26262e",outfit="suit",prop="none"))
D2["lena"] = dict(
 add_sources=["DIN 18040: German standard for accessible construction"],
 evidence=[
  dict(id="e1", y="2009 and today", ev="Germany ratified the UN disability rights convention in 2009, yet many buildings and stations are still not step-free.", src=1),
  dict(id="e2", y="today", ev="Many pupils with disabilities in Germany still attend special schools instead of mainstream classes (inclusion studies).", src=2),
  dict(id="e3", y="today", ev="Applications for support and for university exam adjustments take many forms and long waits.", src=2),
  dict(id="e4", y="today", ev="Disabled applicants are invited to fewer interviews than others with the same skills (German inclusion studies).", src=2),
  dict(id="e5", y="today", ev="Standard DIN 18040 sets rules for barrier-free building; architects who know it design accessible places.", src=3),
  dict(id="e6", y="typical case", ev="Friends, one supportive teacher and an inclusive employer change what disabled people can do.", src=2)],
 zones=dict(stairs=["block","e1","Steps: many buildings and stations are still closed to wheelchair users."],
  ladder=["slow","e2","School: many disabled pupils are steered to special schools."],
  market=["slow","e4","Work: disabled applicants are invited to fewer interviews."],
  ramp=["fast","e5","Accessible design: the ramp route is the one built for you, and you know how it works."],
  bridge=["fast","e6","Allies: friends, a teacher and an inclusive employer."]),
 adv_ev="e6",
 look=dict(skin="#f0d2b0",hair="#8a5a2a",hairStyle="ponytail",top="#e07a3a",bottom="#33384a",outfit="wheelchair",prop="none"))
