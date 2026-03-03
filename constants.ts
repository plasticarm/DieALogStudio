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
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'High-contrast black and white ink noir, detective silhouettes, gritty textures', 
    environment: 'Rainy city streets with neon reflections', 
    environments: [{id:'e1', name:'Rainy Alley', description:'Gritty alley with puddles'}, {id:'e2', name:'Private Eye Office', description:'Shadowy office with blinds'}], 
    panelCount: 3, 
    characters: [{ id: 'nw1', name: 'Detective Paws', description: 'Tabby cat in a trench coat' }, {id:'nw2', name:'The Catnip King', description:'Fat Persian with gold chain'}] 
  },
  { 
    id: 'c2', 
    name: 'Cubicle Quest', 
    backgroundColor: '#dbdac8', 
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Isometric office art, vibrant corporate colors, vector lines', 
    environment: 'Maze of grey cubicles', 
    environments: [{id:'e3', name:'The Maze', description:'Infinite grey cubicles'}], 
    panelCount: 3, 
    characters: [{ id: 'cq1', name: 'Greg from IT', description: 'Weary man with error mug' }, { id: 'cq2', name: 'The Manager', description: 'Floating suit with red tie' }] 
  },
  { 
    id: 'c3', 
    name: 'Galaxy Banal', 
    backgroundColor: '#dbdac8', 
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Retro-futurism, 70s sci-fi aesthetic, grainy film texture', 
    environment: 'Space station breakroom', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'gb1', name:'Pilot Pete', description:'Burrito eating human'}, {id:'gb2', name:'Zorg', description:'Alien in safety vest'}] 
  },
  { 
    id: 'c4', 
    name: 'Toddler Doom', 
    backgroundColor: '#dbdac8', 
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Bright crayon colors, chaotic scribbles, child-like painting', 
    environment: 'Messy playroom war zone', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'td1', name:'General Timmy', description:'Toddler with colander helmet'}, {id:'td2', name:'Sgt. Sparky', description:'Damaged stuffed dog'}] 
  },
  { 
    id: 'c5', 
    name: 'Unholy Roommates', 
    backgroundColor: '#dbdac8', 
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Gritty indie webcomic, heavy ink, psychedelic blacklight colors', 
    environment: 'Filthy shared apartment living room', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'ur1', name:'Father John', description:'Stressed priest in cassock'}, {id:'ur2', name:'Vlad', description:'Cool vampire in leather jacket'}] 
  },
  { 
    id: 'c6', 
    name: 'Squeak & Destroy', 
    backgroundColor: '#dbdac8', 
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'Epic fantasy, miniature scale, detailed fur and armor', 
    environment: 'Household item battlefield', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'sd1', name:'Sir Squeaksalot', description:'Mouse in bottlecap armor'}, {id:'sd2', name:'The Rat King', description:'Scarred rat with toothpick sword'}] 
  },
  { 
    id: 'c7', 
    name: 'Hell’s Helpdesk', 
    backgroundColor: '#dbdac8', 
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Fiery palette, jagged lines, demonic tech aesthetic', 
    environment: 'IT office in magma pits', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'hh1', name:'Lucifer', description:'CEO in sharp suit'}, {id:'hh2', name:'Imp 404', description:'Glitching blue demon'}] 
  },
  { 
    id: 'c8', 
    name: 'The Bozo Nostra', 
    backgroundColor: '#dbdac8', 
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Vintage circus meets 1920s mobsters, desaturated reds', 
    environment: 'Circus tent backroom', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'bn1', name:'Don Chuckles', description:'Scary clown mobster'}, {id:'bn2', name:'Squeaky', description:'Mime with balloon gun'}] 
  },
  { 
    id: 'c9', 
    name: 'Impact Zone', 
    backgroundColor: '#dbdac8', 
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Dynamic action manga, speed lines, high energy', 
    environment: 'Futuristic skate park', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'iz1', name:'Jax', description:'Cyborg skater'}, {id:'iz2', name:'Robo-Ref', description:'Hovering drone whistle'}] 
  },
  { 
    id: 'c10', 
    name: 'Hoard Less', 
    backgroundColor: '#dbdac8', 
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'Storybook watercolor, soft edges, whimsical', 
    environment: 'Dragon cave with IKEA bins', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'hl1', name:'Cinder', description:'Minimalist dragon'}, {id:'hl2', name:'Dusty', description:'Kobold butler with labels'}] 
  },
  { 
    id: 'c11', 
    name: 'Grim Life', 
    backgroundColor: '#dbdac8', 
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Minimalist line art, monochromatic with color pop', 
    environment: 'DMV afterlife waiting room', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'gl1', name:'Grim', description:'Skeleton in hoodie'}, {id:'gl2', name:'Mrs. Higgins', description:'Stubborn ghost lady'}] 
  },
  { 
    id: 'c12', 
    name: 'Capes on the Couch', 
    backgroundColor: '#dbdac8', 
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: 'Silver age comic, Ben-Day dots, dramatic poses', 
    environment: 'Therapist office', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'cc1', name:'UltraMan', description:'Crying muscular hero'}, {id:'cc2', name:'Dr. Mind', description:'Brain in a jar'}] 
  },
  { 
    id: 'c13', 
    name: 'Stone Cold Idiots', 
    backgroundColor: '#dbdac8', 
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Prehistoric stone-carving texture, rough edges', 
    environment: 'Cave with wall paintings', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'si1', name:'Oog', description:'Inventor of square wheel'}, {id:'si2', name:'Boog', description:'Confused club holder'}] 
  },
  { 
    id: 'c14', 
    name: 'The Totally Normal Johnsons', 
    backgroundColor: '#dbdac8', 
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: '50s sitcom technicolor, uncanny perfection', 
    environment: 'Pristine suburban kitchen', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'tj1', name:'Bob', description:'Alien in human mask'}, {id:'tj2', name:'Linda', description:'Alien in floral dress'}] 
  },
  { 
    id: 'c15', 
    name: 'Pulse & Impulse', 
    backgroundColor: '#dbdac8', 
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Cyberpunk neon, glitch effects, tech-noir', 
    environment: 'Rainy neon alleyway', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'pi1', name:'Pulse', description:'Hacker with cable hair'}, {id:'pi2', name:'Impulse', description:'Robot dog with screen face'}] 
  },
  { 
    id: 'c16', 
    name: 'Upload Complete', 
    backgroundColor: '#dbdac8', 
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Digital grid, holographic, blue and white', 
    environment: 'Data void', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'uc1', name:'User 001', description:'Pixelated avatar'}, {id:'uc2', name:'The Admin', description:'Giant binary eye'}] 
  },
  { 
    id: 'c17', 
    name: 'Trash Talk', 
    backgroundColor: '#dbdac8', 
    category: 'Category 1: Anthropomorphic',
    artStyle: 'Gritty textures, muted colors, personified objects', 
    environment: 'Bottom of a dumpster', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'tt1', name:'Canny', description:'Crushed soda can'}, {id:'tt2', name:'Peely', description:'Cool banana peel'}] 
  },
  { 
    id: 'c18', 
    name: 'Web of Lies', 
    backgroundColor: '#dbdac8', 
    category: 'Category 1: Anthropomorphic',
    artStyle: 'Macro photography style, shallow depth of field', 
    environment: 'Dusty attic corner', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'wl1', name:'Spin', description:'Spider in fedora'}, {id:'wl2', name:'Buzz', description:'Nervous fly'}] 
  },
  { 
    id: 'c19', 
    name: 'Sofa, So Good', 
    backgroundColor: '#dbdac8', 
    category: 'Category 1: Anthropomorphic',
    artStyle: 'Living furniture aesthetic, soft pastel textures', 
    environment: 'Cozy living room night', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'sg1', name:'Cushy', description:'Plump sentient cushion'}, {id:'sg2', name:'Clicker', description:'Hiding remote'}] 
  },
  { 
    id: 'c20', 
    name: 'Meat Cute', 
    backgroundColor: '#dbdac8', 
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Horror-comedy, bright butcher reds, grotesque', 
    environment: 'Steakhouse kitchen', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'mc1', name:'T-Bone', description:'Steak with googly eyes'}, {id:'mc2', name:'The Cleaver', description:'Sentient knife'}] 
  },
  { 
    id: 'c21', 
    name: 'The Nuts Gang', 
    backgroundColor: '#dbdac8', 
    category: 'Category 1: Anthropomorphic',
    artStyle: 'Nature documentary, heist film aesthetic', 
    environment: 'Park bench close-up', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'ng1', name:'Acorn', description:'Squirrel thief'}, {id:'ng2', name:'The Pigeon', description:'Lookout bird'}] 
  },
  { 
    id: 'c22', 
    name: 'Pond Buddies', 
    backgroundColor: '#dbdac8', 
    category: 'Category 1: Anthropomorphic',
    artStyle: 'Soft charcoal and gouache, peaceful green', 
    environment: 'Sunlit lily pond', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'pb1', name:'Froppy', description:'Optimistic frog'}, {id:'pb2', name:'Shell', description:'Slow turtle'}] 
  },
  // New Spreadsheet Comics
  {
    id: 's1',
    name: 'Can openers',
    category: 'Category 1: Anthropomorphic',
    styleDescription: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines. Objects bend, stretch, and sweat despite being made of metal or food.',
    archetypes: 'Neurotic Everyday Objects. Defined by their functions; dread being used up, broken, or ignored. Example: Spaghetti TED is a long strand of pasta terrified of boiling water, trying to talk the fork out of twirling him.',
    artStyle: 'Sunday Funnies meets Surrealism',
    environment: 'Kitchen drawer',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 's1c1', name: 'Cracker', description: 'An ancient, manual can opener who is dull and rusty, living in mortal fear of electric openers.' },
      { id: 's1c2', name: 'Tuna Tin', description: 'A smooth, confident can of tuna who has accepted her fate and just wants him to twist.' }
    ]
  },
  {
    id: 's2',
    name: 'Flimsy Whimsy',
    category: 'Category 1: Anthropomorphic',
    styleDescription: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines. Objects bend, stretch, and sweat despite being made of metal or food.',
    archetypes: 'Neurotic Everyday Objects. Defined by their functions; dread being used up, broken, or ignored.',
    artStyle: 'Sunday Funnies meets Surrealism',
    environment: 'A breezy garden',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 's2c1', name: 'Wisp', description: 'A single, very thin dandelion seed terrified of the slightest breeze but dreaming of being a paratrooper.' },
      { id: 's2c2', name: 'The Fan', description: 'A grumpy, stationary desk fan who is just trying to cool the room down.' }
    ]
  },
  {
    id: 's10',
    name: 'Existential min',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    styleDescription: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors, sketchy linework emphasizes awkwardness. Looks quick, raw, and observational.',
    archetypes: 'Deadpan Humans/Concepts. Treat impossible situations with mundane calm. Philosophical, socially awkward, obsessed with semantics.',
    artStyle: 'Indie Zine style',
    environment: 'Grocery store checkout',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 's10c1', name: 'Min', description: 'A short, angular woman who overanalyzes everything, searching for hidden subtext in the mundane.' },
      { id: 's10c2', name: 'The Cashier', description: 'A deadpan human who just wants Min to pay for her groceries and leave.' }
    ]
  },
  {
    id: 's23',
    name: 'Planet of the Cats',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    styleDescription: 'Neon-Noir / Franco-Belgian Sci-Fi. Intricate background details, heavy use of shadows contrasted with vibrant, glowing neon colors (pinks, blues). High contrast, dramatic angles.',
    archetypes: 'World-Weary Augments/evolved animals. Augmented humans, androids, sleek evolved cats. Stoic; trying to fight, hack, or negotiate dystopian corporate bureaucracy.',
    artStyle: 'Neon-Noir Sci-Fi',
    environment: 'Cybernetic cat city',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 's23c1', name: 'Subject 7', description: 'A stoic shorthair with a cybernetic eye that hacks electronic food bowls.' },
      { id: 's23c2', name: 'Chairman Meow', description: 'The highly augmented feline ruler who communicates only in "Purr-code."' }
    ]
  },
  {
    id: 's30',
    name: 'Nocturnal Digestion',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    styleDescription: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching, or limited color (deep reds, moldy greens). Heavy scratch-board textures, oppressive shadow.',
    archetypes: 'Morbid Polite Humanoids. Victorian children, talking gargoyles, melancholy ghosts, demons engaged in petty arguments. Politemelancholy; comfortable with macabre.',
    artStyle: 'Edward Gorey Gothic',
    environment: 'Victorian streets at night',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 's30c1', name: 'Mr. Belly', description: 'A sentient stomach that detaches at night to wander Victorian streets eating esoteric objects.' },
      { id: 's30c2', name: 'Penny', description: 'A polite orphan girl who treats Mr. Belly like a stray dog and feeds him her bad dreams.' }
    ]
  },
  {
    id: 's48',
    name: 'Bootcamp Bill',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    styleDescription: 'Sketchy Caricature / Political Cartoon. Exaggerated features (massive noses), drab colors (beiges, grays), claustrophobic panel layout traps characters.',
    archetypes: 'Cynical Bureaucratic Drones. Overworked office drones, tired soldiers, corrupt rat politicians. Exhausted; defined by their futile relationship with "The System."',
    artStyle: 'Sketchy Caricature',
    environment: 'Absurd military camp',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 's48c1', name: 'Bill', description: 'A weary conscript whose existence is defined by absurd, ever-changing "efficiency metrics."' },
      { id: 's48c2', name: 'Sgt. Stone', description: 'A massive drill instructor who yells because he believes "noise is efficient."' }
    ]
  },
  {
    id: 's64',
    name: 'Dragon lord dominion',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    styleDescription: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects, clean linework, detailed monster design, cel-shaded coloring.',
    archetypes: 'Fantasy archetypes with a twist.',
    artStyle: 'D&D Manual style',
    environment: 'Treasure hoard',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 's64c1', name: 'Cinder', description: 'A heroic, heavily-muscled green dragon obsessed with optimizing his hoard\'s "loot stats."' },
      { id: 's64c2', name: 'Dusty', description: 'A fast-talking kobold accountant constantly appraising the value of defeated enemies.' }
    ]
  },
  {
    id: 's74',
    name: 'Super Marlo 3D',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    styleDescription: 'Chameleon Style. Perfectly mimics the media it parodies (e.g., 8-bit art or early 90s CGI; Super Marlo).',
    archetypes: 'Distorted Icons. Generic versions of pop icons. Genre-savvy; self-aware comic existence.',
    artStyle: 'Bootleg 90s CGI',
    environment: 'Glitchy 3D world',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 's74c1', name: 'Marlo', description: 'A bootleg plumber trapped in a world requiring red/blue 3D glasses, giving him a migraine.' },
      { id: 's74c2', name: 'Princess Substitute', description: 'A competent fruit vendor completely tired of getting "rescued" and wanting to run her business.' }
    ]
  },
  {
    id: 's83',
    name: 'Bohemian Breakdowns',
    category: 'Category 8: Niche, Mood, & Abstract',
    styleDescription: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels or moody wash colors. Borders missing; feels like a private sketchbook.',
    archetypes: 'Poetic Internal Monologues. Unnamed conceptual figures, lovers in conflict, people staring into darkness.',
    artStyle: 'Watercolor Mixed Media',
    environment: 'An emotional void',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 's83c1', name: 'The Artist', description: 'A melodramatic watercolor painter who weeps openly over the emotional weight of beige.' },
      { id: 's83c2', name: 'The Canvas', description: 'A sentient blank canvas begging to be painted so it can finally get a job in a hotel.' }
    ]
  },
  {
    id: 'c23',
    name: 'Closer than Appears',
    backgroundColor: '#dbdac8',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Surrealist, dreamlike, distorted perspectives',
    environment: 'A totally wacky surreal world',
    environments: [],
    panelCount: 3,
    characters: []
  },
  {
    id: 'c24',
    name: 'Fletch and Bone',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Noir detective, gritty, high contrast',
    environment: 'Crime scene',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'fb1', name: 'Fletch', description: 'Absurdly bone headed detective' },
      { id: 'fb2', name: 'Bone', description: 'Absurdly bone headed detective partner' }
    ]
  },
  {
    id: 'c25',
    name: 'The Rats of Nibo',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Gritty underground, dark, detailed fur',
    environment: 'Rat government council room',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'rn1', name: 'Senator Squeak', description: 'Scheming rat politician' },
      { id: 'rn2', name: 'Backstabber Bob', description: 'Backstabbing rat official' }
    ]
  },
  {
    id: 'c26',
    name: 'Clown Town',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Circus horror, bright but unsettling colors',
    environment: 'A town where everyone is a clown',
    environments: [],
    panelCount: 3,
    characters: []
  },
  {
    id: 'c27',
    name: 'Dark Wishes',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Dark fantasy, shadowy, ethereal',
    environment: 'Dreamscape',
    environments: [],
    panelCount: 3,
    characters: []
  },
  {
    id: 'c28',
    name: 'Pileup on 709',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Gritty realism, chaotic, crowded',
    environment: 'Infinite car pileup on highway 709',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'pu1', name: 'Angry Driver', description: 'Frustrated driver stuck in traffic' },
      { id: 'pu2', name: 'Confused Commuter', description: 'Commuter wondering why traffic never moves' }
    ]
  },
  {
    id: 'c29',
    name: 'Scorpion Riders',
    backgroundColor: '#dbdac8',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: '80s Sci-Fi Western, neon desert, giant insects',
    environment: 'Wild west with giant insects',
    environments: [],
    panelCount: 3,
    characters: []
  },
  {
    id: 'n1',
    name: 'Inanimate personalities',
    backgroundColor: '#dbdac8',
    category: 'Category 1: Anthropomorphic',
    artStyle: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines.',
    environment: 'Living Room',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n1c1', name: 'Lampy', description: 'A nervous desk lamp whose bulb is flickering, believing it’s a glimpse into the afterlife.' },
      { id: 'n1c2', name: 'Extension Cord', description: 'A tangled, laid-back cord that always tells Lampy to "chill" and accept the current.' }
    ]
  },
  {
    id: 'n2',
    name: 'Rainbow lambcakes',
    backgroundColor: '#dbdac8',
    category: 'Category 1: Anthropomorphic',
    artStyle: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines.',
    environment: 'Bakery Display',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n2c1', name: 'Sprinkle', description: 'A festive lambcake with existential dread about being eaten, viewing himself as art.' },
      { id: 'n2c2', name: 'Coconut Shavings', description: 'Another lambcake eager to be consumed, viewing it as the ultimate performance art.' }
    ]
  },
  {
    id: 'n3',
    name: 'Spaghetti TED',
    backgroundColor: '#dbdac8',
    category: 'Category 1: Anthropomorphic',
    artStyle: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines.',
    environment: 'Boiling Pot',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n3c1', name: 'Ted', description: 'A single, miles-long noodle who is absolutely terrified of the boiling pot and delivers monologues.' },
      { id: 'n3c2', name: 'Forky', description: 'A pragmatic, four-pronged utensil who finds Ted\'s constant drama exhausting.' }
    ]
  },
  {
    id: 'n4',
    name: 'The Jars of Sadness',
    backgroundColor: '#dbdac8',
    category: 'Category 1: Anthropomorphic',
    artStyle: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines.',
    environment: 'Pantry Shelf',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n4c1', name: 'Jar 7', description: 'A glass jar containing a single, teardrop-shaped marble representing a polite regret.' },
      { id: 'n4c2', name: 'The Lid', description: 'A metal screw-top constantly trying to keep the sadness sealed in to preserve the "vintage".' }
    ]
  },
  {
    id: 'n5',
    name: 'Deli meat meet',
    backgroundColor: '#dbdac8',
    category: 'Category 1: Anthropomorphic',
    artStyle: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines.',
    environment: 'Deli Case',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n5c1', name: 'Sal', description: 'A tough, seasoned slice of salami who claims he used to run the whole deli display case.' },
      { id: 'n5c2', name: 'Prudence', description: 'A refined, paper-thin slice of imported prosciutto who secretly fears turning gray.' }
    ]
  },
  {
    id: 'n6',
    name: 'Office staple',
    backgroundColor: '#dbdac8',
    category: 'Category 1: Anthropomorphic',
    artStyle: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines.',
    environment: 'Office Desk',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n6c1', name: 'Staple', description: 'A single metal staple trapped in a jammed gun, dreaming of a "clean punch".' },
      { id: 'n6c2', name: 'Staple Remover', description: 'A sadistic, pincer-like tool that keeps threatening to pull Staple out.' }
    ]
  },
  {
    id: 'n7',
    name: 'Cloggy',
    backgroundColor: '#dbdac8',
    category: 'Category 1: Anthropomorphic',
    artStyle: '"Sunday Funnies" meets Surrealism. Bright, saturated, sketchy colors; thick, expressive outlines.',
    environment: 'Shower Drain',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n7c1', name: 'Cloggy', description: 'A lovable, stubborn ball of hair and soap scum blocking a shower drain.' },
      { id: 'n7c2', name: 'Plunger', description: 'A rough-and-tumble, blue-collar tool who keeps forcing his rubber face down on Cloggy.' }
    ]
  },
  {
    id: 'n8',
    name: 'Corn Soaked Campwho',
    backgroundColor: '#dbdac8',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors.',
    environment: 'Campsite',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n8c1', name: 'Gary', description: 'A camper whose entire personality is wrapped around an embarrassing memory of spilling chowder.' },
      { id: 'n8c2', name: 'The Who', description: 'A ghost-like figure made of corn that appears just to ask "Who?" when Gary changes the subject.' }
    ]
  },
  {
    id: 'n9',
    name: 'Wired up Chuck',
    backgroundColor: '#dbdac8',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors.',
    environment: 'Basement',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n9c1', name: 'Chuck', description: 'A paranoid man who believes he can "hack reality" by connecting to dial-up electronics.' },
      { id: 'n9c2', name: 'Janice', description: 'His very normal sister who ignores his theories and just brings him casseroles.' }
    ]
  },
  {
    id: 'n10',
    name: 'Accidental candidness',
    backgroundColor: '#dbdac8',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors.',
    environment: 'Dinner Party',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n10c1', name: 'Mark', description: 'A man whose mouth is physically incapable of lying, making him a social pariah.' },
      { id: 'n10c2', name: 'Patty', description: 'The only person who invites Mark to dinner, using his honesty as a weapon against guests.' }
    ]
  },
  {
    id: 'n11',
    name: 'Truth be Sold',
    backgroundColor: '#dbdac8',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors.',
    environment: 'Roadside Stand',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n11c1', name: 'Ziggy-like', description: 'A pathetic, balding man who sells incredibly mundane "Truths" at a roadside stand.' },
      { id: 'n11c2', name: 'The Taxman', description: 'A faceless, floating figure who taxes the man based on the emotional value of the truths.' }
    ]
  },
  {
    id: 'n12',
    name: 'Shoe to shoe talks',
    backgroundColor: '#dbdac8',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors.',
    environment: 'Shoe Rack',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n12c1', name: 'Scuffy', description: 'An old sneaker seen from the ankle down, who judges his owner\'s laziness based on grass stains.' },
      { id: 'n12c2', name: 'Pat', description: 'A pristine patent leather shoe who brags about high-stakes corporate meetings.' }
    ]
  },
  {
    id: 'n13',
    name: 'Candy Discussions',
    backgroundColor: '#dbdac8',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors.',
    environment: 'Candy Bowl',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n13c1', name: 'The Gummy Bear', description: 'A gelatinous figure who argues his chewiness gives him a deeper philosophical understanding.' },
      { id: 'n13c2', name: 'The Jawbreaker', description: 'A stoic rock of sugar who views chewiness as a moral failing.' }
    ]
  },
  {
    id: 'n14',
    name: 'Controversial clementine',
    backgroundColor: '#dbdac8',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors.',
    environment: 'Fruit Bowl',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n14c1', name: 'Clem', description: 'A sentient clementine convinced she is "toxic" despite everyone finding her delicious.' },
      { id: 'n14c2', name: 'The Fruit Bowl', description: 'An old ceramic bowl that tells Clem she isn\'t special enough to be controversial.' }
    ]
  },
  {
    id: 'n15',
    name: 'Stuck in the Well',
    backgroundColor: '#dbdac8',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors.',
    environment: 'Abandoned Well',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n15c1', name: 'Arthur', description: 'A man who has lived in an abandoned well for five years, treating it as a "minimalist residency".' },
      { id: 'n15c2', name: 'Clara', description: 'A volunteer rescue worker who comes every week, arguing that "having a sink is better".' }
    ]
  },
  {
    id: 'n16',
    name: 'Mean Mime Mustard',
    backgroundColor: '#dbdac8',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors.',
    environment: 'Street Corner',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n16c1', name: 'Mean Mime', description: 'A mime who traps people in invisible boxes but is physically incapable of silence and yells insults.' },
      { id: 'n16c2', name: 'Mustard', description: 'A grumpy packet of yellow mustard the mime uses as an unwilling comedy partner.' }
    ]
  },
  {
    id: 'n17',
    name: 'Monopoly Squared',
    backgroundColor: '#dbdac8',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors.',
    environment: 'Board Game',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n17c1', name: 'The Monocle Man', description: 'A cheap knock-off mascot who lives in a house of mortgage papers, convinced life is a board game.' },
      { id: 'n17c2', name: 'The Scottie Dog', description: 'A tiny, cynical metal dog token who actually runs the simulation behind the scenes.' }
    ]
  },
  {
    id: 'n18',
    name: '"Splain” this',
    backgroundColor: '#dbdac8',
    category: 'Category 2: Absurdist, Puns, & Surreal Slice-of-Life',
    artStyle: 'Indie "Zine" or Lo-Fi Webcomic. Minimalist backgrounds, muted/off-kilter colors.',
    environment: 'Living Room',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n18c1', name: 'Nate', description: 'A man whose superpower is "Splain-ing" simple concepts until they become incomprehensible.' },
      { id: 'n18c2', name: 'Beatrice', description: 'His tired wife who just wants to change a lightbulb without a quantum physics lecture.' }
    ]
  },
  {
    id: 'n19',
    name: 'Pi vs. Pie',
    backgroundColor: '#dbdac8',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Fine Art Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels.',
    environment: 'Abstract Void',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n19c1', name: 'Pi', description: 'A rational, infinite mathematical constant who speaks only in cold logic and geometry.' },
      { id: 'n19c2', name: 'Pie', description: 'A warm, chaotic baked good who solves all arguments with sweet filling and flaky crust.' }
    ]
  },
  {
    id: 'n20',
    name: 'The Seeds of Crisis',
    backgroundColor: '#dbdac8',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Neon-Noir / Franco-Belgian Sci-Fi. Intricate background details, heavy use of shadows.',
    environment: 'Alien Moon',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n20c1', name: 'Kael', description: 'A bio-engineered gardener searching for the "seed of hope" on a toxic alien moon.' },
      { id: 'n20c2', name: 'Overseer B-9', description: 'A sleek corporate android ensuring Kael doesn\'t become radicalized by the flora.' }
    ]
  },
  {
    id: 'n21',
    name: 'Cyber kitty and cat girl',
    backgroundColor: '#dbdac8',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Neon-Noir / Franco-Belgian Sci-Fi. Intricate background details, heavy use of shadows.',
    environment: 'Cyber City',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n21c1', name: 'Momo', description: 'A human hacker in a sleek "neko-suit" who physically infiltrates servers cat-burglar style.' },
      { id: 'n21c2', name: 'Pulse', description: 'Her companion cat, 90% cybernetic, who protects Momo\'s flank from virtual ICE.' }
    ]
  },
  {
    id: 'n22',
    name: 'Prrrpetuity',
    backgroundColor: '#dbdac8',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Neon-Noir / Franco-Belgian Sci-Fi. Intricate background details, heavy use of shadows.',
    environment: 'Server Room',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n22c1', name: 'The Purr-Bot', description: 'An outdated robot cat whose eternal "purr" acts as a data-encryption loop keeping the grid stable.' },
      { id: 'n22c2', name: 'Sys-Admin Jones', description: 'A world-weary human operator terrified to touch the bot in case the grid collapses.' }
    ]
  },
  {
    id: 'n23',
    name: 'Solid state drivers',
    backgroundColor: '#dbdac8',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Neon-Noir / Franco-Belgian Sci-Fi. Intricate background details, heavy use of shadows.',
    environment: 'Hover Taxi',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n23c1', name: 'Driver X', description: 'A human consciousness downloaded into a hover-taxi, obsessed with finding the perfect route.' },
      { id: 'n23c2', name: 'Dispatch AI', description: 'A corporate voice constantly interrupting with new fare data and efficiency metrics.' }
    ]
  },
  {
    id: 'n24',
    name: 'Alien congress',
    backgroundColor: '#dbdac8',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Neon-Noir / Franco-Belgian Sci-Fi. Intricate background details, heavy use of shadows.',
    environment: 'Galactic Senate',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n24c1', name: 'Vrax', description: 'A gelatinous diplomat who communicates through color changes to a hostile assembly.' },
      { id: 'n24c2', name: 'Speaker C\'Thon', description: 'A multi-headed bureaucrat who treats color-diplomacy as "vulgar".' }
    ]
  },
  {
    id: 'n25',
    name: 'The electric line club',
    backgroundColor: '#dbdac8',
    category: 'Category 3: High Concept, Sci-Fi, & Cyberpunk',
    artStyle: 'Neon-Noir / Franco-Belgian Sci-Fi. Intricate background details, heavy use of shadows.',
    environment: 'Underground Club',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n25c1', name: 'Volt', description: 'A down-on-his-luck DJ with glowing cybernetic implants trying to cure dystopian despair.' },
      { id: 'n25c2', name: 'Manager Chrome', description: 'A mirror-faced android optimizing Volt\'s music purely for corporate mood targets.' }
    ]
  },
  {
    id: 'n26',
    name: 'Easter Bunny cage',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Dungeon',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n26c1', name: 'Barnaby', description: 'An ancient spirit in a crude bunny suit, locked in an iron cage, humming nursery rhymes.' },
      { id: 'n26c2', name: 'Timmy', description: 'A Victorian boy whose daily chore is feeding Barnaby eggs made of solidified fear.' }
    ]
  },
  {
    id: 'n27',
    name: 'Ccursed William',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Victorian Parlor',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n27c1', name: 'William', description: 'A melancholy man who instantly earns trust, but brings embarrassing mishaps wherever he goes.' },
      { id: 'n27c2', name: 'The Imp', description: 'A small, screeching demon perched invisibly on William\'s shoulder, narrating the chaos.' }
    ]
  },
  {
    id: 'n28',
    name: 'Doorway to Nor',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Locked Room',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n28c1', name: 'Grok', description: 'A faceless entity from the void trapped behind a mahogany door, communicating only in sighs.' },
      { id: 'n28c2', name: 'Elara', description: 'A brave girl who sits by the door telling Grok about things like "color" and "sadness".' }
    ]
  },
  {
    id: 'n29',
    name: 'Murmurs',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Haunted Hallway',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n29c1', name: 'Murmur', description: 'An amorphous shadow in the walls that only repeats the final thoughts of deceased pets.' },
      { id: 'n29c2', name: 'Mrs. Graves', description: 'The cheerful homeowner who talks to Murmur, arguing it is "such a good listener".' }
    ]
  },
  {
    id: 'n30',
    name: 'Witness inspection',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Interrogation Room',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n30c1', name: 'The Inspector', description: 'A faceless figure in a trench coat who physically reaches into witnesses\' heads to inspect memories.' },
      { id: 'n30c2', name: 'The Witness', description: 'A person completely unbothered by the procedure, helpfully pointing out specific thoughts.' }
    ]
  },
  {
    id: 'n31',
    name: 'Rodney the ghost',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Attic',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n31c1', name: 'Rodney', description: 'A polite, transparent Victorian boy who haunts a house because he wants to learn to ride a bicycle.' },
      { id: 'n31c2', name: 'Mrs. Graves', description: 'The homeowner who tries to exorcize Rodney only when his ectoplasmic bike chain squeaks.' }
    ]
  },
  {
    id: 'n32',
    name: 'Sins of thy tools',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Workshop',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n32c1', name: 'Screwdriver', description: 'A self-righteous tool that physically refuses to tighten screws if the user is lying.' },
      { id: 'n32c2', name: 'The Blacksmith', description: 'The old man who forged it, threatening to file the Screwdriver down to a flathead.' }
    ]
  },
  {
    id: 'n33',
    name: 'Shadowlurker',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Dark Corner',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n33c1', name: 'The Lurker', description: 'The personified idea of shadows, composed entirely of cross-hatching, who is incredibly melancholy.' },
      { id: 'n33c2', name: 'The Candlestick Maker', description: 'A faceless human who never sees the Lurker because he always looks directly at the light.' }
    ]
  },
  {
    id: 'n34',
    name: 'Where Fear Retires',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Cemetery Garden',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n34c1', name: 'Phobius', description: 'The retired concept of Fear, now living in a cemetery, reading philosophy and gardening.' },
      { id: 'n34c2', name: 'The Undertaker', description: 'A polite local who treats Fear like any other eccentric elderly neighbor.' }
    ]
  },
  {
    id: 'n35',
    name: 'Bygone Errors',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Memory Void',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n35c1', name: 'Error 14', description: 'The personified memory of a polite social blunder (like saying \'you too\' to a waiter).' },
      { id: 'n35c2', name: 'Penny', description: 'An orphan who finds Error 14\'s blunders funny and treats it like a stray pet.' }
    ]
  },
  {
    id: 'n36',
    name: 'Anomalous fountains',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Park Fountain',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n36c1', name: 'The Fountain', description: 'A gothic park fountain that only flows with moldy green ink on Tuesdays.' },
      { id: 'n36c2', name: 'Penny', description: 'The perpetually unbothered orphan who uses the fountain\'s green ink to draw pictures.' }
    ]
  },
  {
    id: 'n37',
    name: 'Near death disorder',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Hospital Room',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n37c1', name: 'Penny', description: 'The same unfazed orphan who views constant, terrifying brushes with mortality as beautiful experiences.' },
      { id: 'n37c2', name: 'Near-Death', description: 'A reaper-in-training who is incredibly stressed out by how polite and unafraid Penny is.' }
    ]
  },
  {
    id: 'n38',
    name: 'Cemetary resort',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Cemetery Gates',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n38c1', name: 'Phobius', description: 'Fear, now enjoying the cemetery as a relaxing, five-star "resort" vacation.' },
      { id: 'n38c2', name: 'The Bellhop', description: 'A skeletal employee carrying luggage made of literal baggage, trying to ruin Fear\'s stay.' }
    ]
  },
  {
    id: 'n39',
    name: 'The Whorst Game',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Game Room',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n39c1', name: 'The Board', description: 'The spirit of a cursed gothic board game, furious and sadistic, trying to torment players.' },
      { id: 'n39c2', name: 'Penny', description: 'The orphan who treats the game\'s horrific magical punishments as delightful "polite suggestions".' }
    ]
  },
  {
    id: 'n40',
    name: 'The wishes chair',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Prison Cell',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n40c1', name: 'The Chair', description: 'A sentient electric chair in an abandoned prison, politely eager to grant "the ultimate release".' },
      { id: 'n40c2', name: 'Timmy', description: 'A naive boy who thinks sitting in the "big chair" makes him a grown-up.' }
    ]
  },
  {
    id: 'n41',
    name: 'Brimstone bickering',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Edward Gorey meets Hellboy. Stark black and white with heavy cross-hatching.',
    environment: 'Hell Office',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n41c1', name: 'Pez', description: 'A small demon who thinks inflicting minor inconveniences (stubbed toes) is high art.' },
      { id: 'n41c2', name: 'The Arch-Demon', description: 'A massive beast who argues that true hell is purely administrative paperwork.' }
    ]
  },
  {
    id: 'n42',
    name: 'Stone query',
    backgroundColor: '#dbdac8',
    category: 'Category 4: Gothic, Dark Comedy, & Horror',
    artStyle: 'Gothic with dynamic composition.',
    environment: 'Cathedral Roof',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n42c1', name: 'Grox', description: 'A highly detailed gargoyle perched on a cathedral, obsessed with boring architectural trivia.' },
      { id: 'n42c2', name: 'Mor', description: 'A cynical grotesque holding a rain spout, who hates trivia and complains about pigeons.' }
    ]
  },
  {
    id: 'n43',
    name: 'Introduction to Doom',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features, drab colors.',
    environment: 'Office',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n43c1', name: 'Arthur', description: 'A middle manager treating absolute catastrophic apocalyptic collapse purely as a spreadsheet error.' },
      { id: 'n43c2', name: 'AI-9', description: 'A generic android that keeps recommending "system defragmentation" instead of panic.' }
    ]
  },
  {
    id: 'n44',
    name: 'Logmen',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features, drab colors.',
    environment: 'Forest',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n44c1', name: 'Pete', description: 'A lumberjack whose job is digitized; he now just logs data points about trees on a tablet.' },
      { id: 'n44c2', name: 'Supervisor-9', description: 'An android who threatens to fire Pete if he mentions the "beauty" of the bark.' }
    ]
  },
  {
    id: 'n45',
    name: 'The infinite Gambler',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features, drab colors.',
    environment: 'Casino',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n45c1', name: 'Mark', description: 'An exhausted man in a generic casino who believes playing one specific machine will free him.' },
      { id: 'n45c2', name: 'The Dealer', description: 'A faceless figure made of casino chips who treats Mark\'s despair as "entertainment targets".' }
    ]
  },
  {
    id: 'n46',
    name: 'journal des débats',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features, drab colors.',
    environment: 'Newsroom',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n46c1', name: 'Pierre', description: 'A weary Parisian editor who corrects the punctuation of passionate revolutionary manifestos.' },
      { id: 'n46c2', name: 'Manifesto-Man', description: 'A loud revolutionary who gets "Pierre-splained" on proper paragraph structure.' }
    ]
  },
  {
    id: 'n47',
    name: 'Elevator Pitch',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features, drab colors.',
    environment: 'Elevator',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n47c1', name: 'Arthur', description: 'A desperate entrepreneur trapped in an infinite elevator ride, endlessly pitching bizarre ideas.' },
      { id: 'n47c2', name: 'AI-9', description: 'The corporate android sharing the ride, rejecting pitches based purely on syllabic efficiency.' }
    ]
  },
  {
    id: 'n48',
    name: 'Quality Inspectors',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features, drab colors.',
    environment: 'Cloud Factory',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n48c1', name: 'Inspector 42', description: 'An exhausted bureaucrat assigned the impossible task of grading the existential quality of clouds.' },
      { id: 'n48c2', name: 'The Wind', description: 'A chaotic entity that messes up the clouds\' shapes right before inspection out of spite.' }
    ]
  },
  {
    id: 'n49',
    name: 'The Que',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features, drab colors.',
    environment: 'Endless Line',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n49c1', name: 'Waiting Warren', description: 'A man in an endless line so long he has set up a campsite and started a family.' },
      { id: 'n49c2', name: 'The Line Manager', description: 'A faceless clipboard that refuses to tell anyone what the line is for.' }
    ]
  },
  {
    id: 'n50',
    name: 'Do the work in montage',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features, drab colors.',
    environment: 'Training Gym',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n50c1', name: 'Rocky-ish', description: 'An exhausted hero forced to do repetitive physical tasks because upbeat 80s synth music is playing.' },
      { id: 'n50c2', name: 'The Boombox', description: 'A tyrannical floating stereo that refuses to let him rest until the guitar solo ends.' }
    ]
  },
  {
    id: 'n51',
    name: 'Major Disappointment',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features, drab colors.',
    environment: 'War Room',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n51c1', name: 'General Letdown', description: 'A military leader whose only tactical strategy is aggressively lowering expectations.' },
      { id: 'n51c2', name: 'Corporal Bummer', description: 'His fiercely loyal aide who proactively cancels morale-boosting events.' }
    ]
  },
  {
    id: 'n52',
    name: 'Sweat and aging',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features, drab colors.',
    environment: 'Gym',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n52c1', name: 'Phil', description: 'An aging gym rat who treats every minor muscle ache as a deep, philosophical failure of the flesh.' },
      { id: 'n52c2', name: 'Father Time', description: 'An invisible spotter who keeps secretly adding five pounds to the barbell every year.' }
    ]
  },
  {
    id: 'n53',
    name: 'Shared sentiment',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features, drab colors.',
    environment: 'Breakroom',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n53c1', name: 'Arthur', description: 'An office drone desperately trying to establish a genuine human connection in the breakroom.' },
      { id: 'n53c2', name: 'The Watercooler', description: 'A sentient plastic jug that only dispenses lukewarm water and generic corporate gossip.' }
    ]
  },
  {
    id: 'n54',
    name: 'Musings only',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features, drab colors.',
    environment: 'Cubicle',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n54c1', name: 'The Thinker', description: 'A man trapped in a state of constant, profound internal monologue but unable to speak.' },
      { id: 'n54c2', name: 'The Output', description: 'A completely empty printer tray that he stares at, waiting for his thoughts to manifest.' }
    ]
  },
  {
    id: 'n55',
    name: 'Embarrassment Row',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features, drab colors.',
    environment: 'Police Lineup',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n55c1', name: 'Mark', description: 'A man forced to stand in a police lineup made entirely of his past social blunders.' },
      { id: 'n55c2', name: 'The Judge', description: 'A faceless figure with a gavel who sentences Mark to randomly remember them at 3 AM.' }
    ]
  },
  {
    id: 'n56',
    name: 'Politics and cream',
    backgroundColor: '#dbdac8',
    category: 'Category 5: Satire, Bureaucracy, & The Mundane Grind',
    artStyle: 'Sketchy Caricature / Political Cartoon. Exaggerated features, drab colors.',
    environment: 'Press Conference',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n56c1', name: 'Senator Fudge', description: 'A corrupt politician who speaks entirely in dairy-based euphemisms to avoid direct questions.' },
      { id: 'n56c2', name: 'The Whisk', description: 'An aggressive investigative journalist trying to whip up a scandal and curdle his career.' }
    ]
  },
  {
    id: 'n57',
    name: 'Zoofusion',
    backgroundColor: '#dbdac8',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects.',
    environment: 'Lab',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n57c1', name: 'Dr. Chimera', description: 'A mad scientist who enthusiastically mashes incompatible animals together using a ray gun.' },
      { id: 'n57c2', name: 'Duck-Bear', description: 'The exhausted, highly unstable result of a fusion, just trying to figure out what it eats.' }
    ]
  },
  {
    id: 'n58',
    name: 'Wimbleton willbright',
    backgroundColor: '#dbdac8',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects.',
    environment: 'Wizard Tower',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n58c1', name: 'Wimbleton', description: 'An overly enthusiastic wizard apprentice whose spells have catastrophic, neon-colored side effects.' },
      { id: 'n58c2', name: 'The Grand Mage', description: 'His deeply exhausted mentor who rubs his temples constantly in a cel-shaded world.' }
    ]
  },
  {
    id: 'n59',
    name: 'Elven looters',
    backgroundColor: '#dbdac8',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects.',
    environment: 'Dungeon',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n59c1', name: 'Fingolfin', description: 'A snobbish elf who refuses to steal anything less than museum-quality artifacts.' },
      { id: 'n59c2', name: 'Borin', description: 'A pragmatic dwarf companion who will happily steal copper wiring if it pays for a pint.' }
    ]
  },
  {
    id: 'n60',
    name: 'Mutant city brawlers',
    backgroundColor: '#dbdac8',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects.',
    environment: 'Arena',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n60c1', name: 'Slammer', description: 'A massive mutant with concrete arms who hates fighting and just wants to open a bakery.' },
      { id: 'n60c2', name: 'The Mayor', description: 'A corrupt cyborg who forces Slammer into underground tournaments by threatening his sourdough.' }
    ]
  },
  {
    id: 'n61',
    name: 'Golden Harriet',
    backgroundColor: '#dbdac8',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects.',
    environment: 'Dungeon',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n61c1', name: 'Harriet', description: 'A plucky adventurer who turns everything she touches into solid gold, ruining her life.' },
      { id: 'n61c2', name: 'The Appraiser', description: 'A cynical pawn shop owner who points out that gold is losing its market value due to inflation.' }
    ]
  },
  {
    id: 'n62',
    name: 'The forest nation',
    backgroundColor: '#dbdac8',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects.',
    environment: 'Ancient Forest',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n62c1', name: 'The Ent-King', description: 'A stubborn, ancient tree bureaucrat who refuses to grant zoning permits to the wildlife.' },
      { id: 'n62c2', name: 'The Developer', description: 'A highly caffeinated beaver in a hardhat trying to gentrify the riverbank.' }
    ]
  },
  {
    id: 'n63',
    name: 'Questeretta',
    backgroundColor: '#dbdac8',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects.',
    environment: 'Village',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n63c1', name: 'Questeretta', description: 'A hyper-energetic RPG protagonist who breaks into homes looking for side quests.' },
      { id: 'n63c2', name: 'The NPC', description: 'An exhausted villager who is forced to repeat the same three lines of dialogue forever.' }
    ]
  },
  {
    id: 'n64',
    name: 'Level up',
    backgroundColor: '#dbdac8',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'D&D Manual meets Saturday Cartoon. Dynamic action lines, vibrant magic effects.',
    environment: 'Forest',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n64c1', name: 'Cinder', description: 'The dragon, now stuck grinding low-level boars in the forest just to afford a new sword.' },
      { id: 'n64c2', name: 'The Game Master', description: 'A bored, omnipotent narrator rolling dice off-screen and sighing at Cinder\'s choices.' }
    ]
  },
  {
    id: 'n65',
    name: 'Cumberland gap curses',
    backgroundColor: '#dbdac8',
    category: 'Category 6: Fantasy, Mythology, & Adventure',
    artStyle: 'Classic adventure style but with a more textured, earthy color palette.',
    environment: 'Mountain Path',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n65c1', name: 'Jebediah', description: 'A plucky 19th-century traveler highly persistent despite being burdened by hillbilly curses.' },
      { id: 'n65c2', name: 'The Gap Hag', description: 'An earthy folklore entity deeply annoyed that Jebediah is weaponizing her curses.' }
    ]
  },
  {
    id: 'n66',
    name: 'Droogs and Violet',
    backgroundColor: '#dbdac8',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: 'Chameleon Style. Perfectly mimics the media it parodies.',
    environment: 'Milk Bar',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n66c1', name: 'Violet', description: 'A hyper-violent but impeccably dressed delinquent who loves classical music and milk.' },
      { id: 'n66c2', name: 'The Inspector', description: 'A tired parole officer who just wants Violet to stop smashing vintage teacups.' }
    ]
  },
  {
    id: 'n67',
    name: 'Captain Camero',
    backgroundColor: '#dbdac8',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: 'Chameleon Style. Perfectly mimics the media it parodies.',
    environment: 'Garage',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n67c1', name: 'The Captain', description: 'A superhero whose only power is transforming into a 1980s muscle car with a slipping transmission.' },
      { id: 'n67c2', name: 'Mechanic Mike', description: 'His exasperated sidekick who possesses the tools to constantly fix the Captain\'s spark plugs.' }
    ]
  },
  {
    id: 'n68',
    name: 'Lord Pizza Delivery',
    backgroundColor: '#dbdac8',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: 'Chameleon Style. Perfectly mimics the media it parodies.',
    environment: 'Pizza Shop',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n68c1', name: 'Zargoth', description: 'A terrifying dark lord forced to do gig-economy pizza delivery to pay off his doom-fortress.' },
      { id: 'n68c2', name: 'Customer 42', description: 'A stoned college student who tips in loose change and complains the crust isn\'t stuffed.' }
    ]
  },
  {
    id: 'n69',
    name: 'Mystery science comic',
    backgroundColor: '#dbdac8',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: 'Chameleon Style. Perfectly mimics the media it parodies.',
    environment: 'Theater',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n69c1', name: 'The Heckler', description: 'A silhouette at the bottom of the panel constantly critiquing the artist\'s line work.' },
      { id: 'n69c2', name: 'The Protagonist', description: 'The hero of the comic who gets insecure about his poorly-drawn hands because of the critiques.' }
    ]
  },
  {
    id: 'n70',
    name: 'DiE A LOG',
    backgroundColor: '#dbdac8',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: 'Chameleon Style. Perfectly mimics the media it parodies.',
    environment: 'Comic Panel',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n70c1', name: 'Blank Bubble', description: 'An empty speech bubble floating above characters, desperate for someone to write a good punchline.' },
      { id: 'n70c2', name: 'The Editor', description: 'An anxious floating pencil that keeps erasing what people write because it "doesn\'t fit".' }
    ]
  },
  {
    id: 'n71',
    name: 'Screen sweeper',
    backgroundColor: '#dbdac8',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: 'Chameleon Style. Perfectly mimics the media it parodies.',
    environment: 'Desktop',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n71c1', name: 'Cursor', description: 'A tired digital janitor shaped like a mouse pointer, sweeping up broken pixels.' },
      { id: 'n71c2', name: 'The Glitch', description: 'A corrupted file that refuses to be deleted and wants to make modern art out of digital trash.' }
    ]
  },
  {
    id: 'n72',
    name: 'Channel Flip',
    backgroundColor: '#dbdac8',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: 'Chameleon Style. Perfectly mimics the media it parodies.',
    environment: 'Living Room',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n72c1', name: 'The Viewer', description: 'A couch potato whose physical living room morphs to match whatever channel is on TV.' },
      { id: 'n72c2', name: 'The Remote', description: 'A glowing device trying to keep him safe from landing on the True Crime network.' }
    ]
  },
  {
    id: 'n73',
    name: 'Family T shirt',
    backgroundColor: '#dbdac8',
    category: 'Category 7: Meta, Media Parody, & Specific Homages',
    artStyle: 'Chameleon Style. Perfectly mimics the media it parodies.',
    environment: 'Laundry Room',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n73c1', name: 'Big Print', description: 'The loud, obnoxious front graphic of a novelty vacation t-shirt shouting about "Beach Vibes".' },
      { id: 'n73c2', name: 'The Tag', description: 'An itchy, cynical entity on the back of the neck that just wants to be cut off.' }
    ]
  },
  {
    id: 'n74',
    name: 'delicate life',
    backgroundColor: '#dbdac8',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels.',
    environment: 'Abstract Void',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n74c1', name: 'The Glass Man', description: 'A fragile being made of beautifully spun glass, navigating a clumsy, heavy-handed world.' },
      { id: 'n74c2', name: 'The Bubble Wrap Salesman', description: 'An aggressive bodyguard who constantly tries to tape packaging material to him.' }
    ]
  },
  {
    id: 'n75',
    name: 'Musings in the dark',
    backgroundColor: '#dbdac8',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels.',
    environment: 'Dark Room',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n75c1', name: 'The Insomniac', description: 'A wide-awake pair of eyes in a pitch-black panel, overthinking a conversation from 2014.' },
      { id: 'n75c2', name: 'The Brain', description: 'A pulsing organ enthusiastically providing the Insomniac with worse-case scenarios.' }
    ]
  },
  {
    id: 'n76',
    name: 'Dire love',
    backgroundColor: '#dbdac8',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels.',
    environment: 'Streetlight',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n76c1', name: 'The Moth', description: 'A delicate, shadowy figure fatally and romantically attracted to dangerous neon signs.' },
      { id: 'n76c2', name: 'The Bulb', description: 'A flickering, self-loathing streetlight trying to convince the moth to find a nice candle instead.' }
    ]
  },
  {
    id: 'n77',
    name: 'Homoside',
    backgroundColor: '#dbdac8',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels.',
    environment: 'Crime Scene',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n77c1', name: 'The Chalk Outline', description: 'A glowing outline of a body that is tired of lying on the pavement and wants to walk away.' },
      { id: 'n77c2', name: 'The Rain', description: 'A cynical weather pattern slowly washing the Outline away, telling it to accept its temporary nature.' }
    ]
  },
  {
    id: 'n78',
    name: 'Vessel to vessel',
    backgroundColor: '#dbdac8',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels.',
    environment: 'Ocean Shore',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n78c1', name: 'The Message', description: 'A piece of parchment trapped in a bottle, convinced its bad poetry will change the world.' },
      { id: 'n78c2', name: 'The Ocean', description: 'A vast, indifferent body of water that keeps washing the bottle up on deserted rocks.' }
    ]
  },
  {
    id: 'n79',
    name: 'Insomnia',
    backgroundColor: '#dbdac8',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels.',
    environment: 'Bedroom',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n79c1', name: 'The Sheep', description: 'An exhausted farm animal who is tired of jumping over the fence to be counted.' },
      { id: 'n79c2', name: 'The Shepherd', description: 'A blurry figure in pajamas who keeps falling asleep on the job and losing track of the count.' }
    ]
  },
  {
    id: 'n80',
    name: 'Tom 👍',
    backgroundColor: '#dbdac8',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels.',
    environment: 'Everywhere',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n80c1', name: 'Tom', description: 'A completely average guy whose hand is permanently stuck in a rigid thumbs-up gesture.' },
      { id: 'n80c2', name: 'The World', description: 'A series of tragic events unfolding around Tom, making his thumbs-up look incredibly sarcastic.' }
    ]
  },
  {
    id: 'n81',
    name: 'Behind the bars',
    backgroundColor: '#dbdac8',
    category: 'Category 8: Niche, Mood, & Abstract',
    artStyle: 'Watercolor / Mixed Media. Dreamlike, blurry edges, soft pastels.',
    environment: 'Supermarket',
    environments: [],
    panelCount: 3,
    characters: [
      { id: 'n81c1', name: 'The Barcode', description: 'A cluster of black lines trying to break out of a product label to see the outside world.' },
      { id: 'n81c2', name: 'The Scanner', description: 'A harsh red laser that acts as the ultimate, unforgiving prison guard of the checkout aisle.' }
    ]
  }
];

export const COMIC_FONTS = [
  { name: 'Amatic SC', family: '"Amatic SC", cursive' },
  { name: 'Annie Use Your Telescope', family: '"Annie Use Your Telescope", cursive' },
  { name: 'Bangers', family: '"Bangers", cursive' },
  { name: 'Boogaloo', family: '"Boogaloo", cursive' },
  { name: 'Comic Neue', family: '"Comic Neue", cursive' },
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
  { name: 'Permanent Marker', family: '"Permanent Marker", cursive' },
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
