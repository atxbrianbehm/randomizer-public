# Create example JSON files for the televangelist and satanic panic generators

# Televangelist Generator
televangelist_generator = {
    "metadata": {
        "name": "Televangelist Generator",
        "version": "1.0.0",
        "description": "Generates humorous televangelist-style proclamations and money requests",
        "author": "Comedy Content Creator",
        "created": "2025-06-21",
        "category": "comedy",
        "tags": ["humor", "satire", "television", "religion"]
    },
    "assets": {
        "images": ["golden_throne.jpg", "money_pile.png", "holy_light.gif"],
        "audio": ["hallelujah.mp3", "organ_music.wav"],
        "fonts": ["biblical_serif.ttf"],
        "styles": {
            "background": "linear-gradient(gold, white)",
            "text_color": "#8B4513",
            "highlight_color": "#FFD700"
        }
    },
    "variables": {
        "donation_amount": {
            "type": "number",
            "default": 100,
            "description": "Current donation amount being requested"
        },
        "viewer_count": {
            "type": "number", 
            "default": 1000,
            "description": "Number of viewers watching"
        },
        "miracle_count": {
            "type": "number",
            "default": 0,
            "description": "Number of miracles performed this session"
        }
    },
    "grammar": {
        "greeting": [
            "Blessed viewers!",
            "Children of the light!",
            "Faithful flock!",
            "Beloved congregation!"
        ],
        "divine_title": [
            {"text": "Reverend", "weight": 3},
            {"text": "Pastor", "weight": 3},
            {"text": "Minister", "weight": 2},
            {"text": "Prophet", "weight": 1},
            {"text": "Archbishop", "weight": 1}
        ],
        "preacher_name": [
            "Blessington",
            "Prosperity",
            "Goldenshower",
            "Moneybags",
            "Wealthworth",
            "Cashmere"
        ],
        "urgent_need": [
            {"text": "the Lord's private jet", "weight": 5},
            {"text": "a new crystal cathedral", "weight": 4},
            {"text": "holy water imported from Jordan", "weight": 3},
            {"text": "diamond-encrusted prayer wheels", "weight": 2},
            {"text": "a solid gold pulpit", "weight": 1}
        ],
        "divine_consequence": [
            "your crops will flourish",
            "wealth will rain upon you",
            "angels will guard your wallet",
            "prosperity will multiply tenfold",
            "divine financial blessings will overflow"
        ],
        "negative_consequence": [
            {"text": "financial drought", "weight": 3},
            {"text": "spiritual bankruptcy", "weight": 3},
            {"text": "cursed credit score", "weight": 2},
            {"text": "heavenly audit", "weight": 1}
        ],
        "money_request": {
            "type": "conditional",
            "options": [
                {
                    "text": "Send just $#donation_amount# and #divine_consequence#!",
                    "conditions": {"donation_amount": {"$lt": 200}},
                    "actions": {"set": {"donation_amount": {"$multiply": 2}}}
                },
                {
                    "text": "The Lord requires $#donation_amount# for #urgent_need#!",
                    "conditions": {"donation_amount": {"$gte": 200}},
                    "actions": {"increment": {"miracle_count": 1}}
                }
            ],
            "fallback": "Donations of any amount are blessed!"
        },
        "main_sermon": [
            "#greeting# I am #divine_title# #preacher_name#, and the Lord has spoken to me! #money_request# But if you delay, beware of #negative_consequence#! Call now!"
        ]
    },
    "entry_points": {
        "default": "main_sermon",
        "alternatives": ["greeting", "money_request"]
    }
}

# Satanic Panic Generator
satanic_panic_generator = {
    "metadata": {
        "name": "1980s Satanic Panic Generator",
        "version": "1.0.0", 
        "description": "Generates absurd 1980s-style satanic panic conspiracy theories",
        "author": "Historical Satire Writer",
        "created": "2025-06-21",
        "category": "historical-comedy",
        "tags": ["1980s", "moral-panic", "conspiracy", "satire", "history"]
    },
    "assets": {
        "images": ["vhs_static.gif", "80s_news_desk.jpg", "worried_parent.png"],
        "audio": ["dramatic_sting.wav", "80s_news_theme.mp3"],
        "fonts": ["80s_computer.ttf"],
        "styles": {
            "background": "#000080",
            "text_color": "#FFFF00",
            "warning_color": "#FF0000"
        }
    },
    "variables": {
        "panic_level": {
            "type": "number",
            "default": 1,
            "description": "Current level of moral panic (1-10)"
        },
        "year": {
            "type": "number",
            "default": 1985,
            "description": "Year of the panic"
        }
    },
    "grammar": {
        "innocent_activity": [
            {"text": "playing Dungeons & Dragons", "weight": 5},
            {"text": "listening to heavy metal", "weight": 4},
            {"text": "reading fantasy novels", "weight": 3},
            {"text": "playing video games", "weight": 3},
            {"text": "watching cartoons", "weight": 2},
            {"text": "collecting Pokemon cards", "weight": 1}
        ],
        "evil_transformation": [
            "summoning demons",
            "joining secret cults",
            "sacrificing homework to dark forces",
            "speaking in ancient tongues during math class",
            "drawing pentagrams in notebook margins"
        ],
        "concerned_authority": [
            {"text": "local pastor", "weight": 4},
            {"text": "school principal", "weight": 3},
            {"text": "PTA president", "weight": 3},
            {"text": "concerned mother", "weight": 5},
            {"text": "television psychologist", "weight": 2}
        ],
        "absurd_evidence": [
            "backwards messages in Saturday morning cartoons",
            "satanic symbols in breakfast cereal",
            "demonic possession via calculator displays",
            "subliminal messages in elevator music",
            "occult rituals disguised as gym class"
        ],
        "dramatic_claim": [
            {"text": "SHOCKING", "weight": 3},
            {"text": "TERRIFYING", "weight": 3},
            {"text": "UNPRECEDENTED", "weight": 2},
            {"text": "MIND-BLOWING", "weight": 2},
            {"text": "EARTH-SHATTERING", "weight": 1}
        ],
        "panic_headline": {
            "type": "weighted",
            "options": [
                "#dramatic_claim#: Local #concerned_authority# warns that #innocent_activity# leads to #evil_transformation#!",
                "BREAKING: #absurd_evidence# discovered in suburban neighborhood!",
                "PARENTS BEWARE: Your children's #innocent_activity# hobby may be #evil_transformation#!",
                "#concerned_authority# reveals #dramatic_claim# truth about #absurd_evidence#!"
            ],
            "weights": [4, 3, 5, 3]
        },
        "expert_quote": [
            "According to my research, #innocent_activity# is clearly a gateway to #evil_transformation#",
            "The signs are everywhere - #absurd_evidence# proves the influence is real",
            "As a #concerned_authority#, I've seen firsthand how #innocent_activity# corrupts our youth"
        ]
    },
    "entry_points": {
        "default": "panic_headline",
        "alternatives": ["expert_quote", "dramatic_claim"]
    }
}

# Save the generators to files
with open('televangelist_generator.json', 'w') as f:
    json.dump(televangelist_generator, f, indent=2)

with open('satanic_panic_generator.json', 'w') as f:
    json.dump(satanic_panic_generator, f, indent=2)

print("Created example generators:")
print("\n1. Televangelist Generator:")
print(f"- {len(televangelist_generator['grammar'])} grammar rules")
print(f"- Entry point: {televangelist_generator['entry_points']['default']}")

print("\n2. Satanic Panic Generator:")
print(f"- {len(satanic_panic_generator['grammar'])} grammar rules") 
print(f"- Entry point: {satanic_panic_generator['entry_points']['default']}")

print("\nFiles saved: televangelist_generator.json, satanic_panic_generator.json")