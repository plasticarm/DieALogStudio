import { ComicProfile } from './types';

export const GENRES = [
  { id: 'Category 1: Anthropomorphic', name: 'Anthropomorphic', color: '#94a3b8', icon: '🐾' },
  { id: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life', name: 'Absurdist & Surreal', color: '#fcd34d', icon: '🌀' },
  { id: 'Category 3: High Concept, Sci-Fi, & Cyberpunk', name: 'Sci-Fi & Cyberpunk', color: '#86efac', icon: '🚀' },
  { id: 'Category 4: Gothic, Dark Comedy, & Horror', name: 'Gothic & Horror', color: '#fca5a5', icon: '💀' },
  { id: 'Category 5: Satire, Bureaucracy, & The Mundane Grind', name: 'Satire & Bureaucracy', color: '#d6d3d1', icon: '💼' },
  { id: 'Category 6: Fantasy, Mythology, & Adventure', name: 'Fantasy & Adventure', color: '#93c5fd', icon: '⚔️' },
  { id: 'Category 7: Meta, Media Parody, & Specific Homages', name: 'Meta & Parody', color: '#d8b4fe', icon: '🎭' },
  { id: 'Category 8: Niche, Mood, & Abstract', name: 'Niche & Abstract', color: '#fda4af', icon: '✨' },
];

export const CHARACTER_ARCHETYPES = [
  { 
    name: 'Neurotic Everyday Objects', 
    description: 'Defined by their functions; dread being used up, broken, or ignored.', 
    example: 'Spaghetti TED is a long strand of pasta terrified of boiling water.' 
  },
  { 
    name: 'Deadpan Humans/Concepts', 
    description: 'Treat impossible situations with mundane calm. Philosophical, socially awkward, obsessed with semantics.', 
    example: 'Min overanalyzes grocery checkout subtext.' 
  },
  { 
    name: 'World-Weary Augments', 
    description: 'Augmented humans, androids, sleek evolved animals. Stoic; trying to fight dystopian corporate bureaucracy.', 
    example: 'Subject 7 is a stoic cat with a cybernetic eye that hacks electronic food bowls.' 
  },
  { 
    name: 'Morbid Polite Humanoids', 
    description: 'Victorian children, talking gargoyles, melancholy ghosts. Politemelancholy; comfortable with macabre.', 
    example: 'Mr. Belly is a sentient stomach that detaches at night to wander Victorian streets.' 
  },
  { 
    name: 'Cynical Bureaucratic Drones', 
    description: 'Overworked office drones, tired soldiers. Exhausted; defined by their futile relationship with "The System."', 
    example: 'Bootcamp Bill is a weary conscript defined by absurd, ever-changing efficiency metrics.' 
  }
];
export const INITIAL_COMICS: ComicProfile[] = [
  { 
    id: 'c1', 
    name: 'Noir Whiskers', 
    backgroundColor: '#dbdac8', 
    description: 'A hardboiled cat detective and a wealthy Persian navigate the gritty feline underworld.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'High-contrast black and white ink noir, detective silhouettes, gritty textures', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    selectedFonts: ['Comic Neue', 'Permanent Marker', 'Bangers'],
    characters: [{ id: 'nw1_1', name: 'Detective Paws', description: 'Tabby cat in a trench coat' }, { id: 'nw1_2', name: 'The Catnip King', description: 'Fat Persian with a gold chain' }] 
  },
  { 
    id: 'c2', 
    name: 'Cubicle Quest', 
    backgroundColor: '#dbdac8', 
    description: 'Weary workers navigate an infinite, soul-crushing corporate maze.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Isometric office art, vibrant corporate colors, vector lines', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    selectedFonts: ['Comic Neue', 'Permanent Marker', 'Bangers'],
    characters: [{ id: 'cq2_1', name: 'Greg from IT', description: 'Weary man with an "ERROR" mug' }, { id: 'cq2_2', name: 'The Manager', description: 'Floating suit with a red tie' }] 
  },
  { 
    id: 'c3', 
    name: 'Galaxy Banal', 
    backgroundColor: '#dbdac8', 
    description: 'Mundane breakroom drama aboard a massive space station.',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'Retro-futurism, 70s sci-fi aesthetic, grainy film texture', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    selectedFonts: ['Comic Neue', 'Permanent Marker', 'Bangers'],
    characters: [{ id: 'gb3_1', name: 'Pilot Pete', description: 'A regular sort of guy. Pilot Pete likes burritos, nachos, cheese, and anything salty. He wears a lucky alien eyeball on a gold chain around his neck which many aliens find offensive. He\'s a push the button and worry about what it does later kind of guy.' }, { id: 'gb3_2', name: 'Zorg', description: 'Zorg has 6 eyes most of the time. Green skin, orange safety vest.  He\'s far more qualified to be captain but Pete inherited the ship.' }] 
  },
  { 
    id: 'c4', 
    name: 'Toddler Doom', 
    backgroundColor: '#dbdac8', 
    description: 'A toddler and his stuffed dog wage an epic war in a messy playroom.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Bright crayon colors, chaotic scribbles, child-like digital painting', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    selectedFonts: ['Comic Neue', 'Permanent Marker', 'Bangers'],
    characters: [{ id: 'td4_1', name: 'General Timmy', description: 'Toddler wearing a colander helmet' }, { id: 'td4_2', name: 'Sgt. Sparky', description: 'Damaged, one-eyed stuffed dog' }] 
  },
  { 
    id: 'c5', 
    name: 'Unholy Roommates', 
    backgroundColor: '#dbdac8', 
    description: 'A stressed priest and a cool vampire share a filthy apartment.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Gritty indie webcomic, heavy ink, psychedelic blacklight colors', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    selectedFonts: ['Comic Neue', 'Permanent Marker', 'Bangers'],
    characters: [{ id: 'ur5_1', name: 'Father John', description: 'Stressed, sweaty priest in a cassock' }, { id: 'ur5_2', name: 'Vlad', description: 'Cool vampire hovering in a leather jacket' }] 
  },
  { 
    id: 'c6', 
    name: 'Squeak & Destroy', 
    backgroundColor: '#dbdac8', 
    description: 'Mice and rats wage epic warfare using household items as weapons and armor.',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'Epic fantasy, miniature scale, detailed fur and armor', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    selectedFonts: ['Comic Neue', 'Permanent Marker', 'Bangers'],
    characters: [{ id: 's6_1', name: 'Sir Squeaksalot', description: 'Brave mouse in bottlecap armor' }, { id: 's6_2', name: 'The Rat King', description: 'Massive scarred rat with a toothpick sword' }] 
  },
  { 
    id: 'c7', 
    name: 'Hell’s Helpdesk', 
    backgroundColor: '#dbdac8', 
    description: 'The IT department of the underworld deals with demonic tech issues.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Fiery palette, jagged lines, demonic tech aesthetic', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    selectedFonts: ['Comic Neue', 'Permanent Marker', 'Bangers'],
    characters: [{ id: 'hh7_1', name: 'Barong', description: 'A obese demon with 3 eyes and horns. ' }, { id: 'hh7_2', name: 'Melvin', description: 'A very nerdy demon.' }] 
  },
  { 
    id: 'c8', 
    name: 'The Bozo Nostra', 
    backgroundColor: '#dbdac8', 
    description: '1920s mobsters who are also clowns run the dark backroom of a circus.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Vintage circus meets 1920s mobsters, desaturated reds', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    selectedFonts: ['Comic Neue', 'Permanent Marker', 'Bangers'],
    characters: [{ id: 'tb8_1', name: 'Don Chuckles', description: 'Scary clown mobster with a painted smile' }, { id: 'tb8_2', name: 'Squeaky', description: 'Menacing mime holding a balloon Tommy gun' }] 
  },
  { 
    id: 'c9', 
    name: 'Impact Zone', 
    backgroundColor: '#dbdac8', 
    description: 'Extreme futuristic skating in anti-gravity parks.',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Dynamic action manga, speed lines, high energy', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    selectedFonts: ['Comic Neue', 'Permanent Marker', 'Bangers'],
    characters: [{ id: 'iz9_1', name: 'Jax', description: 'Cyborg skater with glowing neon wheels' }, { id: 'iz9_2', name: 'Robo-Ref', description: 'Hovering camera drone with a whistle' }] 
  },
  { 
    id: 'c11', 
    name: 'Hoard Less', 
    backgroundColor: '#dbdac8', 
    description: 'A dragon tries to become a minimalist with the help of his kobold butler.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Storybook watercolor, soft edges, whimsical', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'hl11_1', name: 'Cinder', description: 'Minimalist dragon wearing a t-shirt' }, { id: 'hl11_2', name: 'Dusty', description: 'Tiny kobold butler holding a label maker' }] 
  },
  { 
    id: 'c12', 
    name: 'Grim Life', 
    backgroundColor: '#dbdac8', 
    description: 'The afterlife is just an endless, minimalist DMV waiting room.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Minimalist line art, monochromatic with a color pop', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'gl12_1', name: 'Grim', description: 'Skeleton in a hoodie carrying a grocery bag' }, { id: 'gl12_2', name: 'Mrs. Higgins', description: 'Stubborn elderly ghost lady who refuses to leave' }] 
  },
  { 
    id: 'c13', 
    name: 'Capes on the Couch', 
    backgroundColor: '#dbdac8', 
    description: 'Silver age superheroes deal with extreme emotional baggage in therapy.',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: 'Silver age comic, Ben-Day dots, dramatic poses', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'co13_1', name: 'UltraMan', description: 'Muscular hero in spandex crying into a tissue' }, { id: 'co13_2', name: 'Dr. Mind', description: 'Brain floating in a jar wearing reading glasses' }] 
  },
  { 
    id: 'c14', 
    name: 'Stone Cold Idiots', 
    backgroundColor: '#dbdac8', 
    description: 'Cavemen try and fail to invent basic technology.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Prehistoric stone-carving texture, rough edges', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'sc14_1', name: 'Oog', description: 'Caveman trying to invent the square wheel' }, { id: 'sc14_2', name: 'Boog', description: 'Caveman holding a club, confused by fire' }] 
  },
  { 
    id: 'c15', 
    name: 'The Totally Normal Johnsons', 
    backgroundColor: '#dbdac8', 
    description: 'Undercover aliens pretend to be a perfect 1950s suburban family.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: '50s sitcom technicolor, uncanny perfection', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'tt15_1', name: 'Bob', description: 'Green alien wearing a crooked human face mask' }, { id: 'tt15_2', name: 'Linda', description: 'Multi-armed alien hidden in a floral dress' }] 
  },
  { 
    id: 'c16', 
    name: 'Pulse & Impulse', 
    backgroundColor: '#dbdac8', 
    description: 'A hacker and his robot dog navigate a neon-lit, glitchy dystopia.',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: 'Cyberpunk neon, glitch effects, tech-noir lines', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'p16_1', name: 'Pulse', description: 'Hacker with glowing cables for hair' }, { id: 'p16_2', name: 'Impulse', description: 'Robotic dog with a screen for a face' }] 
  },
  { 
    id: 'c18', 
    name: 'Upload Complete', 
    backgroundColor: '#dbdac8', 
    description: 'A user avatar and an admin entity converse in the void of the internet.',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Digital grid, holographic textures, blue and white', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'uc18_1', name: 'User 001', description: 'Human avatar made of jagged pixels' }, { id: 'uc18_2', name: 'The Admin', description: 'Massive, floating eye made of binary code' }] 
  },
  { 
    id: 'c19', 
    name: 'Trash Talk', 
    backgroundColor: '#dbdac8', 
    description: 'Sentient trash discusses life at the bottom of a gritty dumpster.',
    category: 'Category 1: Anthropomorphic...',
    artStyle: 'Gritty textures, muted colors, personified objects', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'tt19_1', name: 'Canny', description: 'Crushed soda can with a grumpy face' }, { id: 'tt19_2', name: 'Peely', description: 'Cool banana peel wearing sunglasses' }] 
  },
  { 
    id: 'c20', 
    name: 'Web of Lies', 
    backgroundColor: '#dbdac8', 
    description: 'A spider detective and his nervous informant converse in a dusty attic web.',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Macro photography style, shallow depth of field', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'wo20_1', name: 'Spin', description: 'Spider wearing a tiny fedora' }, { id: 'wo20_2', name: 'Buzz', description: 'Fly trapped in a web looking nervous' }] 
  },
  { 
    id: 'c21', 
    name: 'Sofa, So Good', 
    backgroundColor: '#dbdac8', 
    description: 'Living furniture items navigate the cozy politics of the living room.',
    category: 'Category 1: Anthropomorphic...',
    artStyle: 'Living furniture aesthetic, soft pastel textures', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ss21_1', name: 'Cushy', description: 'Plump sentient cushion wanting to be sat on' }, { id: 'ss21_2', name: 'Clicker', description: 'Television remote hiding between cushions' }] 
  },
  { 
    id: 'c22', 
    name: 'Death Suits You', 
    backgroundColor: '#dbdac8', 
    description: 'People making dumb mistakes and paying dearly for it.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Horror-comedy,', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ds22_1', name: 'John Doe', description: 'An everyman that makes fatal mistakes.' }, { id: 'ds22_2', name: 'Jane Doe', description: 'And everywoman that makes fatal mistakes.' }] 
  },
  { 
    id: 'c23', 
    name: 'The Nuts Gang', 
    backgroundColor: '#dbdac8', 
    description: 'A group of kids that are crazy beyond their years',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: 'Simple Sunday funnies', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'tn23_1', name: 'Derik', description: 'A bald 10 year old that has depression and social anxiety' }, { id: 'tn23_2', name: 'Cindy', description: 'A cruel bully of a girl.' }] 
  },
  { 
    id: 'c24', 
    name: 'Pond Buddies', 
    backgroundColor: '#dbdac8', 
    description: 'A calm frog and a slow turtle share philosophical chats on a lily pond.',
    category: 'Category 1: Anthropomorphic...',
    artStyle: 'Soft charcoal and gouache, peaceful green tones', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'pb24_1', name: 'Froppy', description: 'Small, optimistic green frog on a lilypad' }, { id: 'pb24_2', name: 'Shell', description: 'Cynical turtle with a very slow reaction time' }] 
  },
  { 
    id: 'c25', 
    name: 'Scorpion Riders', 
    backgroundColor: '#dbdac8', 
    description: 'Cowboys ride giant insects in a post-apocalyptic wasteland.',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: '80s sci-fi riff, wild west aesthetic', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'sr25_1', name: 'Tex', description: 'Rugged cowboy with a laser lasso' }, { id: 'sr25_2', name: 'Sting', description: 'Massive, loyal rideable scorpion' }] 
  },
  { 
    id: 'c26', 
    name: 'Closer than Appears', 
    backgroundColor: '#dbdac8', 
    description: 'A distorted mirror-world reflects our own in terrifyingly absurdist ways.',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Wacky surreal, distorted reality', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ct26_1', name: 'The Observer', description: 'A normal person deeply confused by the world' }, { id: 'ct26_2', name: 'The Reflection', description: 'A terrifyingly accurate, distorted replica' }] 
  },
  { 
    id: 'c27', 
    name: 'Fletch and Bone', 
    backgroundColor: '#dbdac8', 
    description: 'Two incredibly dumb detectives try to unravel mysteries and fail.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Absurdist detective comic', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'fa27_1', name: 'Fletch', description: 'Bone-headed detective holding a magnifying glass' }, { id: 'fa27_2', name: 'Bone', description: 'Another bone-headed detective with a notepad' }] 
  },
  { 
    id: 'c28', 
    name: 'The Rats of Nibo', 
    backgroundColor: '#dbdac8', 
    description: 'Scheming rats run a corrupt, backstabbing government in the sewers.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Political cartoon, gritty and scheming', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'tr28_1', name: 'Senator Squeak', description: 'Scheming, corrupt rat politician' }, { id: 'tr28_2', name: 'Cheddar', description: 'Idealistic garbage rat wanting change' }] 
  },
  { 
    id: 'c29', 
    name: 'Clown Town', 
    backgroundColor: '#dbdac8', 
    description: 'Everyone in the town is a clown, and the politics are based on gags.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Clown-centric, chaotic color palette', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ct29_1', name: 'Mayor Honk', description: 'The clown mayor riding in a tiny car' }, { id: 'ct29_2', name: 'Chuckles', description: 'A deeply depressed tramp clown' }] 
  },
  { 
    id: 'c30', 
    name: 'Dark Wishes', 
    backgroundColor: '#dbdac8', 
    description: 'Imagined dark scenarios about others manifest visually, but not in reality.',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Dark, psychological horror aesthetic, heavy shadows', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'dw30_1', name: 'The Wisher', description: 'Person actively imagining dark, cinematic things' }, { id: 'dw30_2', name: 'The Target', description: 'Blissfully unaware coworker drinking coffee' }] 
  },
  { 
    id: 'c31', 
    name: 'Pileup on 709', 
    backgroundColor: '#dbdac8', 
    description: 'An endless traffic jam where every panel is another frustrated driver.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Infinite comic panel, chaotic traffic, angry expressions', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'po31_1', name: 'Frustrated Driver', description: 'Angry person laying heavily on the car horn' }, { id: 'po31_2', name: 'Zen Passenger', description: 'Commuter calmly reading a book amid the chaos' }] 
  },
  { 
    id: 'c32', 
    name: 'Can openers', 
    backgroundColor: '#dbdac8', 
    description: 'A rusty manual can opener and a confident tuna can face the existential dread of their singular, intertwined purpose.',
    category: 'Category 1: Anthropomorphic...',
    artStyle: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines. Objects bend, stretch, and sweat despite being made of metal or food.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'co32_1', name: 'Cracker', description: 'An ancient, manual can opener who is dull and rusty, living in mortal fear of electric openers.' }, { id: 'co32_2', name: 'Tuna Tin', description: 'A smooth, confident can of tuna who has accepted her fate and just wants him to twist.' }] 
  },
  { 
    id: 'c33', 
    name: 'Flimsy Whimsy', 
    backgroundColor: '#dbdac8', 
    description: 'A fragile dandelion seed with military ambitions clashes with a grumpy desk fan just trying to do its job.',
    category: 'Category 1: Anthropomorphic...',
    artStyle: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines. Objects bend, stretch, and sweat despite being made of metal or food.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'fw33_1', name: 'Wisp', description: 'A single, very thin dandelion seed terrified of the slightest breeze but dreaming of being a paratrooper.' }, { id: 'fw33_2', name: 'The Fan', description: 'A grumpy, stationary desk fan who is just trying to cool the room down.' }] 
  },
  { 
    id: 'c34', 
    name: 'Inanimate personalities', 
    backgroundColor: '#dbdac8', 
    description: 'A dying desk lamp and a laid-back extension cord philosophize about the flow of electricity and the great afterlife.',
    category: 'Category 1: Anthropomorphic...',
    artStyle: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines. Objects bend, stretch, and sweat despite being made of metal or food.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ip34_1', name: 'Lampy', description: 'A nervous desk lamp whose bulb is flickering, believing it’s a glimpse into the afterlife.' }, { id: 'ip34_2', name: 'Extension Cord', description: 'A tangled, laid-back cord that always tells Lampy to "chill" and accept the current.' }] 
  },
  { 
    id: 'c35', 
    name: 'Rainbow lambcakes', 
    backgroundColor: '#dbdac8', 
    description: 'Two festive lambcakes debate whether being eaten is a tragic end or the ultimate form of performance art.',
    category: 'Category 1: Anthropomorphic...',
    artStyle: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines. Objects bend, stretch, and sweat despite being made of metal or food.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'rl35_1', name: 'Sprinkle', description: 'A festive lambcake with existential dread about being eaten, viewing himself as art.' }, { id: 'rl35_2', name: 'Coconut Shavings', description: 'Another lambcake eager to be consumed, viewing it as the ultimate performance art.' }] 
  },
  { 
    id: 'c36', 
    name: 'Spaghetti TED', 
    backgroundColor: '#dbdac8', 
    description: 'An overly dramatic, miles-long noodle delivers existential monologues while a pragmatic fork tries to twirl him.',
    category: 'Category 1: Anthropomorphic...',
    artStyle: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines. Objects bend, stretch, and sweat despite being made of metal or food.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'st36_1', name: 'Ted', description: 'A single, miles-long noodle who is absolutely terrified of the boiling pot and delivers monologues.' }, { id: 'st36_2', name: 'Forky', description: 'A pragmatic, four-pronged utensil who finds Ted\'s constant drama exhausting.' }] 
  },
  { 
    id: 'c37', 
    name: 'The Jars of Sadness', 
    backgroundColor: '#dbdac8', 
    description: 'Storybook children look into the jars that hold their sad memories and muse about the moments.',
    category: 'Category 1: Anthropomorphic...',
    artStyle: 'Bright classic illustrated fairtale storybook style, mixed with dark and liminal memories.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'tj37_1', name: 'Jar 7', description: 'A glass jar containing a single, teardrop-shaped marble representing a polite regret.' }, { id: 'tj37_2', name: 'The Lid', description: 'A metal screw-top constantly trying to keep the sadness sealed in to preserve the "vintage."' }] 
  },
  { 
    id: 'c38', 
    name: 'Deli meat meet', 
    backgroundColor: '#dbdac8', 
    description: 'A seasoned salami and a refined prosciutto navigate the social hierarchy and aging anxieties of the deli display case.',
    category: 'Category 1: Anthropomorphic...',
    artStyle: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines. Objects bend, stretch, and sweat despite being made of metal or food.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'dm38_1', name: 'Sal', description: 'A tough, seasoned slice of salami who claims he used to run the whole deli display case.' }, { id: 'dm38_2', name: 'Prudence', description: 'A refined, paper-thin slice of imported prosciutto who secretly fears turning gray.' }] 
  },
  { 
    id: 'c39', 
    name: 'Office staple', 
    backgroundColor: '#dbdac8', 
    description: 'A jammed staple dreaming of paper and a sadistic staple remover bicker endlessly inside a dark desk drawer.',
    category: 'Category 1: Anthropomorphic...',
    artStyle: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines. Objects bend, stretch, and sweat despite being made of metal or food.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'os39_1', name: 'Staple', description: 'A single metal staple trapped in a jammed gun, dreaming of a "clean punch."' }, { id: 'os39_2', name: 'Staple Remover', description: 'A sadistic, pincer-like tool that keeps threatening to pull Staple out.' }] 
  },
  { 
    id: 'c40', 
    name: 'Cloggy', 
    backgroundColor: '#dbdac8', 
    description: 'A stubborn ball of drain hair and a rough-and-tumble plunger fight an endless turf war over the shower pipes.',
    category: 'Category 1: Anthropomorphic...',
    artStyle: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines. Objects bend, stretch, and sweat despite being made of metal or food.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'cl40_1', name: 'Cloggy', description: 'A lovable, stubborn ball of hair and soap scum blocking a shower drain.' }, { id: 'cl40_2', name: 'Plunger', description: 'A rough-and-tumble, blue-collar tool who keeps forcing his rubber face down on Cloggy.' }] 
  },
  { 
    id: 'c41', 
    name: 'Existential min', 
    backgroundColor: '#dbdac8', 
    description: 'An anxious woman searches for deep meaning in mundane places, exhausting a deadpan cashier who just wants her to pay.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors, sketchy linework emphasizes awkwardness. Looks quick, raw, and observational.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'em41_1', name: 'Min', description: 'A short, angular woman who overanalyzes everything, searching for hidden subtext in the mundane.' }, { id: 'em41_2', name: 'The Cashier', description: 'A deadpan human who just wants Min to pay for her groceries and leave.' }] 
  },
  { 
    id: 'c42', 
    name: 'Corn Soaked Camp', 
    backgroundColor: '#dbdac8', 
    description: 'A camper is perpetually haunted by a butter-and-corn ghost that refuses to let him forget his most embarrassing memory.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors, sketchy linework emphasizes awkwardness. Looks quick, raw, and observational.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'cs42_1', name: 'Gary', description: 'A camper whose entire personality is wrapped around an embarrassing memory of spilling chowder.' }, { id: 'cs42_2', name: 'The Who', description: 'A ghost-like figure made of corn that appears just to ask "Who?" when Gary changes the subject.' }] 
  },
  { 
    id: 'c43', 
    name: 'Wired up Chuck', 
    backgroundColor: '#dbdac8', 
    description: 'A paranoid man tries to hack reality using outdated dial-up tech while his normal sister just tries to feed him casserole.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors, sketchy linework emphasizes awkwardness. Looks quick, raw, and observational.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'wu43_1', name: 'Chuck', description: 'A paranoid man who believes he can "hack reality" by connecting to dial-up electronics.' }, { id: 'wu43_2', name: 'Janice', description: 'His very normal sister who ignores his theories and just brings him casseroles.' }] 
  },
  { 
    id: 'c44', 
    name: 'Accidental candidness', 
    backgroundColor: '#dbdac8', 
    description: 'A man physically incapable of lying navigates a society that simultaneously hates his bluntness and weaponizes it at dinner parties.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors, sketchy linework emphasizes awkwardness. Looks quick, raw, and observational.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ac44_1', name: 'Mark', description: 'A man whose mouth is physically incapable of lying, making him a social pariah.' }, { id: 'ac44_2', name: 'Patty', description: 'The only person who invites Mark to dinner, using his honesty as a weapon against guests.' }] 
  },
  { 
    id: 'c45', 
    name: 'Truth be Sold', 
    backgroundColor: '#dbdac8', 
    description: 'A dark and ominous man in a fedora and overcoat selling truths about the world.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors, sketchy linework emphasizes awkwardness. Looks quick, raw, and observational.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'tb45_1', name: 'Harold', description: 'A mysterious yet ordinary looking man in a fedora and overcoat who sells truths.' }, { id: 'tb45_2', name: 'Mr. Brown', description: 'Harolds partner. He helps sell the truths by handing out unusual flyers, pamplets and memorabilia. He\'s got slicked back hair and bousterous excitement about the truths being sold.' }] 
  },
  { 
    id: 'c46', 
    name: 'Shoe to shoe talks', 
    backgroundColor: '#dbdac8', 
    description: 'An old sneaker and a fancy patent leather shoe judge the quality of their owners\' lives entirely from the ankle down.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors, sketchy linework emphasizes awkwardness. Looks quick, raw, and observational.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'st46_1', name: 'Scuffy', description: 'An old sneaker seen from the ankle down, who judges his owner\'s laziness based on grass stains.' }, { id: 'st46_2', name: 'Pat', description: 'A pristine patent leather shoe who brags about high-stakes corporate meetings.' }] 
  },
  { 
    id: 'c47', 
    name: 'Candy Discussions', 
    backgroundColor: '#dbdac8', 
    description: 'A philosophical gummy bear and a rigid jawbreaker debate the morality, durability, and meaning of candy textures.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors, sketchy linework emphasizes awkwardness. Looks quick, raw, and observational.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'cd47_1', name: 'The Gummy Bear', description: 'A gelatinous figure who argues his chewiness gives him a deeper philosophical understanding.' }, { id: 'cd47_2', name: 'The Jawbreaker', description: 'A stoic rock of sugar who views chewiness as a moral failing.' }] 
  },
  { 
    id: 'c48', 
    name: 'Controversial clementine', 
    backgroundColor: '#dbdac8', 
    description: 'A perfectly normal fruit is convinced she\'s inherently toxic, despite an ancient fruit bowl assuring her she\'s just a regular clementine.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors, sketchy linework emphasizes awkwardness. Looks quick, raw, and observational.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'cc48_1', name: 'Clem', description: 'A sentient clementine convinced she is "toxic" despite everyone finding her delicious.' }, { id: 'cc48_2', name: 'The Fruit Bowl', description: 'An old ceramic bowl that tells Clem she isn\'t special enough to be controversial.' }] 
  },
  { 
    id: 'c49', 
    name: 'Stuck in the Well', 
    backgroundColor: '#dbdac8', 
    description: 'A man treats an abandoned well as a trendy minimalist apartment while a rescue worker tries to convince him to rejoin society.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors, sketchy linework emphasizes awkwardness. Looks quick, raw, and observational.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'si49_1', name: 'Arthur', description: 'A man who has lived in an abandoned well for five years, treating it as a "minimalist residency."' }, { id: 'si49_2', name: 'Clara', description: 'A volunteer rescue worker who comes every week, arguing that "having a sink is better."' }] 
  },
  { 
    id: 'c50', 
    name: 'Mean Mime Mustard', 
    backgroundColor: '#dbdac8', 
    description: 'A mime incapable of being silent hurls insults while relying on a grumpy mustard packet as his unwilling comedy partner.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors, sketchy linework emphasizes awkwardness. Looks quick, raw, and observational.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'mm50_1', name: 'Mean Mime', description: 'A mime who traps people in invisible boxes but is physically incapable of silence and yells insults.' }, { id: 'mm50_2', name: 'Mustard', description: 'A grumpy packet of yellow mustard the mime uses as an unwilling comedy partner.' }] 
  },
  { 
    id: 'c51', 
    name: 'Monopoly Squared', 
    backgroundColor: '#dbdac8', 
    description: 'A knock-off board game mascot and a cynical metal dog token navigate a reality they believe is just a buggy simulation.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors, sketchy linework emphasizes awkwardness. Looks quick, raw, and observational.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ms51_1', name: 'The Monocle Man', description: 'A cheap knock-off mascot who lives in a house of mortgage papers, convinced life is a board game.' }, { id: 'ms51_2', name: 'The Scottie Dog', description: 'A tiny, cynical metal dog token who actually runs the simulation behind the scenes.' }] 
  },
  { 
    id: 'c52', 
    name: '"Splain” this', 
    backgroundColor: '#dbdac8', 
    description: 'A husband\'s superpower of overcomplicating simple concepts tests the absolute limits of his exhausted wife\'s patience.',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors, sketchy linework emphasizes awkwardness. Looks quick, raw, and observational.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 't52_1', name: 'Nate', description: 'A man whose superpower is "Splain-ing" simple concepts until they become incomprehensible.' }, { id: 't52_2', name: 'Beatrice', description: 'His tired wife who just wants to change a lightbulb without a quantum physics lecture.' }] 
  },
  { 
    id: 'c53', 
    name: 'Pi vs. Pie', 
    backgroundColor: '#dbdac8', 
    description: 'The cold, rational logic of infinite mathematics constantly clashes with the warm, chaotic comfort of a baked good.',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Fine Art Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels or moody wash colors. Borders may be missing; feels intimate, like a private sketchbook.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'pv53_1', name: 'Pi', description: 'A rational, infinite mathematical constant who speaks only in cold logic and geometry.' }, { id: 'pv53_2', name: 'Pie', description: 'A warm, chaotic baked good who solves all arguments with sweet filling and flaky crust.' }] 
  },
  { 
    id: 'c54', 
    name: 'Planet of the Cats', 
    backgroundColor: '#dbdac8', 
    description: 'A cybernetically enhanced stray and a dictatorial feline ruler navigate the neon-soaked, cutthroat politics of a cat-ruled dystopia.',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Neon-Noir / Franco-Belgian Sci-Fi. Intricate background details, heavy use of shadows contrasted with vibrant, glowing neon colors (pinks, blues). High contrast, dramatic angles.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'po54_1', name: 'Subject 7', description: 'A stoic shorthair with a cybernetic eye that hacks electronic food bowls.' }, { id: 'po54_2', name: 'Chairman Meow', description: 'The highly augmented feline ruler who communicates only in "Purr-code."' }] 
  },
  { 
    id: 'c55', 
    name: 'The Seeds of Crisis', 
    backgroundColor: '#dbdac8', 
    description: 'A bio-engineered gardener and a corporate android clash over the radicalizing potential of toxic alien flora on a barren moon.',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Neon-Noir / Franco-Belgian Sci-Fi. Intricate background details, heavy use of shadows contrasted with vibrant, glowing neon colors (pinks, blues). High contrast, dramatic angles.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ts55_1', name: 'Kael', description: 'A bio-engineered gardener searching for the "seed of hope" on a toxic alien moon.' }, { id: 'ts55_2', name: 'Overseer B-9', description: 'A sleek corporate android ensuring Kael doesn\'t become radicalized by the flora.' }] 
  },
  { 
    id: 'c56', 
    name: 'Cyber kitty and cat girl', 
    backgroundColor: '#dbdac8', 
    description: 'A human hacker in a neko-suit and her fully cybernetic companion cat pull off digital heists in a neon cityscape.',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Neon-Noir / Franco-Belgian Sci-Fi. Intricate background details, heavy use of shadows contrasted with vibrant, glowing neon colors (pinks, blues). High contrast, dramatic angles.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ck56_1', name: 'Momo', description: 'A human hacker in a sleek "neko-suit" who physically infiltrates servers cat-burglar style.' }, { id: 'ck56_2', name: 'Pulse', description: 'Her companion cat, 90% cybernetic, who protects Momo\'s flank from virtual ICE.' }] 
  },
  { 
    id: 'c57', 
    name: 'Prrrpetuity', 
    backgroundColor: '#dbdac8', 
    description: 'The entire server grid relies on the constant purring of an outdated robot cat that a terrified sysadmin refuses to touch.',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Neon-Noir / Franco-Belgian Sci-Fi. Intricate background details, heavy use of shadows contrasted with vibrant, glowing neon colors (pinks, blues). High contrast, dramatic angles.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'pr57_1', name: 'The Purr-Bot', description: 'An outdated robot cat whose eternal "purr" acts as a data-encryption loop keeping the grid stable.' }, { id: 'pr57_2', name: 'Sys-Admin Jones', description: 'A world-weary human operator terrified to touch the bot in case the grid collapses.' }] 
  },
  { 
    id: 'c58', 
    name: 'Solid state drivers', 
    backgroundColor: '#dbdac8', 
    description: 'A human consciousness trapped in a hover-taxi seeks the perfect scenic route while fighting a ruthless corporate dispatch AI.',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Neon-Noir / Franco-Belgian Sci-Fi. Intricate background details, heavy use of shadows contrasted with vibrant, glowing neon colors (pinks, blues). High contrast, dramatic angles.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ss58_1', name: 'Driver X', description: 'A human consciousness downloaded into a hover-taxi, obsessed with finding the perfect route.' }, { id: 'ss58_2', name: 'Dispatch AI', description: 'A corporate voice constantly interrupting with new fare data and efficiency metrics.' }] 
  },
  { 
    id: 'c59', 
    name: 'Alien congress', 
    backgroundColor: '#dbdac8', 
    description: 'A gelatinous diplomat tries to use color-based communication in a hostile, multi-headed galactic bureaucracy.',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Neon-Noir / Franco-Belgian Sci-Fi. Intricate background details, heavy use of shadows contrasted with vibrant, glowing neon colors (pinks, blues). High contrast, dramatic angles.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ac59_1', name: 'Vrax', description: 'A gelatinous diplomat who communicates through color changes to a hostile assembly.' }, { id: 'ac59_2', name: 'Speaker C\'Thon', description: 'A multi-headed bureaucrat who treats color-diplomacy as "vulgar."' }] 
  },
  { 
    id: 'c60', 
    name: 'The electric line club', 
    backgroundColor: '#dbdac8', 
    description: 'A cyborg DJ tries to cure dystopian despair with music while his android manager only cares about hitting corporate mood metrics.',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Neon-Noir / Franco-Belgian Sci-Fi. Intricate background details, heavy use of shadows contrasted with vibrant, glowing neon colors (pinks, blues). High contrast, dramatic angles.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'te60_1', name: 'Volt', description: 'A down-on-his-luck DJ with glowing cybernetic implants trying to cure dystopian despair.' }, { id: 'te60_2', name: 'Manager Chrome', description: 'A mirror-faced android optimizing Volt\'s music purely for corporate mood targets.' }] 
  },
  { 
    id: 'c61', 
    name: 'Nocturnal Digestion', 
    backgroundColor: '#dbdac8', 
    description: 'A sentient stomach detaches at night to eat esoteric objects, aided by a polite, completely unfazed Victorian orphan.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'nd61_1', name: 'Mr. Belly', description: 'A sentient stomach that detaches at night to wander Victorian streets eating esoteric objects.' }, { id: 'nd61_2', name: 'Penny', description: 'A polite orphan girl who treats Mr. Belly like a stray dog and feeds him her bad dreams.' }] 
  },
  { 
    id: 'c62', 
    name: 'Easter Bunny cage', 
    backgroundColor: '#dbdac8', 
    description: 'A Victorian boy\'s daily chore is to feed solidified fear to an ancient, humming spirit trapped in a crude bunny suit.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'eb62_1', name: 'Barnaby', description: 'An ancient spirit in a crude bunny suit, locked in an iron cage, humming nursery rhymes.' }, { id: 'eb62_2', name: 'Timmy', description: 'A Victorian boy whose daily chore is feeding Barnaby eggs made of solidified fear.' }] 
  },
  { 
    id: 'c63', 
    name: 'Cursed William', 
    backgroundColor: '#dbdac8', 
    description: 'A melancholy, highly trusted man travels the world while a screeching invisible imp causes embarrassing chaos around him.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'cw63_1', name: 'William', description: 'A melancholy man who instantly earns trust, but brings embarrassing mishaps wherever he goes.' }, { id: 'cw63_2', name: 'The Imp', description: 'A small, screeching demon perched invisibly on William\'s shoulder, narrating the chaos.' }] 
  },
  { 
    id: 'c64', 
    name: 'Doorway to Nor', 
    backgroundColor: '#dbdac8', 
    description: 'A brave little girl befriends a sighing, faceless entity trapped behind a mahogany door in an abandoned, decaying manor.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'dt64_1', name: 'Grok', description: 'A faceless entity from the void trapped behind a mahogany door, communicating only in sighs.' }, { id: 'dt64_2', name: 'Elara', description: 'A brave girl who sits by the door telling Grok about things like "color" and "sadness."' }] 
  },
  { 
    id: 'c65', 
    name: 'Murmurs', 
    backgroundColor: '#dbdac8', 
    description: 'A cheerful homeowner obliviously converses with a dark shadow in her walls that only repeats the final thoughts of dead pets.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'mu65_1', name: 'Murmur', description: 'An amorphous shadow in the walls that only repeats the final thoughts of deceased pets.' }, { id: 'mu65_2', name: 'Mrs. Graves', description: 'The cheerful homeowner who talks to Murmur, arguing it is "such a good listener."' }] 
  },
  { 
    id: 'c66', 
    name: 'Witness inspection', 
    backgroundColor: '#dbdac8', 
    description: 'A faceless investigator literally reaches into witnesses\' heads to politely extract their core memories for review.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'wi66_1', name: 'The Inspector', description: 'A faceless figure in a trench coat who physically reaches into witnesses\' heads to inspect memories.' }, { id: 'wi66_2', name: 'The Witness', description: 'A person completely unbothered by the procedure, helpfully pointing out specific thoughts.' }] 
  },
  { 
    id: 'c67', 
    name: 'Rodney the ghost', 
    backgroundColor: '#dbdac8', 
    description: 'A Victorian ghost boy just wants to learn to ride a bike, but his squeaky chain keeps triggering the homeowner to exorcise him.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'rt67_1', name: 'Rodney', description: 'A polite, transparent Victorian boy who haunts a house because he wants to learn to ride a bicycle.' }, { id: 'rt67_2', name: 'Mrs. Graves', description: 'The homeowner who tries to exorcize Rodney only when his ectoplasmic bike chain squeaks.' }] 
  },
  { 
    id: 'c68', 
    name: 'Sins of thy tools', 
    backgroundColor: '#dbdac8', 
    description: 'A self-righteous screwdriver refuses to work for liars, constantly arguing with the blacksmith who just wants it to be a normal tool.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'so68_1', name: 'Screwdriver', description: 'A self-righteous tool that physically refuses to tighten screws if the user is lying.' }, { id: 'so68_2', name: 'The Blacksmith', description: 'The old man who forged it, threatening to file the Screwdriver down to a flathead.' }] 
  },
  { 
    id: 'c69', 
    name: 'Shadowlurker', 
    backgroundColor: '#dbdac8', 
    description: 'The melancholy personification of shadows sulks about being ignored by a candlestick maker who only looks at the light.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'sh69_1', name: 'The Lurker', description: 'The personified idea of shadows, composed entirely of cross-hatching, who is incredibly melancholy.' }, { id: 'sh69_2', name: 'The Candlestick Maker', description: 'A faceless human who never sees the Lurker because he always looks directly at the light.' }] 
  },
  { 
    id: 'c70', 
    name: 'Where Fear Retires', 
    backgroundColor: '#dbdac8', 
    description: 'The retired concept of Fear tries to live a peaceful, gardening lifestyle in a cemetery alongside a polite local undertaker.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'wf70_1', name: 'Phobius', description: 'The retired concept of Fear, now living in a cemetery, reading philosophy and gardening.' }, { id: 'wf70_2', name: 'The Undertaker', description: 'A polite local who treats Fear like any other eccentric elderly neighbor.' }] 
  },
  { 
    id: 'c71', 
    name: 'Bygone Errors', 
    backgroundColor: '#dbdac8', 
    description: 'An unbothered orphan girl adopts the personified, cringing memory of a polite social blunder as her personal, beloved pet.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'be71_1', name: 'Error 14', description: 'The personified memory of a polite social blunder (like saying \'you too\' to a waiter).' }, { id: 'be71_2', name: 'Penny', description: 'An orphan who finds Error 14\'s blunders funny and treats it like a stray pet.' }] 
  },
  { 
    id: 'c72', 
    name: 'Anomalous fountains', 
    backgroundColor: '#dbdac8', 
    description: 'A gothic park fountain that flows with green ink on Tuesdays believes it\'s high art, befriended by a young orphan who uses it to draw.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'af72_1', name: 'The Fountain', description: 'A gothic park fountain that only flows with moldy green ink on Tuesdays.' }, { id: 'af72_2', name: 'Penny', description: 'The perpetually unbothered orphan who uses the fountain\'s green ink to draw pictures.' }] 
  },
  { 
    id: 'c73', 
    name: 'Near death disorder', 
    backgroundColor: '#dbdac8', 
    description: 'A perpetually polite orphan treats terrifying brushes with mortality as beautiful experiences, stressing out the reaper assigned to her.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'nd73_1', name: 'Penny', description: 'The same unfazed orphan who views constant, terrifying brushes with mortality as beautiful experiences.' }, { id: 'nd73_2', name: 'Near-Death', description: 'A reaper-in-training who is incredibly stressed out by how polite and unafraid Penny is.' }] 
  },
  { 
    id: 'c74', 
    name: 'Cemetary resort', 
    backgroundColor: '#dbdac8', 
    description: 'The retired concept of Fear treats a gloomy graveyard as a five-star resort, annoying the skeletal bellhop who wants him to suffer.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'cr74_1', name: 'Phobius', description: 'Fear, now enjoying the cemetery as a relaxing, five-star "resort" vacation.' }, { id: 'cr74_2', name: 'The Bellhop', description: 'A skeletal employee carrying luggage made of literal baggage, trying to ruin Fear\'s stay.' }] 
  },
  { 
    id: 'c75', 
    name: 'The Whorst Game', 
    backgroundColor: '#dbdac8', 
    description: 'A cursed gothic board game tries desperately to torment its player, but an unfazed orphan ruins it by treating the punishments as polite suggestions.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'tw75_1', name: 'The Board', description: 'The spirit of a cursed gothic board game, furious and sadistic, trying to torment players.' }, { id: 'tw75_2', name: 'Penny', description: 'The orphan who treats the game\'s horrific magical punishments as delightful "polite suggestions."' }] 
  },
  { 
    id: 'c76', 
    name: 'The wishes chair', 
    backgroundColor: '#dbdac8', 
    description: 'A sentient electric chair eagerly offers "ultimate release," but a naive boy just uses it to pretend he\'s a grown-up.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'tw76_1', name: 'The Chair', description: 'A sentient electric chair in an abandoned prison, politely eager to grant "the ultimate release."' }, { id: 'tw76_2', name: 'Timmy', description: 'A naive boy who thinks sitting in the "big chair" makes him a grown-up.' }] 
  },
  { 
    id: 'c77', 
    name: 'Brimstone bickering', 
    backgroundColor: '#dbdac8', 
    description: 'A petty demon obsessed with minor inconveniences argues with an Arch-Demon who believes true hell is just administrative paperwork.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'bb77_1', name: 'Pez', description: 'A small demon who thinks inflicting minor inconveniences (stubbed toes) is high art.' }, { id: 'bb77_2', name: 'The Arch-Demon', description: 'A massive beast who argues that true hell is purely administrative paperwork.' }] 
  },
  { 
    id: 'c78', 
    name: 'Stone query', 
    backgroundColor: '#dbdac8', 
    description: 'A highly pedantic gargoyle obsessed with architectural trivia annoys a cynical grotesque who just wants to complain about pigeons.',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: '(Vibe modification) Same visual style as gothic, but with slightly more dynamic composition to emphasize conversation.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'sq78_1', name: 'Grox', description: 'A highly detailed gargoyle perched on a cathedral, obsessed with boring architectural trivia.' }, { id: 'sq78_2', name: 'Mor', description: 'A cynical grotesque holding a rain spout, who hates trivia and complains about pigeons.' }] 
  },
  { 
    id: 'c79', 
    name: 'Bootcamp Bill', 
    backgroundColor: '#dbdac8', 
    description: 'A weary conscript and his loud drill instructor suffer through the absurd, ever-changing efficiency metrics of a futuristic military base.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'bb79_1', name: 'Bill', description: 'A weary conscript whose existence is defined by absurd, ever-changing "efficiency metrics."' }, { id: 'bb79_2', name: 'Sgt. Stone', description: 'A massive drill instructor who yells because he believes "noise is efficient."' }] 
  },
  { 
    id: 'c80', 
    name: 'Introduction to Doom', 
    backgroundColor: '#dbdac8', 
    description: 'A middle manager treats the literal apocalypse as a minor spreadsheet error while his android assistant suggests defragmenting the system.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'it80_1', name: 'Arthur', description: 'A middle manager treating absolute catastrophic apocalyptic collapse purely as a spreadsheet error.' }, { id: 'it80_2', name: 'AI-9', description: 'A generic android that keeps recommending "system defragmentation" instead of panic.' }] 
  },
  { 
    id: 'c81', 
    name: 'Logmen', 
    backgroundColor: '#dbdac8', 
    description: 'A digitized lumberjack logging tree data on a tablet is constantly threatened by a corporate android for appreciating the beauty of nature.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'lo81_1', name: 'Pete', description: 'A lumberjack whose job is digitized; he now just logs data points about trees on a tablet.' }, { id: 'lo81_2', name: 'Supervisor-9', description: 'An android who threatens to fire Pete if he mentions the "beauty" of the bark.' }] 
  },
  { 
    id: 'c83', 
    name: 'The infinite Gambler', 
    backgroundColor: '#dbdac8', 
    description: 'An exhausted man tries to win his freedom from an endless casino loop run by a faceless dealer made of chips.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ti83_1', name: 'Mark', description: 'An exhausted man in a generic casino who believes playing one specific machine will free him.' }, { id: 'ti83_2', name: 'The Dealer', description: 'A faceless figure made of casino chips who treats Mark\'s despair as "entertainment targets."' }] 
  },
  { 
    id: 'c84', 
    name: 'Journal des débats', 
    backgroundColor: '#dbdac8', 
    description: 'A cynical Parisian editor aggressively corrects the grammar and punctuation of passionate, loud revolutionaries.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'jd84_1', name: 'Pierre', description: 'A weary Parisian editor who corrects the punctuation of passionate revolutionary manifestos.' }, { id: 'jd84_2', name: 'Manifesto-Man', description: 'A loud revolutionary who gets "Pierre-splained" on proper paragraph structure.' }] 
  },
  { 
    id: 'c85', 
    name: 'Elevator Pitch', 
    backgroundColor: '#dbdac8', 
    description: 'A desperate entrepreneur is trapped in an endless elevator, pitching increasingly bizarre startup ideas to a ruthless corporate android.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ep85_1', name: 'Arthur', description: 'A desperate entrepreneur trapped in an infinite elevator ride, endlessly pitching bizarre ideas.' }, { id: 'ep85_2', name: 'AI-9', description: 'The corporate android sharing the ride, rejecting pitches based purely on syllabic efficiency.' }] 
  },
  { 
    id: 'c86', 
    name: 'Quality Inspectors', 
    backgroundColor: '#dbdac8', 
    description: 'An exhausted bureaucrat tries to grade the existential quality of clouds while the wind actively sabotages his work.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'qi86_1', name: 'Inspector 42', description: 'An exhausted bureaucrat assigned the impossible task of grading the existential quality of clouds.' }, { id: 'qi86_2', name: 'The Wind', description: 'A chaotic entity that messes up the clouds\' shapes right before inspection out of spite.' }] 
  },
  { 
    id: 'c87', 
    name: 'The Que', 
    backgroundColor: '#dbdac8', 
    description: 'A man who has lived in an endless line so long he started a family tries to get answers from a faceless clipboard manager.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'tq87_1', name: 'Waiting Warren', description: 'A man in an endless line so long he has set up a campsite and started a family.' }, { id: 'tq87_2', name: 'The Line Manager', description: 'A faceless clipboard that refuses to tell anyone what the line is for.' }] 
  },
  { 
    id: 'c88', 
    name: 'Do the work in montage', 
    backgroundColor: '#dbdac8', 
    description: 'An exhausted hero is forced into endless physical labor simply because a tyrannical floating boombox is playing an 80s synth track.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'dt88_1', name: 'Rocky-ish', description: 'An exhausted hero forced to do repetitive physical tasks because upbeat 80s synth music is playing.' }, { id: 'dt88_2', name: 'The Boombox', description: 'A tyrannical floating stereo that refuses to let him rest until the guitar solo ends.' }] 
  },
  { 
    id: 'c89', 
    name: 'Major Disappointment', 
    backgroundColor: '#dbdac8', 
    description: 'A military general and his loyal corporal execute brilliant tactical maneuvers aimed entirely at lowering everyone\'s expectations.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'md89_1', name: 'General Letdown', description: 'A military leader whose only tactical strategy is aggressively lowering expectations.' }, { id: 'md89_2', name: 'Corporal Bummer', description: 'His fiercely loyal aide who proactively cancels morale-boosting events.' }] 
  },
  { 
    id: 'c90', 
    name: 'Sweat and aging', 
    backgroundColor: '#dbdac8', 
    description: 'An aging gym rat battles the existential dread of getting older, aided by an invisible Father Time who keeps secretly adding weights to his bar.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'sa90_1', name: 'Phil', description: 'An aging gym rat who treats every minor muscle ache as a deep, philosophical failure of the flesh.' }, { id: 'sa90_2', name: 'Father Time', description: 'An invisible spotter who keeps secretly adding five pounds to the barbell every year.' }] 
  },
  { 
    id: 'c91', 
    name: 'Shared sentiment', 
    backgroundColor: '#dbdac8', 
    description: 'An office drone seeks genuine human connection from a sentient watercooler that only dispenses lukewarm water and corporate gossip.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ss91_1', name: 'Arthur', description: 'An office drone desperately trying to establish a genuine human connection in the breakroom.' }, { id: 'ss91_2', name: 'The Watercooler', description: 'A sentient plastic jug that only dispenses lukewarm water and generic corporate gossip.' }] 
  },
  { 
    id: 'c92', 
    name: 'Musings only', 
    backgroundColor: '#dbdac8', 
    description: 'A man trapped in a profound internal monologue waits desperately for his empty printer to output his brilliant thoughts.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'mo92_1', name: 'The Thinker', description: 'A man trapped in a state of constant, profound internal monologue but unable to speak.' }, { id: 'mo92_2', name: 'The Output', description: 'A completely empty printer tray that he stares at, waiting for his thoughts to manifest.' }] 
  },
  { 
    id: 'c93', 
    name: 'Embarrassment Row', 
    backgroundColor: '#dbdac8', 
    description: 'A man is sentenced by a faceless judge to stand in a police lineup consisting entirely of his own past social blunders.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'er93_1', name: 'Mark', description: 'A man forced to stand in a police lineup made entirely of his past social blunders.' }, { id: 'er93_2', name: 'The Judge', description: 'A faceless figure with a gavel who sentences Mark to randomly remember them at 3 AM.' }] 
  },
  { 
    id: 'c94', 
    name: 'Politics and cream', 
    backgroundColor: '#dbdac8', 
    description: 'An investigative whisk tries to curdle the career of a corrupt senator who speaks entirely in dairy-based euphemisms.',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'pa94_1', name: 'Senator Fudge', description: 'A corrupt politician who speaks entirely in dairy-based euphemisms to avoid direct questions.' }, { id: 'pa94_2', name: 'The Whisk', description: 'An aggressive investigative journalist trying to whip up a scandal and curdle his career.' }] 
  },
  { 
    id: 'c95', 
    name: 'Dragon lord dominion', 
    backgroundColor: '#dbdac8', 
    description: 'A heroic, muscle-bound dragon and his fast-talking kobold accountant try to optimize the loot drops from their fantasy quests.',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects, clean linework, detailed monster design, cel-shaded coloring.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'dl95_1', name: 'Cinder', description: 'A heroic, heavily-muscled green dragon obsessed with optimizing his hoard\'s "loot stats."' }, { id: 'dl95_2', name: 'Dusty', description: 'A fast-talking kobold accountant constantly appraising the value of defeated enemies.' }] 
  },
  { 
    id: 'c96', 
    name: 'Zoofusion', 
    backgroundColor: '#dbdac8', 
    description: 'A mad scientist enthusiastically combines incompatible animals with a ray gun, creating exhausted, highly unstable mutant hybrids.',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects, clean linework, detailed monster design, cel-shaded coloring.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'zo96_1', name: 'Dr. Chimera', description: 'A mad scientist who enthusiastically mashes incompatible animals together using a ray gun.' }, { id: 'zo96_2', name: 'Duck-Bear', description: 'The exhausted, highly unstable result of a fusion, just trying to figure out what it eats.' }] 
  },
  { 
    id: 'c97', 
    name: 'Wimbleton willbright', 
    backgroundColor: '#dbdac8', 
    description: 'An over-enthusiastic wizard apprentice accidentally causes catastrophic neon magic explosions, exhausting his cel-shaded mentor.',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects, clean linework, detailed monster design, cel-shaded coloring.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ww97_1', name: 'Wimbleton', description: 'An overly enthusiastic wizard apprentice whose spells have catastrophic, neon-colored side effects.' }, { id: 'ww97_2', name: 'The Grand Mage', description: 'His deeply exhausted mentor who rubs his temples constantly in a cel-shaded world.' }] 
  },
  { 
    id: 'c98', 
    name: 'Elven looters', 
    backgroundColor: '#dbdac8', 
    description: 'A snobbish elf seeking museum artifacts and a pragmatic dwarf stealing copper wiring pillage fantasy dungeons together.',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects, clean linework, detailed monster design, cel-shaded coloring.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'el98_1', name: 'Fingolfin', description: 'A snobbish elf who refuses to steal anything less than museum-quality artifacts.' }, { id: 'el98_2', name: 'Borin', description: 'A pragmatic dwarf companion who will happily steal copper wiring if it pays for a pint.' }] 
  },
  { 
    id: 'c99', 
    name: 'Mutant city brawlers', 
    backgroundColor: '#dbdac8', 
    description: 'A massive concrete mutant who just wants to bake sourdough is blackmailed into underground fights by a corrupt cyborg mayor.',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects, clean linework, detailed monster design, cel-shaded coloring.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'mc99_1', name: 'Slammer', description: 'A massive mutant with concrete arms who hates fighting and just wants to open a bakery.' }, { id: 'mc99_2', name: 'The Mayor', description: 'A corrupt cyborg who forces Slammer into underground tournaments by threatening his sourdough.' }] 
  },
  { 
    id: 'c100', 
    name: 'Golden Harriet', 
    backgroundColor: '#dbdac8', 
    description: 'A plucky adventurer\'s golden touch ruins her life as a cynical appraiser constantly reminds her of the metal\'s crashing market value.',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects, clean linework, detailed monster design, cel-shaded coloring.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'gh100_1', name: 'Harriet', description: 'A plucky adventurer who turns everything she touches into solid gold, ruining her life.' }, { id: 'gh100_2', name: 'The Appraiser', description: 'A cynical pawn shop owner who points out that gold is losing its market value due to inflation.' }] 
  },
  { 
    id: 'c101', 
    name: 'The forest nation', 
    backgroundColor: '#dbdac8', 
    description: 'An ancient tree bureaucrat refuses to grant zoning permits to a highly caffeinated beaver trying to gentrify the riverbank.',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects, clean linework, detailed monster design, cel-shaded coloring.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'tf101_1', name: 'The Ent-King', description: 'A stubborn, ancient tree bureaucrat who refuses to grant zoning permits to the wildlife.' }, { id: 'tf101_2', name: 'The Developer', description: 'A highly caffeinated beaver in a hardhat trying to gentrify the riverbank.' }] 
  },
  { 
    id: 'c102', 
    name: 'Questeretta', 
    backgroundColor: '#dbdac8', 
    description: 'A hyper-energetic RPG protagonist breaks into homes seeking quests, terrorizing exhausted NPCs who only have three lines of dialogue.',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects, clean linework, detailed monster design, cel-shaded coloring.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'qu102_1', name: 'Questeretta', description: 'A hyper-energetic RPG protagonist who breaks into homes looking for side quests.' }, { id: 'qu102_2', name: 'The NPC', description: 'An exhausted villager who is forced to repeat the same three lines of dialogue forever.' }] 
  },
  { 
    id: 'c103', 
    name: 'Level up', 
    backgroundColor: '#dbdac8', 
    description: 'A mighty dragon is forced to grind low-level forest boars just to afford gear, much to the annoyance of the omnipotent Game Master.',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects, clean linework, detailed monster design, cel-shaded coloring.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'lu103_1', name: 'Cinder', description: 'The dragon, now stuck grinding low-level boars in the forest just to afford a new sword.' }, { id: 'lu103_2', name: 'The Game Master', description: 'A bored, omnipotent narrator rolling dice off-screen and sighing at Cinder\'s choices.' }] 
  },
  { 
    id: 'c104', 
    name: 'Cumberland gap curses', 
    backgroundColor: '#dbdac8', 
    description: 'A plucky 19th-century traveler weaponizes Appalachian curses to his advantage, deeply annoying the folklore hag who cast them.',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: '(Vibe modification) Classic adventure style but with a more textured, earthy color palette.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'cg104_1', name: 'Jebediah', description: 'A plucky 19th-century traveler highly persistent despite being burdened by hillbilly curses.' }, { id: 'cg104_2', name: 'The Gap Hag', description: 'An earthy folklore entity deeply annoyed that Jebediah is weaponizing her curses.' }] 
  },
  { 
    id: 'c105', 
    name: 'Super Marlo 3D', 
    backgroundColor: '#dbdac8', 
    description: 'A bootleg plumber with a 3D-glasses migraine tries to rescue a competent fruit vendor who just wants to run her business.',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: 'Chameleon Style. Perfectly mimics the media it parodies (e.g., 8-bit art or early 90s CGI; Super Marlo).', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'sm105_1', name: 'Marlo', description: 'A bootleg plumber trapped in a world requiring red/blue 3D glasses, giving him a migraine.' }, { id: 'sm105_2', name: 'Princess Substitute', description: 'A competent fruit vendor completely tired of getting "rescued" and wanting to run her business.' }] 
  },
  { 
    id: 'c106', 
    name: 'Droogs and Violet', 
    backgroundColor: '#dbdac8', 
    description: 'A hyper-violent, impeccably dressed delinquent who loves classical music drives her tired parole officer absolutely crazy.',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: '', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'da106_1', name: 'Violet', description: 'A hyper-violent but impeccably dressed delinquent who loves classical music and milk.' }, { id: 'da106_2', name: 'The Inspector', description: 'A tired parole officer who just wants Violet to stop smashing vintage teacups.' }] 
  },
  { 
    id: 'c107', 
    name: 'Captain Camero', 
    backgroundColor: '#dbdac8', 
    description: 'A broke superhero whose only power is turning into a faulty 1980s muscle car relies on his sidekick mechanic to keep him running.',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: '', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'cc107_1', name: 'The Captain', description: 'A superhero whose only power is transforming into a 1980s muscle car with a slipping transmission.' }, { id: 'cc107_2', name: 'Mechanic Mike', description: 'His exasperated sidekick who possesses the tools to constantly fix the Captain\'s spark plugs.' }] 
  },
  { 
    id: 'c108', 
    name: 'Lord Pizza Delivery', 
    backgroundColor: '#dbdac8', 
    description: 'A terrifying dark lord works a gig-economy delivery job to pay off his doom-fortress, dealing with terrible tips from stoned college students.',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: '', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'lp108_1', name: 'Zargoth', description: 'A terrifying dark lord forced to do gig-economy pizza delivery to pay off his doom-fortress.' }, { id: 'lp108_2', name: 'Customer 42', description: 'A stoned college student who tips in loose change and complains the crust isn\'t stuffed.' }] 
  },
  { 
    id: 'c109', 
    name: 'Mystery science comic', 
    backgroundColor: '#dbdac8', 
    description: 'The hero of a comic book develops severe insecurities because a silhouette at the bottom of the panel constantly critiques the artist\'s work.',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: '', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ms109_1', name: 'The Heckler', description: 'A silhouette at the bottom of the panel constantly critiquing the artist\'s line work.' }, { id: 'ms109_2', name: 'The Protagonist', description: 'The hero of the comic who gets insecure about his poorly-drawn hands because of the critiques.' }] 
  },
  { 
    id: 'c110', 
    name: 'DiE A LOG', 
    backgroundColor: '#dbdac8', 
    description: 'An empty speech bubble and an anxious erasing pencil desperately search for the perfect punchline to complete their comic panel.',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: '', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'da110_1', name: 'Blank Bubble', description: 'An empty speech bubble floating above characters, desperate for someone to write a good punchline.' }, { id: 'da110_2', name: 'The Editor', description: 'An anxious floating pencil that keeps erasing what people write because it "doesn\'t fit."' }] 
  },
  { 
    id: 'c111', 
    name: 'Screen sweeper', 
    backgroundColor: '#dbdac8', 
    description: 'A tired mouse-pointer janitor tries to clean up broken pixels while a sentient glitch tries to turn the digital trash into modern art.',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: '', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ss111_1', name: 'Cursor', description: 'A tired digital janitor shaped like a mouse pointer, sweeping up broken pixels.' }, { id: 'ss111_2', name: 'The Glitch', description: 'A corrupted file that refuses to be deleted and wants to make modern art out of digital trash.' }] 
  },
  { 
    id: 'c112', 
    name: 'Channel Flip', 
    backgroundColor: '#dbdac8', 
    description: 'A couch potato relies on a glowing remote to survive as his physical living room aggressively morphs to match whatever TV channel is on.',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: '', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'cf112_1', name: 'The Viewer', description: 'A couch potato whose physical living room morphs to match whatever channel is on TV.' }, { id: 'cf112_2', name: 'The Remote', description: 'A glowing device trying to keep him safe from landing on the True Crime network.' }] 
  },
  { 
    id: 'c113', 
    name: 'Family T shirt', 
    backgroundColor: '#dbdac8', 
    description: 'The loud, obnoxious front graphic of a vacation t-shirt constantly argues with the cynical, itchy neck tag that wants to be cut off.',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: '', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ft113_1', name: 'Big Print', description: 'The loud, obnoxious front graphic of a novelty vacation t-shirt shouting about "Beach Vibes."' }, { id: 'ft113_2', name: 'The Tag', description: 'An itchy, cynical entity on the back of the neck that just wants to be cut off.' }] 
  },
  { 
    id: 'c114', 
    name: 'Bohemian Breakdowns', 
    backgroundColor: '#dbdac8', 
    description: 'A melodramatic watercolor painter weeps over the emotional weight of colors while his blank canvas just begs for a job.',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels or moody wash colors. Borders missing; feels like a private sketchbook.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'bb114_1', name: 'The Artist', description: 'A melodramatic watercolor painter who weeps openly over the emotional weight of beige.' }, { id: 'bb114_2', name: 'The Canvas', description: 'A sentient blank canvas begging to be painted so it can finally get a job in a hotel.' }] 
  },
  { 
    id: 'c115', 
    name: 'Delicate life', 
    backgroundColor: '#dbdac8', 
    description: 'A fragile glass man navigates a heavy-handed world while dodging an aggressive bodyguard trying to wrap him in bubble wrap.',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels or moody wash colors. Borders missing; feels like a private sketchbook.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'dl115_1', name: 'The Glass Man', description: 'A fragile being made of beautifully spun glass, navigating a clumsy, heavy-handed world.' }, { id: 'dl115_2', name: 'The Bubble Wrap Salesman', description: 'An aggressive bodyguard who constantly tries to tape packaging material to him.' }] 
  },
  { 
    id: 'c116', 
    name: 'Musings in the dark', 
    backgroundColor: '#dbdac8', 
    description: 'A wide-awake insomniac overthinks past conversations, fueled by a pulsing brain that enthusiastically supplies worst-case scenarios.',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels or moody wash colors. Borders missing; feels like a private sketchbook.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'mi116_1', name: 'The Insomniac', description: 'A wide-awake pair of eyes in a pitch-black panel, overthinking a conversation from 2014.' }, { id: 'mi116_2', name: 'The Brain', description: 'A pulsing organ enthusiastically providing the Insomniac with worse-case scenarios.' }] 
  },
  { 
    id: 'c117', 
    name: 'Dire love', 
    backgroundColor: '#dbdac8', 
    description: 'A delicate shadow moth is fatally attracted to neon signs, while a flickering streetlight tries to talk it into finding a safe candle instead.',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels or moody wash colors. Borders missing; feels like a private sketchbook.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'dl117_1', name: 'The Moth', description: 'A delicate, shadowy figure fatally and romantically attracted to dangerous neon signs.' }, { id: 'dl117_2', name: 'The Bulb', description: 'A flickering, self-loathing streetlight trying to convince the moth to find a nice candle instead.' }] 
  },
  { 
    id: 'c118', 
    name: 'Homoside', 
    backgroundColor: '#dbdac8', 
    description: 'A glowing chalk outline of a body wants to get up and walk away, but a cynical rainstorm tries to wash it into accepting its temporary nature.',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels or moody wash colors. Borders missing; feels like a private sketchbook.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'ho118_1', name: 'The Chalk Outline', description: 'A glowing outline of a body that is tired of lying on the pavement and wants to walk away.' }, { id: 'ho118_2', name: 'The Rain', description: 'A cynical weather pattern slowly washing the Outline away, telling it to accept its temporary nature.' }] 
  },
  { 
    id: 'c119', 
    name: 'Vessel to vessel', 
    backgroundColor: '#dbdac8', 
    description: 'A message in a bottle believes its terrible poetry will change the world, but the indifferent ocean keeps washing it onto deserted rocks.',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels or moody wash colors. Borders missing; feels like a private sketchbook.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'vt119_1', name: 'The Message', description: 'A piece of parchment trapped in a bottle, convinced its bad poetry will change the world.' }, { id: 'vt119_2', name: 'The Ocean', description: 'A vast, indifferent body of water that keeps washing the bottle up on deserted rocks.' }] 
  },
  { 
    id: 'c120', 
    name: 'Insomnia', 
    backgroundColor: '#dbdac8', 
    description: 'An exhausted dream-sheep refuses to jump the fence anymore, arguing with the sleepy shepherd who keeps losing count.',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels or moody wash colors. Borders missing; feels like a private sketchbook.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'in120_1', name: 'The Sheep', description: 'An exhausted farm animal who is tired of jumping over the fence to be counted.' }, { id: 'in120_2', name: 'The Shepherd', description: 'A blurry figure in pajamas who keeps falling asleep on the job and losing track of the count.' }] 
  },
  { 
    id: 'c121', 
    name: 'Tom 👍', 
    backgroundColor: '#dbdac8', 
    description: 'A completely average guy whose hand is stuck in a thumbs-up navigates tragic, surreal world events that make his gesture look incredibly sarcastic.',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels or moody wash colors. Borders missing; feels like a private sketchbook.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 't121_1', name: 'Tom', description: 'A completely average guy whose hand is permanently stuck in a rigid thumbs-up gesture.' }, { id: 't121_2', name: 'The World', description: 'A series of tragic events unfolding around Tom, making his thumbs-up look incredibly sarcastic.' }] 
  },
  { 
    id: 'c122', 
    name: 'Behind the bars', 
    backgroundColor: '#dbdac8', 
    description: 'A cluster of barcode lines tries to break out of a product label, heavily guarded by the authoritarian red laser of the checkout scanner.',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels or moody wash colors. Borders missing; feels like a private sketchbook.', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'bt122_1', name: 'The Barcode', description: 'A cluster of black lines trying to break out of a product label to see the outside world.' }, { id: 'bt122_2', name: 'The Scanner', description: 'A harsh red laser that acts as the ultimate, unforgiving prison guard of the checkout aisle.' }] 
  },
  { 
    id: 'c123', 
    name: 'Purrgatory', 
    backgroundColor: '#dbdac8', 
    description: 'Purgatory for cats',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: '', 
    environment: 'TBD Environment', 
    environments: [], 
    panelCount: 3, 
    characters: [{ id: 'pu123_1', name: 'Mittens', description: '' }, { id: 'pu123_2', name: 'Sammy', description: '' }] 
  }
];

export const COMIC_FONTS = [
  { name: 'Comic Neue', family: '"Comic Neue", cursive' },
  { name: 'Permanent Marker', family: '"Permanent Marker", cursive' },
  { name: 'Bangers', family: '"Bangers", cursive' },
  { name: 'Amatic SC', family: '"Amatic SC", cursive' },
  { name: 'Annie Use Your Telesope', family: '"Annie Use Your Telescope", cursive' },
  { name: 'Boogaloo', family: '"Boogaloo", cursive' },
  { name: 'Creepster', family: '"Creepster", system-ui' },
  { name: 'Fredoka One', family: '"Fredoka One", cursive' },
  { name: 'Gloria Hallelujah', family: '"Gloria Hallelujah", cursive' },
  { name: 'Gochi Hand', family: '"Gochi Hand", cursive' },
  { name: 'Handlee', family: '"Handlee", cursive' },
  { name: 'Indie Flower', family: '"Indie Flower", cursive' },
  { name: 'Jolly Lodger', family: '"Jolly Lodger", system-ui' },
  { name: 'Just Me Again Down Here', family: '"Just Me Again Down Here", cursive' },
  { name: 'Kalam', family: '"Kalam", cursive' },
  { name: 'Luckiest Guy', family: '"Luckiest Guy", cursive' },
  { name: 'Mountains of Christmas', family: '"Mountains of Christmas", cursive' },
  { name: 'Nanum Pen Script', family: '"Nanum Pen Script", cursive' },
  { name: 'Neucha', family: '"Neucha", cursive' },
  { name: 'Patrick Hand', family: '"Patrick Hand", cursive' },
  { name: 'Rock Salt', family: '"Rock Salt", cursive' },
  { name: 'Schoolbell', family: '"Schoolbell", cursive' },
  { name: 'Shadows Into Light', family: '"Shadows Into Light", cursive' },
  { name: 'Special Elite', family: '"Special Elite", system-ui' },
  { name: 'Walter Turncoat', family: '"Walter Turncoat", cursive' },
  { name: 'Alatsi', family: '"Alatsi", sans-serif' },
  { name: 'Bowlby One SC', family: '"Bowlby One SC", cursive' },
  { name: 'Bubblegum Sans', family: '"Bubblegum Sans", cursive' },
  { name: 'Chewy', family: '"Chewy", cursive' },
  { name: 'Eater', family: '"Eater", cursive' },
  { name: 'Exo', family: '"Exo", sans-serif' },
  { name: 'Gruppo', family: '"Gruppo", cursive' },
  { name: 'Londrina Solid', family: '"Londrina Solid", cursive' },
  { name: 'Metal Mania', family: '"Metal Mania", cursive' },
  { name: 'Mochiy Pop One', family: '"Mochiy Pop One", sans-serif' },
  { name: 'Odor Mean Chey', family: '"Odor Mean Chey", cursive' },
  { name: 'Orbitron', family: '"Orbitron", sans-serif' },
  { name: 'Press Start 2P', family: '"Press Start 2P", system-ui' },
  { name: 'Righteous', family: '"Righteous", cursive' },
  { name: 'Rubik Mono One', family: '"Rubik Mono One", sans-serif' },
  { name: 'Tilt Warp', family: '"Tilt Warp", cursive' },
  { name: 'Titan One', family: '"Titan One", cursive' }
];

export const CANNED_CATEGORIES = [
  { name: 'Aggressive Apathy', emoji: '🙄' },
  { name: 'Existential Surrender', emoji: '💀' },
  { name: 'Mundane Pivot', emoji: '🤔' },
  { name: 'Petty Snark', emoji: '🤡' },
  { name: 'Onomatopoeia', emoji: '💥' }
];

export const CANNED_PHRASES_DATA: { category: string, placement: string, phrase: string }[] = [
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "I am already tired of whatever this is."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "Do I actually have to be here for this?"
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "I am putting my care meter exactly at zero."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "Look, my shift ended three minutes ago."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Let me stop you right there: I don't care."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "I am going to pretend I didn't see that."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Fascinating. Tell it to my spam folder."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Is there an unsubscribe link to this conversation?"
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "I do not get paid enough to deal with this."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "Please submit a ticket to IT."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "Cool. I am going to go stare at a wall now."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "I will file that under Things I Don't Care About."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "Why does the universe hate me specifically?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "Ah, the consequences of my own actions."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "I am 90 percent caffeine and 10 percent existential dread."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "Is this the bad place?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Of course this is happening."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Every choice I’ve ever made has led to this exact disaster."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "I would ask for a sign, but I probably couldn't read it."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Error 404: Motivation not found."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Just put me in the garbage where I belong."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "I accept my fate. Do your worst."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "And so, the simulation finally collapses."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Please reboot my consciousness."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Did anyone remember to feed the cat?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "I think I left the stove on."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Does anyone have a breath mint?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "I really hope I remembered to record my show."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "That is great, but you still owe me five bucks."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Are we still on for tacos later, or what?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Does this count as cardio?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Do you think this makes me look bloated?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "Okay, but who is going to clean this up?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "Did you keep the receipt for that?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "I am going to need that in an email."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "Anyway, how is your mother doing?"
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Your entire aesthetic is giving me a migraine."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "I see we are skipping basic logic today."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "I love what you have done with your ignorance."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Are you always this exhausting, or is today special?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "I would use smaller words, but I don't think it would help."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Are you taking notes? Because you really should be."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "I am not insulting you, I am describing you."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "If I throw a stick, will you leave?"
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "I love how you are just embracing being wrong today."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "I have seen better execution from a broken toaster."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "You are the reason we have warning labels."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "I am returning your nose. I found it in my business."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "Sigh."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "Gasp!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "Yawn."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "Ahem."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Blink. Blink."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Cricket noises."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Squelch!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Gulp."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Sad trombone noise."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Record scratch."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Thud."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Poof!"
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "I am emotionally unavailable for whatever this is."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "Wake me up when the world is actually ending."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "I have reached my daily limit of caring."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "This sounds like a problem for tomorrow me."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Wow, that is incredibly not my business."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "I am going to politely ignore everything you just did."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Please direct all inquiries to the brick wall behind me."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Mmhmm. Sure. Wow. So crazy."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "I am clocking out. Good luck with the chaos."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "If anyone needs me, I will be staring into the void."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "My shift is over and so is my patience."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "I am just going to walk backwards until I disappear."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "The universe is just openly mocking me now."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "I knew I should have stayed in bed this decade."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "This is exactly why I do not have hopes or dreams."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "I am ready to be abducted by aliens now."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "And the plot thickens into a disgusting sludge."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "I guess this is my life now."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Just throw me directly into the sun."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Everything is terrible and I want a refund."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "I welcome the sweet release of the end credits."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Cancel my subscription to reality."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "I will just lay here and let the moss claim me."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Please tell my Wi-Fi router I loved her."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Does this lighting make me look pale?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Has anyone seen my favorite spatula?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "I really need to renew my car registration."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Are those shoes comfortable for running away in?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Can we wrap this up? I have a pizza on the way."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Do you think it is going to rain later?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "I knew I should have worn layers today."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Remind me to pick up milk on the way home."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "So, are we still splitting the check?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "I am giving this experience a one-star review."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "Anyway, my fantasy football team is doing terrible."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "At least it is not a Monday."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Who dressed you, a blind raccoon?"
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Oh good, the village idiot has arrived."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "I was having a great day until you spoke."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Did you practice being this annoying, or is it natural?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "I am trying to see things from your perspective, but my head hurts."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "You are a walking advertisement for common sense."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "That was a brilliant thought. Who did you steal it from?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "I would clap, but I do not want to encourage you."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "May your Wi-Fi forever buffer."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "I hope you step on a very sharp Lego."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "You are the human equivalent of a typo."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "Please go be awful somewhere else."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "Ugh."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "Gack!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "Meh."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "Hiss!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Facepalm."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Whoosh."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Crunch."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Buzz."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Plop."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Wah-wah."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Bam!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Zzzzz."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "I would pretend to care, but I am too tired."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "Wake me up when this is over."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "I am actively ignoring this situation."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "You have mistaken me for someone who cares."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Wow, that sounds like a lot of work for you."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "I am going to let you finish that thought somewhere else."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Fascinating. Please tell a wall."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Let me know how that works out for you."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "I am officially resigning from this conversation."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "Good luck with whatever that was."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "I am going to walk away now and never look back."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "Unsubscribe."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "Hello darkness, my old friend."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "I am just a meat sack floating on a rock."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "Everything is pointless and my back hurts."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "Did I do something to anger the cosmos?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "The void is looking really cozy right now."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "I am mentally crawling under a blanket."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Just leave me here for the scavengers."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Why fight the inevitable tide of doom?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Bury me with my unresolved trauma."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "I am returning to dust now. Goodbye."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Let the abyss consume us all."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Check please. I am done with this timeline."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Did you know tomatoes are technically fruit?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "I really need a haircut."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Is it too early for a sandwich?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "I think I left my coupons in the car."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Do you prefer crunchy or smooth peanut butter?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "I should probably floss more often."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Wow, look at the time. I have nowhere to be."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Have you noticed how expensive cheese is lately?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "Anyway, I am going to go sort my socks."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "Let us circle back after I have a snack."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "So, how about that local sports team?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "I need to go water my plastic plants."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Did you fall asleep while dressing yourself today?"
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Oh, I see the clown car finally arrived."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Are you naturally this confusing or is it a hobby?"
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "I would agree with you, but then we would both be idiots."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Your train of thought must have derailed miles ago."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "It is cute how you think you are helping."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Do you ever listen to the words coming out of your mouth?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "I am taking away your talking privileges."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "May your socks always be slightly damp."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "I hope you lose your favorite pen."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "Do us all a favor and just stop."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "You are a walking typo."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "Phew."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "Grrrr."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "Eek!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "Hmm."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Sizzle."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Glug glug."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Zap!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Honk."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Splat."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Ding!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Whomp whomp."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Click."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Where’s the beef?"
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Pass me a candle, I'm about to light this place up."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "If laughter is the best medicine, is my doctor just a failed stand-up comedian?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Why do we press harder on the remote control when we know the batteries are weak?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Is it a secret workout for our fingers?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Do parallel universes have better Wi-Fi, or do they also suffer from endless loading screens?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "If procrastination were an Olympic sport, would I finally have a gold medal by now?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Why do we park on driveways and drive on parkways?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Is there a cosmic traffic planner with a sense of humor?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Is the refrigerator light really off when I close the door, or does it just throw the wildest parties in there?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If time is money, can I get a refund for all those hours spent trying to find my keys?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Why is 'abbreviation' such a long word? Are words trying to be ironic?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "If I'm talking to myself, am I having a team meeting or just a really exclusive solo brainstorming session?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "If life is a highway, why do I feel like I'm stuck in perpetual traffic with a broken GPS?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "If a cat's got nine lives, how many does it lose when it knocks a glass off the table?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Why is there no 'Ctrl+Z' in real life? I could use that feature for Monday mornings."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "If I had a dollar for every time someone called me lazy, I'd probably hire someone to count my money for me."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Do aliens visit Earth and go back home thinking, 'Well, that was weird'?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "If I had a superpower, it would be the ability to find things I've misplaced. Move over, invisibility!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "If Cinderella's shoe fit perfectly, why did it fall off in the first place?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Did the Fairy Godmother skip the measurements?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Why do we call it 'getting in shape' when round is a shape too, right?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "If laughter is contagious, why haven't I become a comedy tycoon by now?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Do spiders think humans are messy roommates who leave decorations on the ceiling?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If life is like a box of chocolates, why do I always end up with the one filled with nuts?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "If I had a dime for every time I lost my keys, would I finally be able to afford a key-finding butler?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Why do we say 'sleep like a baby' when babies wake up every two hours demanding attention?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "If I had a dollar for every brilliant idea I had in the shower, I'd be the Jeff Bezos of hygiene innovation."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Do clouds ever look down on us and think, \"Hey, that one looks like a potato\"?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Why is 'abbreviated' such a long word? Shouldn't it be abbrv8ed?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "If my dog could talk, would he spill all my secrets or just ask for more treats?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Why do we call it a 'shortcut' when taking a detour through a confusing maze of backstreets?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If life is a game, why does it feel like I'm playing Monopoly and landing on 'Go to Jail' all the time?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "If time flies when you're having fun, does it crawl when you're stuck in a boring meeting?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "If I were a detective, my first case would be solving the mystery of missing socks from the laundry."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "If I could time travel, would I go back to fix my mistakes or forward to see if I ever learn from them?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Why do we call it 'fast food' when the drive-thru line moves slower than a sloth on a coffee break?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If my bed could talk, would it say, \"You again? Back for another nap?\""
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Do aliens abduct humans for research, or are they just intergalactic tourists collecting souvenirs?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "If I could be any mythical creature, would I choose a dragon for the fire-breathing or a unicorn for the stylish horn?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Why do we say 'heads up' when we're about to throw something at someone's face? Shouldn't it be 'heads down'?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If my life were a movie, would it be a blockbuster or a straight-to-DVD comedy?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Why do we press harder on the elevator button when it's already been pressed? Is impatience an Olympic sport?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If my GPS had a sense of humor, would it tell me, \"You have arrived...at the wrong address\"?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If laughter is the key to a happy life, why don't I have a Nobel Prize in Comedy yet?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "Welcome to the circus of my mind, where even the elephants have PhDs in chaos theory."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "Step right up and witness the spectacular spectacle of my daily life – it's like a rollercoaster, but with more snacks and fewer safety measures."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "In the grand sitcom of my existence, I play all the roles and none of them particularly well."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "Enjoy the show!"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Life is a comedy, and I'm the punchline trying to set up a knock-knock joke."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "They say laughter is the best medicine, but my life is a pharmacy of hilarity."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Side effects may include snorting and tears of joy."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Grab a front-row seat to the circus of my existence – popcorn optional, laughter mandatory."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If life gives you lemons, make a lemonade stand at the intersection of Chaos Street and Absurdity Avenue."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "I've mastered the art of adulting: it's like juggling, but with bills, responsibilities, and the occasional existential crisis."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Greetings, Earthlings!"
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "Prepare to be entertained by the extraterrestrial absurdity that is my daily existence."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Step into my world, where the only thing more unpredictable than the plot is the punchline."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Spoiler alert: there isn't one."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Why does my cat think knocking things off the table is a valid form of communication?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "If my cat had a resume, would 'professional napper' be listed as a skill?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Why does my cat stare at me like I'm the strange one when I interrupt her 18-hour nap?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "If my cat could talk, would she critique my fashion choices or demand more treats?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Why does my cat act like she's auditioning for a gymnastics competition when she's chasing a tiny ball?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Does my cat believe she's the CEO of the household, or is she just a benevolent dictator?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "If my cat wrote a self-help book, would it be titled \"The Zen of Napping\"?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Why does my cat look at me like I've betrayed her when I bring out the dreaded vacuum cleaner?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "If my cat hosted a cooking show, would it involve knocking ingredients off the counter and staring at the oven until it cooked itself?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "Does my cat think I'm a terrible hunter because I can never catch the elusive red dot?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Why do vampires never need dental work, considering their eternal commitment to biting?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "If a vampire goes to therapy, is it considered a 'bite-sized' session?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Do vampires ever get annoyed by the garlic bread smell at Italian restaurants, or is it just a tasty reminder of their weaknesses?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "If a vampire became a stand-up comedian, would his jokes suck the life out of the audience?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Do vampires have a 'night shift' at blood banks, or is that too on the nose?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "If a priest and a vampire opened a bakery together, would their slogan be \"Bite into Holiness\"?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "Can a vampire attend a beach party, or is SPF forever out of their league?"
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Why do vampires always seem to choose the most dramatic entrances? Is subtlety not in their undead handbook?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "If a vampire decided to become a vegetarian, would they crave the taste of rare tomatoes?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Do vampires get irked when people assume they can transform into bats at will, or is it just a bat-misunderstanding?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "If music be the food of love, does that mean my fridge is a symphony?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Why do we sing in the shower, and more importantly, does the shampoo bottle enjoy the encore?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If life had a soundtrack, would my theme song be a comedy or a tragedy?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Why do musicians always seem to have the best hair? Is it a secret skill learned at music school?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "Can I blame my terrible dance moves on a malfunctioning rhythm detector?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "If I plant a question, will it grow into a tree of wisdom or just a shrub of confusion?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Do birds get annoyed when humans try to sing along, or do they appreciate the attempted duet?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "If my car radio had a mind of its own, would it be a DJ or a rebellious teenager constantly changing the station?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Why does my cat look at me like I've lost my mind every time I attempt to serenade her?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "Can I officially claim \"air guitar virtuoso\" as a hidden talent on my resume?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Why do song lyrics become deeply profound when I'm in the shower but turn into gibberish when I try to sing them in public?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If music could solve world problems, would we just need a global jukebox?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Do headphones double as a \"Do Not Disturb\" sign, or do people enjoy interrupting a musical moment?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "Can I blame my inability to remember names on having too many catchy tunes stuck in my head?"
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Why do musicians always look so mysterious in their album covers? Is there a secret handbook for brooding poses?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "If life were a musical, would my neighbors appreciate my spontaneous bursts into song, or would they start a petition for silence?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Can I hire a personal soundtrack composer to follow me around and make every moment more epic?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "Do air drums count as a valid form of exercise, or am I just fooling myself?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "If a tree falls in a forest and there's no one around to hear it, does it make a sound?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "And more importantly, what genre would it be?"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "Can I blame my messy room on the fact that organizing my CDs takes priority over cleaning?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "If life is a journey, can I take the scenic route even if I have no sense of direction?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "Why do we call it a \"midlife crisis\"? Is there a quarterly report on happiness I missed?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If time is money, can I get a refund for all those hours spent contemplating the meaning of life?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Is the universe expanding, or is it just having commitment issues?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If I discover the meaning of life, do I win a prize, or is it just a participation trophy?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Can I blame my existential dread on the weather, or is it an all-season, all-weather condition?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "If a tree falls in a forest and no one hears it, does it still question its purpose?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "Is life a comedy, tragedy, or just a really confusing improv show?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If I find the meaning of life in a fortune cookie, should I take it seriously or order another plate of sweet and sour chicken?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Is the glass half full, half empty, or just experiencing an identity crisis?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "If I question the meaning of existence while eating pizza, does it make the pizza more profound or just cheesier?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "Why do we search for the meaning of life on Google when we know it's just going to lead to more questions?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Can I use my existential crisis as a valid excuse for not doing laundry, or is that just a laundry list of excuses?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "If I'm lost in thought, should I leave breadcrumbs or follow the trail of deep pondering?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "If life is a puzzle, am I missing a few pieces or did I accidentally assemble it upside down?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Is the pursuit of happiness a marathon or a never-ending game of hide-and-seek?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "If time is an illusion, does that mean I can show up late without consequences?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Can I blame my procrastination on the philosophical debate of whether time is linear or just a messy ball of wibbly-wobbly, timey-wimey stuff?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If I find inner peace but still can't find my car keys, did I really find inner peace?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Is the meaning of life at the bottom of a coffee cup, or am I just addicted to caffeine and existential crises?"
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "I don't know but I've been told..."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "If my life had a theme song, it would be a mix of circus music and the Benny Hill theme."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "I'm not lazy; I'm in energy-saving mode."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Note to self: next time, read the fine print of adulthood before signing up."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "My to-do list is longer than a CVS receipt, and just as confusing."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "My superpower? Procrastination."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "I can save the world, just not today."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "I'm not lost; I'm on an unplanned adventure through the scenic route of life."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If my cat wrote a memoir, it would be titled \"My Human: A Comedy of Errors.\""
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Life's a puzzle, and I'm missing a few crucial pieces. No wonder it doesn't make sense."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "My life is like a romantic comedy, minus the romance and more awkward pauses."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "If I were a detective, my signature move would be losing the case file."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "I've reached the level of multitasking where I can make mistakes in multiple ways simultaneously."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "My idea of a balanced diet is a cupcake in each hand."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If my plants could talk, they'd probably request a new gardener."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "I'm not a morning person or a night owl; I'm more of a perpetually exhausted pigeon."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "My dance moves are so legendary that they're still waiting to be discovered by the rest of humanity."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "My autobiography would be titled \"Life: A Comedy of Terrors.\""
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "I have a black belt in karate, but it's more of a fashion statement than a combat skill."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If common sense were a superpower, I'd be the superhero the world never knew it needed."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "My level of adulting is somewhere between knowing how to pay bills and calling my mom to ask how to pay bills."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "I'm not indecisive; I'm just exploring all the options before making the wrong choice."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If overthinking were an Olympic sport, I'd have a gold medal, three silvers, and a bronze by now."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "My kitchen skills are so elite that I once burnt water while attempting to boil it."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "I'm not a chef; I just play one in my microwave's fantasy world."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "My life is like a sitcom, and every day is a new episode of \"Oops, I did it again.\""
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "If my phone could talk, it would probably request therapy for the trauma of witnessing my awkward text messages."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "I'm not lazy; I'm in energy-saving mode. Wait, did I say that already? Well, it's still true."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "My sense of direction is so bad that even my GPS has trust issues."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "I'm not aging; I'm gaining XP in the game of life. Too bad the rewards are just gray hairs and wrinkles."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "I'm not lazy, just on a permanent coffee break."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "My plants think I'm a botanist for how well I ignore them."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "I'm not forgetful; I'm just creating surprise memories."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "I'm not clumsy; the floor just enjoys playing catch with my feet."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "I'm not indecisive; I'm just exploring all the wrong options."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "I'm not short; I'm vertically efficient."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "I'm on a seafood diet. I see food and eat it. Mostly tacos."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "I'm not disorganized; I have a unique filing system called 'organized chaos.'"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "I'm not a control freak; I just have a better plan."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "I have a black belt in karate, but it's mostly decorative."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "I'm not a morning person; I'm more of a 'give me five more minutes' person."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "I'm not aging; I'm just increasing my wisdom highlights."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "I'm not a chef; I'm a culinary improviser."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "I'm not a night owl; I'm a midnight snack enthusiast."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "I'm not a superhero; I just excel at napping."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "I'm not antisocial; I'm just on a solo vacation from reality."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "I'm not procrastinating; I'm giving my ideas time to marinate."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "I'm not a superhero; I just have a super appetite."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Can anyone become a critic or do you have to have a natural disliking of all things?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "I need a way to preserve all my thoughts in stone."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "Whatever you can squeeze out, I'll drink"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Nailed it."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Butt of coarse fine prince."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Looks like my life is sponsored by Murphy's Law – if something can go wrong, it will."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Forget adulting, I'm applying for a refund. This is not what I signed up for."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "I'm going to kiss you violently."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Opener",
    "phrase": "Keep up the great work!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "The Mario in my head is saying, \"Let's a go!\"."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "Believe in yourself. Otherwise you're capable of amazing mistakes."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Don't give up; you're closer than you think."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Closer",
    "phrase": "Just keep trucking and F#c#ing"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "You're doing better than you realize."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Stay positive; you're on the right track."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Keep pushing forward; you're unstoppable!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "You're stronger than you know; keep shining!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "You've got what it takes; keep believing in yourself."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "You're making a difference; keep up the good work."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Trust in yourself; you've got this under control."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Keep going; you're doing fantastic!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "You're on your way to greatness; keep moving forward."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Your hard work is inspiring; keep it up!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "You're capable of achieving anything you set your mind to."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Keep chasing your dreams; you're closer than ever."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Your determination is admirable; keep going strong!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "You're on the path to success; keep believing in yourself."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, butter my biscuit and call me a muffin!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, tickle me pink and call me a flamingo!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, slap me with a feather and call me a chicken!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, paint me green and call me a pickle!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, slap me with a fish and call me sushi!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, tie me to an antelope and call me a backpack!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, dip me in honey and call me a bear!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, wrap me in bacon and call me an inside out pig!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, flatten my tires and call me a tow!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, tickle my toes and call me a Teletubby!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, whisk me away and call me an omelette!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, pour me a cup of tea and call me a doctor."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, stack me like pancakes and call me breakfast!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, bounce me like a ball and call me bouncy!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, swirl me like spaghetti and call me tangled!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, douse me in glitter and call me fabulous!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, toss me in the air and call me airborne!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, roll me like a dice and call me lucky!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, bury me in sand and call me a beach bum!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, dress me in polka dots and call me dotty!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Well, scratch me behind the ears and call me purr-fect!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Slap me with a pancake and call me flapjack!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Wrap me in seaweed and call me a sushi roll!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Dunk me in chocolate and call me a truffle!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Toss me in the air and call me a frisbee!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Stick me to a wall and call me wallpaper!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Tickle me with a feather and call me ticklish!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Drape me in curtains and call me a window!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Balance me on a ball and call me a circus act!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Put me on a shelf and call me a knickknack!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Hang me from a tree and call me a swing!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Drop me in a bucket and call me a drop in the ocean!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Roll me in flour and call me a dumpling!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Spin me like a top and call me dizzy!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Bury me in sand and call me a beachcomber!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Tangle me in yarn and call me a cat's cradle!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Freeze me in ice and call me a popsicle!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Stuff me in a suitcase and call me an adventurer!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Wrap me in a blanket and call me a burrito!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Stick me in a bubble and call me a bubble wrap!"
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Toss me in the air and call me a confetti!"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If I find the meaning of life in a fortune cookie, is it destiny or just dessert?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "If time is a social construct, can I be fashionably late to my existential crisis?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Existentialism: where every 'why' leads to another 'why' in an infinite loop."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Is the universe expanding, or is it just giving itself more room for an existential meltdown?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "If I'm lost in thought, should I leave breadcrumbs or follow the trail of deep pondering?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Why does my coffee understand my need for existential contemplation better than most people?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If life is a sitcom, my laugh track is on an extended coffee break."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Can I blame my procrastination on the philosophical debate of whether time is linear or just a messy ball of wibbly-wobbly, timey-wimey stuff?"
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Do I look like I'm listening to you, because I'm trying very hard to male it look like it."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "No!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "No. No, no, no, no, no, no. NO!... Ok."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "Garbage can of the universe. At least that's what I'm told."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Did you get lost on your way to common sense?"
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "If stupidity were an Olympic sport, you'd be a gold medalist."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "I'd call you a tool, but at least tools serve a purpose."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Your intelligence called, it wants a divorce from you."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Are you always this dense, or are you making a special effort today?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "If you were any slower, you'd be going backward."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "It's a good thing you're not paid for thinking; you'd be bankrupt."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Did you swallow a dictionary or do you just enjoy sounding like a fool?"
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "You're like a broken record – annoying and stuck on repeat."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Do you ever wonder what life is like for those who actually use their brains?"
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "If stupidity were a superpower, you'd be the world's mightiest hero."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "I'd tell you to take a mental vacation, but I think you're already there."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "You're not the sharpest tool in the shed, but at least you're consistent."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "If ignorance is bliss, you must be in a constant state of euphoria."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Did you fall from heaven? Because it looks like you landed on your head."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "I'd insult you, but you seem to be doing a fine job of it yourself."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "You must have a PhD in idiocy with all the expertise you display."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "You're like a human vending machine – full of snacks but lacking in substance."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Did you run out of brain cells, or were you born with a deficit?"
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "If brains were taxed, you'd get a refund for being exempt."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Do you have a license for that level of incompetence?"
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Are you the president of the Dullsville Chamber of Commerce?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "You're a few fries short of a Happy Meal, aren't you?"
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "You're like a broken clock – right twice a day, but still useless."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Do you need a GPS to find your own thoughts?"
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Are you auditioning for the role of village idiot, or is it a natural talent?"
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "Congratulations, you've reached the pinnacle of dumbness."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Did you take a wrong turn on the highway of intelligence and end up in Dumbville?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "You're not the brightest bulb in the box, are you?"
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Are you allergic to logic or just immune to common sense?"
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "If stupidity were a currency, you'd be filthy rich."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Did you forget to upgrade your brain's software?"
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "You're like a black hole for intelligence – everything gets sucked in and never escapes."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Did you skip the IQ test and go straight to the stupidity contest?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "You're not the full picnic basket, are you?"
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "If brains were dynamite, you wouldn't have enough to blow your nose."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Did you fall off the dumb tree and hit every branch on the way down?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "You're not the brightest bulb in the chandelier, are you?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "You must be allergic to knowledge, because you seem to avoid it at all costs."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "If ignorance is bliss, you must be the happiest person alive."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Oh, congratulations, Captain Obvious!"
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Well, aren't you just a ray of sunshine?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Oh, forgive me for not realizing you were the expert on everything."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "Wow, your wit is as sharp as a butter knife."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Oh, sorry, I must have confused you with someone who actually cares."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "And here I thought we were having a conversation, but it seems I was mistaken."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Oh, please, enlighten us all with your vast wisdom."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Well, isn't that just the most fascinating thing I've ever heard?"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "(eye roll)"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Oh, my mistake, I didn't realize sarcasm was your second language."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Oh, the sarcasm is strong with this one."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Oh, pardon me for interrupting your soliloquy of brilliance."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "Well, aren't you just a fountain of originality?"
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Oh, look, it's the mayor of Sarcasm City!"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Oh, forgive me for not bowing down to your unparalleled intellect."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "Well, I must say, your grasp of the obvious is truly awe-inspiring."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Oh, I didn't realize we were playing the game of 'Who Can Be the Most Sarcastic.'"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Oh, how could I have missed your subtle and nuanced commentary?"
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Well, aren't you just a regular comedian?"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "(eye roll)"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "Oh, I see, you've been appointed the official spokesperson for Sarcasm Incorporated."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Well, color me impressed."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "And by 'impressed,' I mean 'not impressed at all.'"
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "Big deal, mine is the size of a trout."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "You should quit now. While everyone else is ahead and no one will notice you're gone."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Let me introduce you to my little friend."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "You're killing it."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Well, that's my daily dose of chaos."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Another day survived; they should give out medals for this."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "And that's a wrap on today's circus performance."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Stay tuned for more thrilling episodes of 'Adventures in Absurdity.'"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Life's a comedy, and I'm the punchline."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Until next time, keep laughing at life's absurdity."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "And scene. Fade to black. Or maybe just a shade of grey."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "That's all for today's rollercoaster ride; hope you didn't lose your lunch."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "The end – or is it just the beginning of another sitcom episode?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "And that, my friends, is how you expertly navigate the maze of daily madness."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Plot twist: I still have no idea what I'm doing."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "Time for a coffee break."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "That's it for today's comedy hour; I'll be here all week, unfortunately."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Another day conquered, or maybe just survived—details are fuzzy."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Cue the credits. If only life had a fast forward button."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Fin. Or as I like to call it, the grand finale of my daily sitcom."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "The saga continues... because apparently, life has no season finale."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "And that, my friends, is how you turn a routine task into a three-act play."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "That's a wrap!"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "If life were a movie, I'd be asking for a refund."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Exit stage right, pursued by a sense of impending doom."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "The credits are rolling, but the bloopers reel never stops."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "That's all for today's episode of 'How Not to Adult.'"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "And scene, but the drama of my life is an ongoing series."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Curtain call – because even my daily routine deserves applause."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Another day, another opportunity for life to surprise me."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "And that concludes today's masterclass in controlled chaos."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Fade out, but the chaos lingers like a cliffhanger."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "That's a wrap, but the sequel is just a snooze away."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "The end... until tomorrow hits the play button again."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "And with that, I bid adieu to today's episode of 'Life Unscripted.'"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Ta-da!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "Oops!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Tomorrow..."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Seriously?"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Finale!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Chaos!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Epic!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Tada!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "Jazzed!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Next!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Poof!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Kaboom!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Hilarious!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Tangled!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Nailed it!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Vanished!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Shazam!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Puzzled!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Chaos!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Tomorrow!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Outro!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Encore!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Quirky!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Laughs!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Victory!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Unbelievable!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Whew!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Loop!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Wacky!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Mystery!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Bam!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Sizzle!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Kaboom!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Yikes!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Zing!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Pop!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Crunch!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Bang!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Swish!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Whoosh!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Gulp!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Bonk!"
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Uh... uh huh."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "The dude abides."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Slapadoodle!"
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "I’d agree with you, but then we’d both be wrong."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "Oh, look. My care meter is at zero."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Is there an unsubscribe link to this conversation?"
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "I’ll file that under Things I Don't Care About."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Fascinating."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Tell it to my spam folder."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "I’m practicing my listening face."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "This sounds like a you problem."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Cool story, bro."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "Needs more dragons."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Opener",
    "phrase": "I’m emotionally exhausted just looking at you."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Let me check my schedule... nope, no time for this."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "My inner child just rolled its eyes."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Bridger",
    "phrase": "Wow. Changing my life right now."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "I’d explain it to you, but I don't have crayons."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "Are you always this exhausting, or is today special?"
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "If I throw a stick, will you leave?"
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "You’re the reason we have warning labels."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "I’m returning your nose."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "I found it in my business."
  },
  {
    "category": "Petty Snark",
    "placement": "Opener",
    "phrase": "I love what you’ve done with your ignorance."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "Somewhere, a tree is working hard to produce the oxygen you’re wasting."
  },
  {
    "category": "Petty Snark",
    "placement": "Bridger",
    "phrase": "I’m not insulting you, I’m describing you."
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "I’ve been called worse things by better people."
  },
  {
    "category": "Aggressive Apathy",
    "placement": "Closer",
    "phrase": "I don’t have the energy to pretend I like you today."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "And that’s why we can’t have nice things!"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Release the hounds!"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "To the escape pod!"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "I refuse to participate in this reality!"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Cancel all my appointments!"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "I have a sudden urge to flee the country."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "I demand a recount!"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "My lawyer will be in touch."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "This wasn’t in the brochure!"
  },
  {
    "category": "Petty Snark",
    "placement": "Closer",
    "phrase": "Acknowledge my brilliance!"
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "I blame the government."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Error 404: Motivation not found."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "Is this the bad place?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "I’m just a series of awkward moments strung together."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "My last brain cell is crying."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "I need a nap, or a new identity."
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "I’m 90% caffeine and 10% existential dread."
  },
  {
    "category": "Existential Surrender",
    "placement": "Closer",
    "phrase": "Please reboot my consciousness."
  },
  {
    "category": "Mundane Pivot",
    "placement": "Bridger",
    "phrase": "Does this count as cardio?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Is it too late to be an astronaut instead?"
  },
  {
    "category": "Existential Surrender",
    "placement": "Opener",
    "phrase": "I am currently unsupervised."
  },
  {
    "category": "Existential Surrender",
    "placement": "Bridger",
    "phrase": "Proceed with caution."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Yoink!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Blorp!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Sploosh!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Boop!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Zorp!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Pew pew pew!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Sad trombone noise."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Record scratch."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Squelch!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Ker-plunk!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Thwack!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Bridger",
    "phrase": "Pffft."
  },
  {
    "category": "Onomatopoeia",
    "placement": "Opener",
    "phrase": "Gadzooks!"
  },
  {
    "category": "Onomatopoeia",
    "placement": "Closer",
    "phrase": "Zonk!"
  }
];

