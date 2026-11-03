// Candidate photos in /public/candidates, all from Wikimedia Commons.
// Public-domain photos need no credit; CC BY / CC BY-SA ones are credited on /credits/.
// Adding a candidate? Drop a photo in /public/candidates/<id>.jpg and add a line here.

export type Photo = { src: string; author: string; license: string; licenseUrl?: string; sourceUrl: string };

export const PHOTOS: Record<string, Photo> = {
  vance: {"src": "/candidates/vance.jpg", "author": "Emily J. Higgins", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:March_2026_Official_Vice_Presidential_Portrait_of_JD_Vance_(medium_crop)_(2).jpg"},
  aoc: {"src": "/candidates/aoc.jpg", "author": "Franmarie Metzler; U.S. House Office of Photography", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Alexandria_Ocasio-Cortez_Official_Portrait.jpg"},
  ossoff: {"src": "/candidates/ossoff.jpg", "author": "U.S. Senate Photographic Studio", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Jon_Ossoff_Senate_Portrait_2021.jpg"},
  newsom: {"src": "/candidates/newsom.jpg", "author": "Charles Ommanney – Office of the Governor of California", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Governor_of_California_Gavin_Newsom_(cropped_3x4).jpg"},
  rubio: {"src": "/candidates/rubio.jpg", "author": "U.S. Department of State", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Official_portrait_of_Secretary_Marco_Rubio_(cropped)(2).jpg"},
  harris: {"src": "/candidates/harris.jpg", "author": "Lawrence Jackson", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Kamala_Harris_Vice_Presidential_Portrait.jpg"},
  shapiro: {"src": "/candidates/shapiro.jpg", "author": "Maryland GovPics", "license": "CC BY 2.0", "licenseUrl": "https://creativecommons.org/licenses/by/2.0", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Gov._Shapiro.jpg"},
  buttigieg: {"src": "/candidates/buttigieg.jpg", "author": "United States Department of Transportation", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pete_Buttigieg,_Secretary_of_Transportation.jpg"},
  desantis: {"src": "/candidates/desantis.jpg", "author": "Government of Florida", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ron_DeSantis_official_photo.jpg"},
  beshear: {"src": "/candidates/beshear.jpg", "author": "Governor Andy Beshear", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Andy_Beshear_in_April_2026_(cropped_3).jpg"},
  talarico: {"src": "/candidates/talarico.jpg", "author": "Antonioaesparza", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0", "sourceUrl": "https://commons.wikimedia.org/wiki/File:James_Talarico_Press_Conference_(cropped).jpg"},
  "the-rock": {"src": "/candidates/the-rock.jpg", "author": "Harald Krichel", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dwayne_Johnson-1764_(4x5_cropped_with_moderate_headroom).jpg"},
  carlson: {"src": "/candidates/carlson.jpg", "author": "Gage Skidmore from Surprise, AZ, United States of America", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Tucker_Carlson_(54670577849)_(cropped_2).jpg"},
  trump: {"src": "/candidates/trump.jpg", "author": "Daniel Torok", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Official_Presidential_Portrait_of_President_Donald_J._Trump_(2025).jpg"},
  kelly: {"src": "/candidates/kelly.jpg", "author": "John Shinkle, U.S. Senate Photographic Services", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Mark_Kelly_Official_Portrait_119th.jpg"},
  warnock: {"src": "/candidates/warnock.jpg", "author": "U.S. Senate Photographic Studio, Rebecca Hammel", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Raphael_Warnock_official_photo.jpg"},
  moore: {"src": "/candidates/moore.jpg", "author": "Maryland State Government", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Wes_Moore_Official_Governor_Portrait.jpg"},
  massie: {"src": "/candidates/massie.jpg", "author": "House Creative Services", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Massie_Thomas_119th_Congress_(cropped_2).jpg"},
  khanna: {"src": "/candidates/khanna.jpg", "author": "U.S. Congress/Eric Connolly", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ro_Khanna,_official_portrait,_115th_Congress_(3x4).jpg"},
  pritzker: {"src": "/candidates/pritzker.jpg", "author": "Oscar Garza", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0", "sourceUrl": "https://commons.wikimedia.org/wiki/File:JB_Pritzker_2026_(less_cropped).jpg"},
  cruz: {"src": "/candidates/cruz.jpg", "author": "U.S. Senate Photographic Studio", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ted_Cruz_official_116th_portrait_(3x4_cropped).jpg"},
  ivanka: {"src": "/candidates/ivanka.jpg", "author": "Andrea Hanks/Official White House Photo", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ivanka_Trump_official_portrait_2020.jpg"},
  emanuel: {"src": "/candidates/emanuel.jpg", "author": "U.S. Embassy in Japan", "license": "Public domain", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ambassador-emanuel-portrait_(cropped).jpg"},
  "trump-jr": {"src": "/candidates/trump-jr.jpg", "author": "Gage Skidmore from Surprise, AZ, United States of America", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0", "sourceUrl": "https://commons.wikimedia.org/wiki/File:Donald_Trump,_Jr._(55021618832)_(cropped_2).jpg"},
};
