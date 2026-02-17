import { ComicProfile } from './types';

export const INITIAL_COMICS: ComicProfile[] = [
  { 
    id: 'c1', 
    name: 'Noir Whiskers', 
    backgroundColor: '#dbdac8', 
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
    artStyle: 'Soft charcoal and gouache, peaceful green', 
    environment: 'Sunlit lily pond', 
    environments: [], 
    panelCount: 3, 
    characters: [{id:'pb1', name:'Froppy', description:'Optimistic frog'}, {id:'pb2', name:'Shell', description:'Slow turtle'}] 
  }
];