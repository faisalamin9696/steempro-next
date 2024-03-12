'use client';

import React from 'react'
import { AboutItem } from './_components/AboutItem';
import './style.scss'
import MainWrapper from '@/components/wrapper/MainWrapper';
import { Metadata } from 'next';
import CommunityAboutTab from '../community/(tabs)/about/page';
import { empty_community } from '@/libs/constants/Placeholders';
const community = {
    "id": 1947,
    "type": "topic",
    "account": "hive-144064",
    "account_reputation": 44.997,
    "created": 1613723421,
    "rank": 20,
    "sum_pending": 1001.267,
    "count_pending": 1164,
    "count_authors": 63,
    "count_subs": 9948,
    "lang": "en",
    "title": "Beauty of Creativity",
    "about": "All kinds of creative works.Beauty in your mind.Take it out and let it go. Discord- https://discord.gg/RX86Cc4FnA",
    "description": "All kinds of creative works like Art,photography,singing, writing &articles [about travel sports science and technology economy life and life-style poetry story ).You can make posts here in the community with quality content.\nQuality content will be rewarded.",
    "flag_text": "User must share introduction post in the community to be a verified member.\nPost must contain minimum 50-100 words to get curated. We wont support the posts that are created with low efforts.\nUse your country tag in first 4 tags while posting. For example if you are from India use india tag in your first 4 tags\nTry to be an active user in this community. While you are expecting support from others you have to support  engage with other users as well\nPlagiarism is strictly prohibited. If you get caught while doing this heinous act we will label you as 1st Warning. And if you get caught for the second time youll be banned  muted from this community.\nMost importantly open the door of your creativity. Always remember that your posts reflects who you are.\n\nOur Preferred language is English. Though we will accept post in Bengali too.",
    "is_nsfw": 0,
    "settings": "{}",
    "observer_subscribed": 1,
    "observer_role": "mod",
    "observer_title": "【Executive Mod】✴️✴️",
    "roles": {
        "cols": {
            "created": 0,
            "account": 1,
            "title": 2,
            "role": 3
        },
        "rows": [
            [
                1613723424,
                "hive-144064",
                "【Owner Account】",
                "owner"
            ],
            [
                1613723430,
                "blacks",
                "[Founder&Admin]✔🇮🇳",
                "admin"
            ],
            [
                1623652920,
                "rme",
                "",
                "admin"
            ],
            [
                1613894715,
                "photoman",
                "Curator",
                "mod"
            ],
            [
                1615623102,
                "abduhawab",
                "【 Chief Executive Mod】✴️✴️✴️",
                "mod"
            ],
            [
                1618432707,
                "beautycreativity",
                "Community curator-official🇮🇳",
                "mod"
            ],
            [
                1621611690,
                "bountyking5",
                "【Quality Controller Mod】✴️",
                "mod"
            ],
            [
                1621866582,
                "faisalamin",
                "【Executive Mod】✴️✴️",
                "mod"
            ],
            [
                1640871831,
                "shy-bot",
                "【Official Bot ⭐ 】",
                "mod"
            ],
            [
                1647691815,
                "swagata21",
                "【Community Co-ordinator】☑️💫🇮🇳",
                "mod"
            ],
            [
                1649405298,
                "boc-contests",
                "【 BoC Contests Handler ☑️ 】",
                "mod"
            ],
            [
                1613724753,
                "simaroy",
                "[D-100SP]【 Verified Member✅】",
                "member"
            ],
            [
                1614879600,
                "featherfoam",
                "【Verified Member✅】",
                "member"
            ],
            [
                1615623189,
                "godingame",
                "[D-1042SP]【 Verified Member✅】",
                "member"
            ],
            [
                1615623231,
                "green015",
                "Verified Member ☑️",
                "member"
            ],
            [
                1616405073,
                "akukamaruzzaman",
                "[D-500SP]【 Verified Member✅】",
                "member"
            ],
            [
                1616405223,
                "sonualam",
                "Crypto Writer",
                "member"
            ],
            [
                1616405298,
                "banapat",
                "Diary Writer",
                "member"
            ],
            [
                1616847300,
                "lingkar-photo",
                "",
                "member"
            ],
            [
                1616847417,
                "new-spirit",
                "【Verified Member✅】",
                "member"
            ],
            [
                1617349716,
                "rasya-jef80",
                "Quality Photographer",
                "member"
            ],
            [
                1617525867,
                "steemnaishacake",
                "Photographer",
                "member"
            ],
            [
                1617568935,
                "tucsond",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1617768708,
                "tonitrade",
                "Photographer",
                "member"
            ],
            [
                1617894468,
                "masril",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1617953136,
                "winkles",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1617953325,
                "faizarfatria",
                "Nature Photographer",
                "member"
            ],
            [
                1617953364,
                "dear-davil468",
                "Wildlife Photographer",
                "member"
            ],
            [
                1617953433,
                "kemal13",
                "[D-100SP] 【 Verified Member✅】",
                "member"
            ],
            [
                1617953547,
                "chireerocks",
                "Creative Writer【Verified✅  】",
                "member"
            ],
            [
                1617953712,
                "dhilvi-desi86",
                "Wildlife Photographer",
                "member"
            ],
            [
                1617953754,
                "kudfa",
                "Nature Photographer",
                "member"
            ],
            [
                1617953787,
                "maulida",
                "【Verified Member✅】",
                "member"
            ],
            [
                1617953946,
                "lovely01",
                "☑️Verified Member ✓",
                "member"
            ],
            [
                1618397454,
                "dine77",
                "",
                "member"
            ],
            [
                1618930848,
                "nazarul",
                "[D-1500SP]【 Verified Member✅】",
                "member"
            ],
            [
                1619109165,
                "mrnazrul",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1619109240,
                "ahlawat",
                "[D-102SP]【 Verified Member✅】",
                "member"
            ],
            [
                1619194764,
                "razack-pulo",
                "[D-517SP]【 Verified Member✅】",
                "member"
            ],
            [
                1619366760,
                "sayaalan",
                "【 Verified Member✅】not dedicated",
                "member"
            ],
            [
                1619367798,
                "iqbal-pasee",
                "[D-3510SP]【 Verified Member✅】",
                "member"
            ],
            [
                1619713431,
                "hafizullah",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1619885268,
                "herimukti",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1620664002,
                "muhd.abrar",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1621350654,
                "setia.budi",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1622382936,
                "fendie",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1622405061,
                "shuvo35",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1623696255,
                "tailah.bayu",
                "[D-200SP]【 Verified Member✅】",
                "member"
            ],
            [
                1623925290,
                "ewiendos",
                "【Verified Member✅】",
                "member"
            ],
            [
                1623925377,
                "selinasathi1",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1624544175,
                "steem-muksal",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1624544277,
                "steem-for-future",
                "[D-7600SP]【 Verified Member✅】",
                "member"
            ],
            [
                1626013920,
                "fahad3728",
                "[D-5373SP]【 Verified Member✅】",
                "member"
            ],
            [
                1626031863,
                "tanuja",
                "[2nd Admin]✔🇮🇳",
                "member"
            ],
            [
                1626313437,
                "rasel72",
                "【Verified Member✅】",
                "member"
            ],
            [
                1626364881,
                "hidayat96",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1626478782,
                "pieasant",
                "【Verified member✅】",
                "member"
            ],
            [
                1626632949,
                "nasrol",
                "【Verified member✅】",
                "member"
            ],
            [
                1626778743,
                "mrsfurqan",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1626868251,
                "ferifelanai",
                "[D-100SP] 【 Verified Member✅】",
                "member"
            ],
            [
                1628868846,
                "dani0661",
                "Content Verification Failed",
                "member"
            ],
            [
                1629028668,
                "mrjhon01",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1629535287,
                "nevlu123",
                "[D-7000SP]【 Verified Member✅】",
                "member"
            ],
            [
                1629560880,
                "engrsayful",
                "[D-104SP]【 Verified Member✅】",
                "member"
            ],
            [
                1629648714,
                "zakie92",
                "【Verified Member ✅not dedicated",
                "member"
            ],
            [
                1629729657,
                "rayhan111",
                "[D-4144SP]【 Verified Member✅】",
                "member"
            ],
            [
                1629819477,
                "alif111",
                "[D-151SP]【 Verified Member✅】",
                "member"
            ],
            [
                1629819699,
                "mohamad786",
                "[D-4040SP]【 Verified Member✅】",
                "member"
            ],
            [
                1630372527,
                "fabiha",
                "【Verified Member✅】",
                "member"
            ],
            [
                1630671501,
                "amjadsharif",
                "[D-600]【Verified Member ✅】",
                "member"
            ],
            [
                1630764060,
                "bushramalik",
                "[D-50SP]【Verified Member✅】",
                "member"
            ],
            [
                1631196144,
                "mohammadfaisal",
                "【Verified member 】",
                "member"
            ],
            [
                1631202852,
                "arvindkumar",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1631290164,
                "ammar79",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1631689575,
                "afzalqamar",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1631899347,
                "khaidir",
                "【Verified member✅】",
                "member"
            ],
            [
                1631992644,
                "rashid001",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1631994090,
                "rafi4444",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1632128202,
                "partner-macro",
                "【Verified Member ✅]",
                "member"
            ],
            [
                1632149853,
                "realworld23",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1632230544,
                "blessed-girl",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1632315354,
                "aaliarubab",
                "【Verified member✅】",
                "member"
            ],
            [
                1632400623,
                "nastyasam",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1632584490,
                "udyliciouz",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1632584991,
                "farhanshadik",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1632631821,
                "peerfaizan",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1632766062,
                "sury",
                "[Verified Member ]not dedicated",
                "member"
            ],
            [
                1633023009,
                "shuvo2030",
                "member",
                "member"
            ],
            [
                1633182756,
                "idayrus",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1633378815,
                "deimage",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1633842957,
                "whalewinners",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1634403153,
                "rahmat31",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1634493039,
                "scoblack",
                "[D-52SP]【 Verified Member✅】",
                "member"
            ],
            [
                1634530644,
                "umair96",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1634569482,
                "joel0",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1634908590,
                "mizna.says",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1634913807,
                "bristy1",
                "[D-4025SP]【 Verified Member✅】",
                "member"
            ],
            [
                1635082944,
                "zullfahmi",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1635352818,
                "tasonya",
                "[D-4026SP]【 Verified Member✅】",
                "member"
            ],
            [
                1635442494,
                "afdhal23",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1635442791,
                "narocky71",
                "[D-4800SP]【 Verified Member✅】",
                "member"
            ],
            [
                1635442806,
                "ah-agim",
                "[D-2000SP]【 Verified Member✅】",
                "member"
            ],
            [
                1635605793,
                "sadia7",
                "[D-2100SP]【 Verified Member✅】",
                "member"
            ],
            [
                1635617550,
                "jasonmunapasee",
                "[D-4900SP]【 Verified Member✅】",
                "member"
            ],
            [
                1635677355,
                "tayyab100",
                "[D-407SP]【 Verified Member✅】",
                "member"
            ],
            [
                1635863682,
                "rasma",
                "[D-3600SP]【 Verified Member✅】",
                "member"
            ],
            [
                1635863685,
                "village-hery",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1636035636,
                "emirzafirdaus",
                "[D-103SP]【 Verified Member✅】",
                "member"
            ],
            [
                1636121772,
                "emonv",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1636293618,
                "liamnov",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1636389582,
                "fahmiam",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1636482885,
                "bdwomen",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1636817016,
                "shuvobd1",
                "[D-3400SP]【 Verified Member✅】",
                "member"
            ],
            [
                1636822323,
                "maxwellmarcusart",
                "【Verified Member✅】",
                "member"
            ],
            [
                1637071311,
                "shahin05",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1637077752,
                "kurza",
                "【Verified Member✅】",
                "member"
            ],
            [
                1637248527,
                "nasir.steem",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1637329437,
                "sumon09",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1637599494,
                "a-h-p",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1637676033,
                "rhosadah",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1637765856,
                "artxharpreet",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1637765859,
                "nsisongudofia",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1638180882,
                "putrazara",
                "[D-51SP]【 Verified Member✅】",
                "member"
            ],
            [
                1638374577,
                "ustazkarim",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1638460557,
                "biplopali",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1638548343,
                "alfimadu",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1638548472,
                "mainsir.forester",
                "[D-50SP]【 Verified Member✅】",
                "member"
            ],
            [
                1638549258,
                "metugejacy20",
                "【Verified Member✅】",
                "member"
            ],
            [
                1638631170,
                "devi2021",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1638718749,
                "rajaachenes",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1638811737,
                "aktrazee",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1639157106,
                "sanupam",
                "【Verified Member✅】",
                "member"
            ],
            [
                1639414017,
                "martunus93",
                "【Verified Member✅】",
                "member"
            ],
            [
                1639497909,
                "malek92",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1639669275,
                "zislam",
                "【Verified Member✅】",
                "member"
            ],
            [
                1639669281,
                "alfazmalek",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1639831785,
                "chairulrizalx",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1640533593,
                "re-nazimsorker10",
                "【Verified Member✅】",
                "member"
            ],
            [
                1640541711,
                "ahmadraza12",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1640541921,
                "arslanaj",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1640544393,
                "ghazi.vani",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1640703756,
                "hirarauf",
                "【Verified Member✅】",
                "member"
            ],
            [
                1640703762,
                "maqbool12",
                "【Verified Member✅】",
                "member"
            ],
            [
                1640703789,
                "ahanaf",
                "【Verified Member✅】",
                "member"
            ],
            [
                1641068736,
                "tanjim01",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1641217836,
                "kawsar",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1641657453,
                "khan55",
                "【Verified Member✅】",
                "member"
            ],
            [
                1641915357,
                "hamzayousafzai",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1641993834,
                "tayyabshafiq187",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1642011465,
                "engtariqul",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1642354074,
                "nusratjahan77",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1642605096,
                "graciella",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1642618356,
                "daiky69",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1642780224,
                "fonjougiresse",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1642884072,
                "obedchinedu",
                "【Verified Member✅】",
                "member"
            ],
            [
                1642930575,
                "promisearts",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1643210550,
                "shezikhan",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1643382897,
                "ajirfalaky",
                "[D-51SP]【 Verified Member✅】",
                "member"
            ],
            [
                1643382930,
                "razi28",
                "【Verified Member✅】",
                "member"
            ],
            [
                1643382945,
                "akbar2468",
                "【Verified Member✅】",
                "member"
            ],
            [
                1643471613,
                "eshacheema786",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1643565660,
                "ahsanbilal",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1643646027,
                "sealnavy",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1643737818,
                "tkadelaide11",
                "【Verified Member✅】",
                "member"
            ],
            [
                1643737965,
                "ridoyhasan420",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1643806107,
                "mamunxxx",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1643828829,
                "bilaldogar",
                "【Verified Member✅】",
                "member"
            ],
            [
                1643915082,
                "muhammadfarhan78",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1643915091,
                "sojibuddin",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1643963280,
                "neamul-bd",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1643963556,
                "hasiburrahman1",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1644000567,
                "biplob25",
                "[D-50SP]【 Verified Member✅】",
                "member"
            ],
            [
                1644084159,
                "tanjima",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1644149811,
                "rayhan4747",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1644149907,
                "razuan12",
                "[D-500SP]【 Verified Member✅】",
                "member"
            ],
            [
                1644164313,
                "profebubba",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1644171267,
                "awais-raza",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1644235488,
                "sohag27",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1644241416,
                "sadia-bd",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1644257856,
                "sameer07",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1644292554,
                "mahir4221",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1644391887,
                "saymaakter",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1644416766,
                "ronykhan143",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1644498633,
                "mohdzubirdesray",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1644677004,
                "zainabfarman",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1644681918,
                "zohaib96",
                "[D-50SP]【 Verified Member✅】",
                "member"
            ],
            [
                1644687501,
                "alianwar96",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1644762270,
                "siandi",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1644762300,
                "mto-bd",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1644762381,
                "salmanabir",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1644769068,
                "abusalehnahid",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1644817020,
                "simeon00",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1644823098,
                "hadi87",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1644932064,
                "ngamd",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1644987198,
                "fasoniya",
                "[D-4016SP]【 Verified Member✅】",
                "member"
            ],
            [
                1644991074,
                "abialfatih",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1645087683,
                "sadiamou",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1645098360,
                "haris4545",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1645119183,
                "david-city",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1645119228,
                "mukulhossain",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1645119258,
                "narasi",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1645274730,
                "rupaie22",
                "[D-50SP]【 Verified Member✅】",
                "member"
            ],
            [
                1645366629,
                "cocomuff",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1645452162,
                "william8wayward",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1645537335,
                "jojoyapo",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1645541538,
                "jubaidul30",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1645623441,
                "jaabbeee",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1645627728,
                "kemsa",
                "[D-550SP]【 Verified Member✅】",
                "member"
            ],
            [
                1645698693,
                "mehakbhatti",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1645796241,
                "jahidulislam01",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1645846722,
                "chiomzy810",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1645965954,
                "mirzapalevi",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1646058783,
                "mehedi0910",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1646188611,
                "kibreay001",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1646232786,
                "ronggin",
                "[D-100SP]【 Verified Member✅】",
                "member"
            ],
            [
                1646232810,
                "mdriart",
                "[D-3300SP]【 Verified Member✅】",
                "member"
            ],
            [
                1646295720,
                "zulhendra",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1646396001,
                "ashik11",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1646498859,
                "asamkana1",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1646498868,
                "mustafiz99",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1646534193,
                "imamsamudra",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1646548638,
                "syawalkoki",
                "[D-714SP]【 Verified Member✅】",
                "member"
            ],
            [
                1646664606,
                "alisher1234",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1646804760,
                "fariyazulfiqar",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1646822970,
                "forhadmiya",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1646837178,
                "biojoy",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1646840613,
                "walad",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1646913021,
                "xhyd09",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1647132138,
                "jihadkhan",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1647147192,
                "ariful2",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1647432129,
                "ahmed153",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1647495882,
                "enamul17",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1647496092,
                "jubayer687728",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1647496149,
                "nacim-rana",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1647796779,
                "josepha",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1647824910,
                "aniksikder",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1647969510,
                "lensaphoto",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1647969597,
                "mauliati",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648007460,
                "mosaidur",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648025415,
                "genesisaguilera",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648047504,
                "alvida",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648047711,
                "tanmoy17",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648059252,
                "sikakon",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648134087,
                "silbenboy",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648223025,
                "farhannabil",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648260372,
                "mkodeking",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648294083,
                "mdkamran99",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648393860,
                "alihighder12",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648565505,
                "shohel44",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648711251,
                "sycone",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648715847,
                "bilalspu",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648750854,
                "md-shahed",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648784280,
                "gust.art",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648784295,
                "rashmarashma",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648837272,
                "mujtabarabbani",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648983528,
                "arifulsa12",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1648992312,
                "rubayat02",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1649077998,
                "rabbirs",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1649088612,
                "khairoel",
                "[D-51SP]【 Verified Member✅】",
                "member"
            ],
            [
                1649175657,
                "chukyy",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1649261940,
                "mki111",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1649336634,
                "mdshanto",
                "[D-2020SP]【 Verified Member✅】",
                "member"
            ],
            [
                1649336649,
                "hassanrazaa",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1649442006,
                "whileponderin",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1649600202,
                "rezaseo",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1649657280,
                "kenalofficial",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1649664981,
                "romansarkar255",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1649694612,
                "mahmud-ashik",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1649694624,
                "muja01",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1649746485,
                "nadimmahmud",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1649763837,
                "mostofajaman",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1649892123,
                "mahmudulhasan513",
                "【 Under Observation】",
                "member"
            ],
            [
                1649892198,
                "mehedy2526",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650127908,
                "mehedihasanseo",
                "【Verified Member✅】",
                "member"
            ],
            [
                1650206901,
                "mosman",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650213648,
                "firozgazi",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650285846,
                "mdsumon7",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650285918,
                "shahariar1",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650285921,
                "ab-rafi",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650285927,
                "samhunnahar",
                "[D-1000SP]【 Verified Member✅】",
                "member"
            ],
            [
                1650409548,
                "jousnaakther",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650471327,
                "anisshamim",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650599379,
                "ride1",
                "[D-4010SP]【 Verified Member✅】",
                "member"
            ],
            [
                1650599406,
                "tanvir128",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650599430,
                "sofitufail",
                "Under Observation",
                "member"
            ],
            [
                1650599727,
                "faruk123",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650621678,
                "maksudakawsar",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650697986,
                "jmnaahin",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650698040,
                "rubephm",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650715506,
                "sharminsumi",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650825327,
                "hammad44",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650825357,
                "karimshah",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650825390,
                "sabajannat66",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650877068,
                "nooruleman",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650902958,
                "nazirmithu",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1650979239,
                "subornamojumder",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1651036488,
                "shimulakter",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1651125900,
                "hattaarshavin",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1651169886,
                "sadiaafrojj",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1651354467,
                "sanjanamursalina",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1651358946,
                "jahid134",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1651494009,
                "tathagatachy",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1651670187,
                "bidyut01",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1651758066,
                "cracker07",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1651946985,
                "kstroton",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1652023347,
                "fahimshahriar13",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1652104446,
                "moniruzzamankhan",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1652291772,
                "zobayerr",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1652317311,
                "miss-crypto",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1652346552,
                "kaziamanat01",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1652370210,
                "isabeldc10",
                "【Verified Member ✅】",
                "member"
            ],
            [
                1652370213,
                "sumit71428",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1652512254,
                "aburihan1",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1652617803,
                "ebrahim2021",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1653312240,
                "talhajubair",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1653667809,
                "faisalcontent",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1653809061,
                "md-razu",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1653816579,
                "ripon40",
                "[D-4200SP]【 Verified Member✅】",
                "member"
            ],
            [
                1653920238,
                "emranhasan",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1654189431,
                "moh15698",
                "Under Observation",
                "member"
            ],
            [
                1654880967,
                "salmacheema",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1654933128,
                "ashikur50",
                "[D-2507SP]【 Verified Member✅】",
                "member"
            ],
            [
                1655133357,
                "fiqfox",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1655307078,
                "arsalaan",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1655310618,
                "smsultanraj",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1655548824,
                "mhmaruf",
                "[D-4007SP]【 Verified Member✅】",
                "member"
            ],
            [
                1655616657,
                "mr-sentu",
                "[D-3017SP]【 Verified Member✅】",
                "member"
            ],
            [
                1655657616,
                "cmchandrika",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1655787459,
                "shahinislam11",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1655828619,
                "shipracha",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1655828883,
                "mohinahmed",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1655898354,
                "yasirgujrati",
                "Under Observation",
                "member"
            ],
            [
                1655916480,
                "mizrah",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1656008082,
                "abu78",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1656008130,
                "mabiya00",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1656291345,
                "jannatmou",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1656387633,
                "rahnumanurdisha",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1656647523,
                "prioshi",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1656702924,
                "mjjahid",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1657357734,
                "jhellenmjgr",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1657641288,
                "gansh",
                "【Verified Member✅】",
                "member"
            ],
            [
                1657792527,
                "ayesha-s",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1658376465,
                "zulqarnain1060",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1658595966,
                "eh2288",
                "Under Observation",
                "member"
            ],
            [
                1658846469,
                "azmat545",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1659804918,
                "ana07",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1660285752,
                "joslud",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1660285827,
                "bijoy1",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1660401033,
                "josimuddin6565",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1660673982,
                "jamal7",
                "[D-2000SP]【 Verified Member✅】",
                "member"
            ],
            [
                1660747047,
                "mrahul40",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1660920558,
                "khokonshariful",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1661098440,
                "nohe15",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1661528997,
                "samiullahsamir",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1663070289,
                "enrisanti",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1663427418,
                "steempro.com",
                "SteemPro Official",
                "member"
            ],
            [
                1663517520,
                "yoieuqudniram",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1664031528,
                "k-karim",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1664813202,
                "siraj09",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1665036495,
                "hassan205",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1665241656,
                "mehedihasan24",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1665301428,
                "amanatacca2020",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1665384330,
                "zeenataman",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1665384348,
                "falgunykhanom",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1665653619,
                "kuwaiti",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1665819180,
                "nishatoishi",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1666345149,
                "fz5",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1666723275,
                "seapearl",
                "",
                "member"
            ],
            [
                1667113884,
                "dove11",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1667730123,
                "hasina78",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1668953409,
                "shiftitamanna",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1668953415,
                "nirob70",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1669036095,
                "shikhurana",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1669113624,
                "monirm",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1669817370,
                "mateen005",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1670499012,
                "azizpatoary",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1670735673,
                "sampaaktar",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1671002904,
                "mdtouhidul",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1671298797,
                "badshahbd",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1671350172,
                "shahinurjahan",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1671374772,
                "diptimajumder",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1671687087,
                "radleking",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1671687189,
                "kashfeya",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1671694887,
                "ahp93",
                "[D-7200SP]【 Verified Member✅】",
                "member"
            ],
            [
                1671724521,
                "afroza1",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1671979623,
                "sharrmin",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1671979716,
                "anikaislam",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1671979821,
                "farhanaaysha",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1671979875,
                "afrojalucky",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1671980820,
                "mostaqul",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1672071612,
                "elzia",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1672321146,
                "emonhossain9",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1672499148,
                "jollymonoara",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1672499157,
                "emultiplex",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1672499349,
                "kanijakborbd",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1672583325,
                "sadiaafreen",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1672684761,
                "tanju123",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1672767909,
                "aliyamarketer",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1672904463,
                "kanzabasit",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1673790117,
                "mahedi650",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1674232200,
                "fatemamarketing",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1674885615,
                "lailatulferdawsi",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1675009407,
                "mohsenaakter",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1675009416,
                "mdraselmia",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1675009422,
                "rezaulfdm",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1675009428,
                "mizanariyan",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1675009440,
                "shuly",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1675056534,
                "orange2",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1675095564,
                "ismotara",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1675144386,
                "clingy",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1675175166,
                "shuvra",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1675332411,
                "joniprins",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1675773873,
                "khursheedanwar",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1675773951,
                "sahar78",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1675835535,
                "tasrin94",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1676025441,
                "farjanasultana",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1676043207,
                "rimirahman",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1676043294,
                "aparajitoalamin",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1676223006,
                "mahadisalim",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1676230062,
                "sahadeb07",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1676306061,
                "mrdani12",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1676309652,
                "sanjana01842",
                "Under Observation",
                "member"
            ],
            [
                1676834682,
                "malorysarker",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1676834742,
                "ashrafulrifat",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1677431127,
                "sohel57",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1677431145,
                "anupomthander",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1677587928,
                "riyadx2",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1677737958,
                "giovanni0",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1677784245,
                "roselys",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1677850860,
                "arispranata5",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1678046682,
                "promah",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1678643577,
                "jahidparvez07",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1679255337,
                "aurin",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1679255346,
                "sadiyaprity",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1679337591,
                "aimanafzal",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1679874588,
                "naziahaque",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1680168849,
                "kinzamanzoor",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1680478743,
                "tahirajannat",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1680478752,
                "neyistar23",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1680989139,
                "aditi993",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1681069308,
                "tuhin002",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1681659594,
                "bambuka",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1681697244,
                "muktaseo",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1681697265,
                "mkmostafa",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1681697328,
                "sinthiyadisha",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1681818714,
                "vanessageorge",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1682489574,
                "ruma0630",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1682740767,
                "azizulmiah",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1683031923,
                "rimon03",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1683300471,
                "antusaha",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1683407445,
                "antikus369",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1684684938,
                "sayeedasultana",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1684685022,
                "mimakterbd",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1684685652,
                "sairazerin",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1684685682,
                "hasnahena",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1685111511,
                "chahmad12",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1685369853,
                "ponpase",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1685732388,
                "steemarcos",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1685894967,
                "rialsyah",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1686675582,
                "forhadh",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1687124640,
                "toma60",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1687258317,
                "zulqernain",
                "【Verified Member✅】",
                "member"
            ],
            [
                1688212665,
                "josiah09",
                "Under Observation",
                "member"
            ],
            [
                1688925495,
                "samin1",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1689007746,
                "jueco",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1689701826,
                "hotspotitaly",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1690077498,
                "haiderbablu",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1690138593,
                "mukitsalafi",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1690394601,
                "yousha4",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1690394619,
                "farhanahossin",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1690648869,
                "acostaeladio",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1690735314,
                "oscardavid79",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1690827006,
                "robin46",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1690901766,
                "jozzie90",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1691082912,
                "jerin-tasnim",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1691249463,
                "abdullah-44",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1691596740,
                "techsoulai",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1691754837,
                "sumon03",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1691860482,
                "tammanna",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1691932572,
                "rumaahmed",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1691932581,
                "rajusam",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1691996070,
                "fkhanom",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1691996145,
                "tishasultana",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1691996211,
                "rumanaafroz",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1691996238,
                "hrebaka",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1691996310,
                "steemhadiul",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1692118290,
                "abdulmukit",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1692591759,
                "tarminnupur",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1692980469,
                "jimiaera02",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1693223931,
                "mdarazzak",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1693845321,
                "sabahaque",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1693845336,
                "nabilanusrat",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1693845354,
                "ummayshakira",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1694275368,
                "rekha-shortvids",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1694450391,
                "mahfuzabegum28",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1694608911,
                "sajjadbd",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1695058812,
                "simonnwigwe",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1695234633,
                "imranhassan",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1696956144,
                "sujon3254",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1697340159,
                "mahmudul20",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1697384298,
                "habiba01",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1697736495,
                "hanif6494",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1697913141,
                "germanbava",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1698076245,
                "celts",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1698245850,
                "jubayer119",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1698245904,
                "miswarofficiall",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1699697190,
                "jasimuddin0",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1700841429,
                "djvijay",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1700841432,
                "shemzee",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1700841435,
                "ilias12",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1702141200,
                "mrsokal",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1702141206,
                "shahid540",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1702737930,
                "sajibuldr",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1702737945,
                "ahsansharif",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1702910025,
                "drsumon",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1703001000,
                "ti-taher",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1703332293,
                "ayshasaroni",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1703784801,
                "sahidfarabee",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1705255023,
                "pinkcastle",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1705571421,
                "danish578",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1708447512,
                "huntershotz",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1708536123,
                "nigarjebin",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1708661361,
                "suryanitj",
                "【 Verified Member✅】",
                "member"
            ],
            [
                1613724708,
                "dipro02",
                "",
                "guest"
            ],
            [
                1617475851,
                "dimanrama",
                "",
                "guest"
            ],
            [
                1617953247,
                "elianaelisma",
                "[Useless member]",
                "guest"
            ],
            [
                1617953496,
                "abuahmad",
                "Nature Photographer",
                "guest"
            ],
            [
                1619367078,
                "iqbal",
                "",
                "guest"
            ],
            [
                1650599637,
                "marouf22",
                "Under Observation",
                "guest"
            ],
            [
                1652371788,
                "isma-amir",
                "",
                "guest"
            ],
            [
                1661564775,
                "mala82",
                "",
                "guest"
            ],
            [
                1661629089,
                "sazzad69",
                "",
                "guest"
            ],
            [
                1617910572,
                "sparku22",
                "banned",
                "muted"
            ],
            [
                1618684233,
                "najie",
                "Permanently Banned 🚫",
                "muted"
            ],
            [
                1619448339,
                "shaheryarmalik",
                "banned",
                "muted"
            ],
            [
                1623126768,
                "hendrago",
                "[D-50SP]【1st Warning Plagiarism】",
                "muted"
            ],
            [
                1628299872,
                "tavara",
                "1st Warning Spam.",
                "muted"
            ],
            [
                1628339046,
                "yosiecivil",
                "1st Warning Plagiarism",
                "muted"
            ],
            [
                1628340675,
                "viclove1991",
                "1st Warning Plagiarism",
                "muted"
            ],
            [
                1629310965,
                "azeem22",
                "Permanently banned",
                "muted"
            ],
            [
                1630690362,
                "resilientknows",
                "",
                "muted"
            ],
            [
                1633808118,
                "lia91",
                "Scammer",
                "muted"
            ],
            [
                1633880718,
                "darina14",
                "Scammer",
                "muted"
            ],
            [
                1634913693,
                "mtm",
                "Under Observation",
                "muted"
            ],
            [
                1640884155,
                "rahul989",
                "【 Verified Member✅】",
                "muted"
            ],
            [
                1644749577,
                "estudiante13",
                "Scammer",
                "muted"
            ],
            [
                1648017945,
                "nigelmarkdias",
                "",
                "muted"
            ],
            [
                1648195347,
                "thomaslknapp",
                "Scammer",
                "muted"
            ],
            [
                1650622599,
                "taufiqurerahman",
                "Under Observation",
                "muted"
            ],
            [
                1652807445,
                "mamun123456",
                "",
                "muted"
            ],
            [
                1695635349,
                "toufiq777",
                "",
                "muted"
            ],
            [
                1695635358,
                "sohanurrahman",
                "",
                "muted"
            ],
            [
                1695635367,
                "selimreza1",
                "",
                "muted"
            ],
            [
                1695635373,
                "shamimhossain",
                "",
                "muted"
            ],
            [
                1695635382,
                "md-sajalislam",
                "",
                "muted"
            ]
        ]
    }
}

export default function AboutPage() {

    return (
        <MainWrapper >

            <CommunityAboutTab data={community as Community} />

            <div className='flex flex-col gap-6 mt-6'>

                <div className="about-section">
                    <h1>About Us</h1>
                    <p>SteemPro is the Steem blockchain's decentralized mobile and web app solution. It will allow the end user to perform all broadcast operations easily and securely with some additioanl benifits.
                        Web version also includes useful tools to analyze the author progress on this platform.
                    </p>
                </div>

                <h2 className='text-2xl font-bold text-center'>
                    Our Team</h2>
                <div className="flex flex-col md:flex-row gap-6 justify-center p-4">

                    <AboutItem username={'steempro.com'}
                        firstHeading={'Official Account'}
                        secondHeading={'steempro.official@gmail.com'}
                    />

                    <AboutItem username={'faisalamin'}
                        firstHeading={'Core Developer'}
                        secondHeading={'steempro.official@gmail.com'}
                    />




                </div>
            </div>
        </MainWrapper>
    )
}
