/* Photo credits for real people. Images are freely licensed files from Wikimedia Commons (stored in img/people/).
   Each entry: file, author, license, licenseUrl (optional), source (Commons file page). */
GOL.photos = {
  turing: {"file": "img/people/turing.jpg", "author": "Elliott & Fry", "license": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Alan_turing_header.jpg"},
  kaepernick: {"file": "img/people/kaepernick.jpg", "author": "MDGovpics", "license": "CC BY 4.0", "source": "https://commons.wikimedia.org/wiki/File:Colin_Kaepernick_August_2025_(cropped).jpg", "licenseUrl": "https://creativecommons.org/licenses/by/4.0"},
  singh: {"file": "img/people/singh.jpg", "author": "HiraV", "license": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Fauja_Singh_(3x4_cropped).jpg", "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"},
  kahlo: {"file": "img/people/kahlo.jpg", "author": "Guillermo Kahlo", "license": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Frida_Kahlo,_by_Guillermo_Kahlo.jpg"},
  keller: {"file": "img/people/keller.jpg", "author": "Unknown author", "license": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Helen_Keller_(circa_1904).jpg"},
  beethoven: {"file": "img/people/beethoven.jpg", "author": "Joseph Karl Stieler", "license": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Joseph_Karl_Stieler%27s_Beethoven_mit_dem_Manuskript_der_Missa_solemnis.jpg"},
  heumann: {"file": "img/people/heumann.jpg", "author": "East Asia and Pacific Media Hub U.S. Department of State", "license": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Judith_Heumann,_2014_(cropped).jpg"},
  cox: {"file": "img/people/cox.jpg", "author": "Jay Dixit", "license": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Laverne_Cox_at_%22The_Apprentice%22_in_NYC_01_(cropped2).jpg", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"},
  malala: {"file": "img/people/malala.jpg", "author": "flowcomm", "license": "CC BY 2.0", "source": "https://commons.wikimedia.org/wiki/File:Malala_Yousafzai_2023_portrait_2x3.jpg", "licenseUrl": "https://creativecommons.org/licenses/by/2.0"},
  curie: {"file": "img/people/curie.jpg", "author": "Henri Manuel", "license": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Marie_Curie_c._1920s.jpg"},
  king: {"file": "img/people/king.jpg", "author": "Rowland Scherman", "license": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Martin_Luther_King_-_March_on_Washington.jpg"},
  mandela: {"file": "img/people/mandela.jpg", "author": "Kingkongphoto & www.celebrity-photos.com from Laurel", "license": "CC BY-SA 2.0", "source": "https://commons.wikimedia.org/wiki/File:Nelson_Mandela_1994.jpg", "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0"},
  johnson: {"file": "img/people/johnson.jpg", "author": "Andrew Ratto from Berkeley, USA", "license": "CC0", "source": "https://commons.wikimedia.org/wiki/File:Portrait_of_Marsha_P._Johnson,_Freedom_Fighter_(50164594782).jpg", "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en", "note": "Street-art portrait"},
  parks: {"file": "img/people/parks.jpg", "author": "Unknown author", "license": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Rosa_Parks,_November_1956_(cropped).jpg"},
  wonder: {"file": "img/people/wonder.jpg", "author": "Raph_PH", "license": "CC BY 2.0", "source": "https://commons.wikimedia.org/wiki/File:SWonderBSTHyde060719-72_(cropped).jpg", "licenseUrl": "https://creativecommons.org/licenses/by/2.0"},
  hawking: {"file": "img/people/hawking.jpg", "author": "NASA", "license": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Stephen_Hawking.StarChild.jpg"},
  grandin: {"file": "img/people/grandin.jpg", "author": "Jonathunder", "license": "GFDL 1.2", "source": "https://commons.wikimedia.org/wiki/File:TempleGrandin.jpg", "licenseUrl": "http://www.gnu.org/licenses/old-licenses/fdl-1.2.html"},
};
GOL.characters.forEach(c => { if (GOL.photos[c.id]) c.photo = GOL.photos[c.id]; });
