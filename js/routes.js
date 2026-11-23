/* Per-life route: bridges (shortcuts opened by support and allies) and setbacks (detours caused by real barriers).
   bridges:  [fromTile, toTile, label]  - offered after landing on fromTile; costs 1 Support; skips the tiles in between.
   setbacks: [barrierTile, backToTile, label] - after two failed attempts at the barrier the person is pushed back. */
window.GOL = window.GOL || { characters: [] };
GOL.routes = {
  hawking:   { b: [[5, 8, "Jane, his supervisor Dennis Sciama and a stubborn curiosity keep him working."], [12, 15, "A speech synthesiser and a devoted team make daily communication possible."]],
               s: [[4, 3, "The diagnosis shatters his plans, and for a while he sees no point in finishing his PhD."], [11, 10, "After the tracheotomy he can no longer speak, and everything has to be rebuilt."]] },
  parks:     { b: [[4, 6, "Raymond Parks and the NAACP network stand behind her."], [12, 14, "Thousands walk for 381 days, and the community builds the bridge together."]],
               s: [[5, 4, "Registration is refused twice. The rules were designed to keep her out."], [11, 10, "Arrest, a fine and a long trial pull her back."], [13, 12, "Threats and the loss of her job force her family to start over."]] },
  wonder:    { b: [[3, 5, "Motown’s Berry Gordy and Clarence Paul open the door to a recording career."], [7, 9, "His classic albums win him control over his own music."]],
               s: [[6, 5, "The label wants to control his music and money."], [8, 7, "The 1973 car accident nearly ends his career."]] },
  king:      { b: [[6, 9, "A mass movement of ordinary people walks with him."]],
               s: [[7, 6, "A bomb destroys the porch of his home."], [8, 6, "Jail in Birmingham and criticism from allies."], [12, 11, "Surveillance and attacks, even from friends."]] },
  kaepernick:{ b: [[4, 6, "His adoptive family and mentors help him find his voice."]],
               s: [[7, 6, "Backlash, boos and threats follow his protest."], [8, 7, "No team calls, though he is still good enough to play."]] },
  curie:     { b: [[2, 4, "Her sister Bronya makes a deal: they put each other through school."], [7, 10, "Colleagues, friends and her daughters help her keep working."]],
               s: [[3, 2, "Women may not attend university in Warsaw."], [9, 8, "Press attacks and grief nearly break her."]] },
  heumann:   { b: [[3, 5, "Friends and allies in Disabled in Action open a faster road."], [9, 11, "Working inside government, she opens many doors at once."]],
               s: [[1, 0, "A school refuses her entry: “a fire hazard”."], [4, 3, "She is denied a teaching licence because of her wheelchair."], [6, 5, "A law is passed, but nobody enforces it."]] },
  keller:    { b: [[3, 5, "Anne Sullivan and generous supporters make Radcliffe possible."], [9, 11, "Friends and admirers carry her message around the world."]],
               s: [[1, 0, "Without a way to communicate, everything is frustration and fear."], [7, 6, "She is praised as a “miracle” and not taken seriously as a thinker."]] },
  grandin:   { b: [[2, 4, "Her mother’s speech therapy and a science teacher believe in her."]],
               s: [[1, 0, "Doctors say “brain damage” and advise an institution."], [7, 6, "A woman in a male-dominated industry is shut out again."]] },
  kahlo:     { b: [[4, 6, "Painting in bed opens a new path and a new circle of friends."], [9, 11, "Recognition and loyal friends carry her to her first solo show."]],
               s: [[3, 2, "The bus accident breaks her body and her plans."], [7, 6, "Surgeries and losses push her back again and again."]] },
  malala:    { b: [[1, 3, "Her father’s school and his belief in girls’ education."], [7, 9, "The whole world stands with her."]],
               s: [[2, 1, "The Taliban close girls’ schools."], [5, 4, "She is shot and has to relearn so much."]] },
  cox:       { b: [[2, 4, "Her mother and the arts school give her strength."], [7, 9, "A wave of allies and fans lift her platform."]],
               s: [[1, 0, "Bullying and shame pull her back."], [4, 3, "Casting directors turn her away."], [8, 7, "Fame does not end prejudice."]] },
  johnson:   { b: [[5, 7, "The STAR House community and chosen family carry her."]],
               s: [[2, 1, "No home and no job: back to the streets."], [6, 5, "The movement leaves her out."], [8, 7, "The AIDS crisis takes friends and security."]] },
  singh:     { b: [[2, 4, "His family and faith community keep him going."]],
               s: [[3, 2, "Grief sets him back again."], [5, 4, "Told over and over that he is “too old”."]] },
  mandela:   { b: [[1, 3, "Education and mentors open a path to law."], [9, 11, "A worldwide campaign to free him gathers speed."]],
               s: [[4, 3, "Apartheid laws block his career."], [6, 5, "The Rivonia Trial threatens his life."], [7, 6, "27 years in prison throw him back."]] },
  beethoven: { b: [[3, 6, "Patrons and friends in Vienna smooth his way."]],
               s: [[4, 3, "Ringing in his ears begins."], [5, 4, "Heiligenstadt: he nearly gives up."], [8, 7, "Isolation and family conflict wear him down."]] },
  turing:    { b: [[2, 4, "A friendship and a brilliant mind take him to Bletchley Park."], [5, 7, "Colleagues vouch for him and support his new ideas."]],
               s: [[1, 0, "He is out of place at school."], [6, 5, "The Official Secrets Act keeps his work hidden."], [8, 7, "His conviction in 1952 changes everything."]] },
  amira:     { b: [[3, 6, "A volunteer doctor, a teacher and a classmate named Jana open the way."]],
               s: [[2, 1, "The journey sets the family back."], [5, 4, "Without the language she is lost again."], [7, 6, "Years of waiting for a decision."]] },
  jonas:     { b: [[2, 5, "A former colleague and his network open a fast lane."]],
               s: [[3, 2, "“Overqualified” is just code for “too old”."], [4, 3, "Online application systems filter him out."]] },
  lena:      { b: [[2, 5, "A good teacher and loyal friends open the way."]],
               s: [[1, 0, "The nearest school is not accessible."], [4, 3, "The university building has stairs."], [8, 7, "Interviews end when employers see the wheelchair."]] },
  sam:       { b: [[6, 8, "A youth group and allies make room for Sam."]],
               s: [[2, 1, "Whispers and jokes at school."], [5, 4, "A grandfather’s doubts hurt."], [7, 6, "Forms and rules that do not fit."]] }
};
GOL.characters.forEach(c => {
  const r = GOL.routes[c.id] || { b: [], s: [] };
  c.bridges = r.b.map(a => ({ from: a[0], to: a[1], label: a[2] }));
  c.setbacks = r.s.map(a => ({ at: a[0], to: a[1], label: a[2] }));
});
