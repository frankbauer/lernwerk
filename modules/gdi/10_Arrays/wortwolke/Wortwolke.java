//#START STATIC
public class Wortwolke {
    private static int zaehleWort(String wort, String[] woerter) {
//#START STUDENT
        return 0;
//#START SOLUTION
        int summe = 0;
        for (int i = 0; i < woerter.length; i++) {
            if (wort.equals(woerter[i])) {
                summe += 1;
            }
        }
        return summe;
//#START STATIC
    }

    public static void main(String[] args) {
        // Wiederhole für jedes Wort im Text
        for (int i = 0; i < textWoerter.length; i++) {
            String wort = textWoerter[i];
            int anzahl = Wortwolke.zaehleWort(wort, textWoerter);
            Wortwolke.fuegeHinzu(wort, anzahl);
        }

        Wortwolke.sendeErgebnis();
    }
//#START API

    private static java.util.HashMap<String, Integer> words = new java.util.HashMap<>();

    private static void fuegeHinzu(String wort, int anzahl) {
        if (anzahl > 0) {
            words.put(wort, anzahl);
        }
    }

    private static void sendeErgebnis() {
        if (words.isEmpty()) {
            System.out.println("Es wurde noch kein Wort gezaehlt.");
        } else {
            // die drei häufigsten Wörter suchen
            String[] top = new String[3];
            for (int t = 0; t < top.length; t++) {
                for (String w : words.keySet()) {
                    if ((t == 0 || !w.equals(top[0])) && (t <= 1 || !w.equals(top[1]))
                            && (top[t] == null || words.get(w) > words.get(top[t]))) {
                        top[t] = w;
                    }
                }
            }
            System.out.println("Top 3 Woerter:");
            for (int t = 0; t < top.length; t++) {
                if (top[t] != null) {
                    System.out.println("  " + top[t] + " (" + words.get(top[t]) + ")");
                }
            }
        }

        String res = "[";
        for (String w : words.keySet()) {
            if (res.length() > 1) res += ",";
            res += "{\"text\":\"" + w + "\",\"count\":" + words.get(w) + "}";
        }
        res += "]";
        de.fau.tf.lgdv.CodeBlocks.postResult(res);
    }

    // Faust - Eine Tragödie, Zueignung und Vorspiel auf dem Theater (Johann Wolfgang von Goethe)
    private static String[] textWoerter = {
        "ihr", "naht", "euch", "wieder", "schwankende", "gestalten", "die", "frueh", "sich", "einst", "dem",
        "trueben", "blick", "gezeigt", "versuch", "ich", "wohl", "euch", "diesmal", "festzuhalten", "fuehl", "ich",
        "mein", "herz", "noch", "jenem", "wahn", "geneigt", "ihr", "draengt", "euch", "zu", "nun", "gut", "so",
        "moegt", "ihr", "walten", "wie", "ihr", "aus", "dunst", "und", "nebel", "um", "mich", "steigt", "mein",
        "busen", "fuehlt", "sich", "jugendlich", "erschuettert", "vom", "zauberhauch", "der", "euren", "zug",
        "umwittert", "ihr", "bringt", "mit", "euch", "die", "bilder", "froher", "tage", "und", "manche", "liebe",
        "schatten", "steigen", "auf", "gleich", "einer", "alten", "halbverklungnen", "sage", "kommt", "erste",
        "lieb", "und", "freundschaft", "mit", "herauf", "der", "schmerz", "wird", "neu", "es", "wiederholt", "die",
        "klage", "des", "lebens", "labyrinthisch", "irren", "lauf", "und", "nennt", "die", "guten", "die", "um",
        "schoene", "stunden", "vom", "glueck", "getaeuscht", "vor", "mir", "hinweggeschwunden", "sie", "hoeren",
        "nicht", "die", "folgenden", "gesaenge", "die", "seelen", "denen", "ich", "die", "ersten", "sang",
        "zerstoben", "ist", "das", "freundliche", "gedraenge", "verklungen", "ach", "der", "erste", "widerklang",
        "mein", "lied", "ertoent", "der", "unbekannten", "menge", "ihr", "beifall", "selbst", "macht", "meinem",
        "herzen", "bang", "und", "was", "sich", "sonst", "an", "meinem", "lied", "erfreuet", "wenn", "es", "noch",
        "lebt", "irrt", "in", "der", "welt", "zerstreuet", "und", "mich", "ergreift", "ein", "laengst",
        "entwoehntes", "sehnen", "nach", "jenem", "stillen", "ernsten", "geisterreich", "es", "schwebet", "nun",
        "in", "unbestimmten", "toenen", "mein", "lispelnd", "lied", "der", "aeolsharfe", "gleich", "ein", "schauer",
        "fasst", "mich", "traene", "folgt", "den", "traenen", "das", "strenge", "herz", "es", "fuehlt", "sich",
        "mild", "und", "weich", "was", "ich", "besitze", "seh", "ich", "wie", "im", "weiten", "und", "was",
        "verschwand", "wird", "mir", "zu", "wirklichkeiten", "direktor", "ihr", "beiden", "die", "ihr", "mir", "so",
        "oft", "in", "not", "und", "truebsal", "beigestanden", "sagt", "was", "ihr", "wohl", "in", "deutschen",
        "landen", "von", "unsrer", "unternehmung", "hofft", "ich", "wuenschte", "sehr", "der", "menge", "zu",
        "behagen", "besonders", "weil", "sie", "lebt", "und", "leben", "laesst", "die", "pfosten", "sind", "die",
        "bretter", "aufgeschlagen", "und", "jedermann", "erwartet", "sich", "ein", "fest", "sie", "sitzen", "schon",
        "mit", "hohen", "augenbraunen", "gelassen", "da", "und", "moechten", "gern", "erstaunen", "ich", "weiss",
        "wie", "man", "den", "geist", "des", "volks", "versoehnt", "doch", "so", "verlegen", "bin", "ich", "nie",
        "gewesen", "zwar", "sind", "sie", "an", "das", "beste", "nicht", "gewoehnt", "allein", "sie", "haben",
        "schrecklich", "viel", "gelesen", "wie", "machen", "wirs", "dass", "alles", "frisch", "und", "neu", "und",
        "mit", "bedeutung", "auch", "gefaellig", "sei", "denn", "freilich", "mag", "ich", "gern", "die", "menge",
        "sehen", "wenn", "sich", "der", "strom", "nach", "unsrer", "bude", "draengt", "und", "mit", "gewaltig",
        "wiederholten", "wehen", "sich", "durch", "die", "enge", "gnadenpforte", "zwaengt", "bei", "hellem", "tage",
        "schon", "vor", "vieren", "mit", "stoessen", "sich", "bis", "an", "die", "kasse", "ficht", "und", "wie",
        "in", "hungersnot", "um", "brot", "an", "baeckertueren", "um", "ein", "billet", "sich", "fast", "die",
        "haelse", "bricht", "dies", "wunder", "wirkt", "auf", "so", "verschiedne", "leute", "der", "dichter", "nur",
        "mein", "freund", "o", "tu", "es", "heute", "dichter", "o", "sprich", "mir", "nicht", "von", "jener",
        "bunten", "menge", "bei", "deren", "anblick", "uns", "der", "geist", "entflieht", "verhuelle", "mir", "das",
        "wogende", "gedraenge", "das", "wider", "willen", "uns", "zum", "strudel", "zieht", "nein", "fuehre",
        "mich", "zur", "stillen", "himmelsenge", "wo", "nur", "dem", "dichter", "reine", "freude", "blueht", "wo",
        "lieb", "und", "freundschaft", "unsres", "herzens", "segen", "mit", "goetterhand", "erschaffen", "und",
        "erpflegen", "ach", "was", "in", "tiefer", "brust", "uns", "da", "entsprungen", "was", "sich", "die",
        "lippe", "schuechtern", "vorgelallt", "missraten", "jetzt", "und", "jetzt", "vielleicht", "gelungen",
        "verschlingt", "des", "wilden", "augenblicks", "gewalt", "oft", "wenn", "es", "erst", "durch", "jahre",
        "durchgedrungen", "erscheint", "es", "in", "vollendeter", "gestalt", "was", "glaenzt", "ist", "fuer", "den",
        "augenblick", "geboren", "das", "echte", "bleibt", "der", "nachwelt", "unverloren", "lustige", "person",
        "wenn", "ich", "nur", "nichts", "von", "nachwelt", "hoeren", "sollte", "gesetzt", "dass", "ich", "von",
        "nachwelt", "reden", "wollte", "wer", "machte", "denn", "der", "mitwelt", "spass", "den", "will", "sie",
        "doch", "und", "soll", "ihn", "haben", "die", "gegenwart", "von", "einem", "braven", "knaben", "ist",
        "daecht", "ich", "immer", "auch", "schon", "was", "wer", "sich", "behaglich", "mitzuteilen", "weiss", "den",
        "wird", "des", "volkes", "laune", "nicht", "erbittern", "er", "wuenscht", "sich", "einen", "grossen",
        "kreis", "um", "ihn", "gewisser", "zu", "erschuettern", "drum", "seid", "nur", "brav", "und", "zeigt",
        "euch", "musterhaft", "lasst", "phantasie", "mit", "allen", "ihren", "choeren", "vernunft", "verstand",
        "empfindung", "leidenschaft", "doch", "merkt", "euch", "wohl", "nicht", "ohne", "narrheit", "hoeren",
        "direktor", "besonders", "aber", "lasst", "genug", "geschehn", "man", "kommt", "zu", "schaun", "man",
        "will", "am", "liebsten", "sehn", "wird", "vieles", "vor", "den", "augen", "abgesponnen", "so", "dass",
        "die", "menge", "staunend", "gaffen", "kann", "da", "habt", "ihr", "in", "der", "breite", "gleich",
        "gewonnen", "ihr", "seid", "ein", "vielgeliebter", "mann", "die", "masse", "koennt", "ihr", "nur", "durch",
        "masse", "zwingen", "ein", "jeder", "sucht", "sich", "endlich", "selbst", "was", "aus", "wer", "vieles",
        "bringt", "wird", "manchem", "etwas", "bringen", "und", "jeder", "geht", "zufrieden", "aus", "dem", "haus",
        "gebt", "ihr", "ein", "stueck", "so", "gebt", "es", "gleich", "in", "stuecken", "solch", "ein", "ragout",
        "es", "muss", "euch", "gluecken", "leicht", "ist", "es", "vorgelegt", "so", "leicht", "als", "ausgedacht",
        "was", "hilfts", "wenn", "ihr", "ein", "ganzes", "dargebracht", "das", "publikum", "wird", "es", "euch",
        "doch", "zerpfluecken", "dichter", "ihr", "fuehlet", "nicht", "wie", "schlecht", "ein", "solches",
        "handwerk", "sei", "wie", "wenig", "das", "dem", "echten", "kuenstler", "zieme", "der", "saubern", "herren",
        "pfuscherei", "ist", "merk", "ich", "schon", "bei", "euch", "maxime", "direktor", "ein", "solcher",
        "vorwurf", "laesst", "mich", "ungekraenkt", "ein", "mann", "der", "recht", "zu", "wirken", "denkt", "muss",
        "auf", "das", "beste", "werkzeug", "halten", "bedenkt", "ihr", "habet", "weiches", "holz", "zu", "spalten",
        "und", "seht", "nur", "hin", "fuer", "wen", "ihr", "schreibt", "wenn", "diesen", "langeweile", "treibt",
        "kommt", "jener", "satt", "vom", "uebertischten", "mahle", "und", "was", "das", "allerschlimmste", "bleibt",
        "gar", "mancher", "kommt", "vom", "lesen", "der", "journale", "man", "eilt", "zerstreut", "zu", "uns",
        "wie", "zu", "den", "maskenfesten", "und", "neugier", "nur", "befluegelt", "jeden", "schritt", "die",
        "damen", "geben", "sich", "und", "ihren", "putz", "zum", "besten", "und", "spielen", "ohne", "gage", "mit",
        "was", "traeumet", "ihr", "auf", "eurer", "dichterhoehe", "was", "macht", "ein", "volles", "haus", "euch",
        "froh", "beseht", "die", "goenner", "in", "der", "naehe", "halb", "sind", "sie", "kalt", "halb", "sind",
        "sie", "roh", "der", "nach", "dem", "schauspiel", "hofft", "ein", "kartenspiel", "der", "eine", "wilde",
        "nacht", "an", "einer", "dirne", "busen", "was", "plagt", "ihr", "armen", "toren", "viel", "zu", "solchem",
        "zweck", "die", "holden", "musen", "ich", "sag", "euch", "gebt", "nur", "mehr", "und", "immer", "immer",
        "mehr", "so", "koennt", "ihr", "euch", "vom", "ziele", "nie", "verirren", "sucht", "nur", "die", "menschen",
        "zu", "verwirren", "sie", "zu", "befriedigen", "ist", "schwer", "was", "faellt", "euch", "an",
        "entzueckung", "oder", "schmerzen", "dichter", "geh", "hin", "und", "such", "dir", "einen", "andern",
        "knecht", "der", "dichter", "sollte", "wohl", "das", "hoechste", "recht", "das", "menschenrecht", "das",
        "ihm", "natur", "vergoennt", "um", "deinetwillen", "freventlich", "verscherzen", "wodurch", "bewegt", "er",
        "alle", "herzen", "wodurch", "besiegt", "er", "jedes", "element", "ist", "es", "der", "einklang", "nicht",
        "der", "aus", "dem", "busen", "dringt", "und", "in", "sein", "herz", "die", "welt", "zuruecke", "schlingt",
        "wenn", "die", "natur", "des", "fadens", "ewge", "laenge", "gleichgueltig", "drehend", "auf", "die",
        "spindel", "zwingt", "wenn", "aller", "wesen", "unharmonsche", "menge", "verdriesslich", "durcheinander",
        "klingt", "wer", "teilt", "die", "fliessend", "immer", "gleiche", "reihe", "belebend", "ab", "dass", "sie",
        "sich", "rhythmisch", "regt", "wer", "ruft", "das", "einzelne", "zur", "allgemeinen", "weihe", "wo", "es",
        "in", "herrlichen", "akkorden", "schlaegt", "wer", "laesst", "den", "sturm", "zu", "leidenschaften",
        "wueten", "das", "abendrot", "im", "ernsten", "sinne", "gluehn", "wer", "schuettet", "alle", "schoenen",
        "fruehlingsblueten", "auf", "der", "geliebten", "pfade", "hin", "wer", "flicht", "die", "unbedeutend",
        "gruenen", "blaetter", "zum", "ehrenkranz", "verdiensten", "jeder", "art", "wer", "sichert", "den", "olymp",
        "vereinet", "goetter", "des", "menschen", "kraft", "im", "dichter", "offenbart", "lustige", "person", "so",
        "braucht", "sie", "denn", "die", "schoenen", "kraefte", "und", "treibt", "die", "dichtrischen",
        "geschaefte", "wie", "man", "ein", "liebesabenteuer", "treibt", "zufaellig", "naht", "man", "sich", "man",
        "fuehlt", "man", "bleibt", "und", "nach", "und", "nach", "wird", "man", "verflochten", "es", "waechst",
        "das", "glueck", "dann", "wird", "es", "angefochten", "man", "ist", "entzueckt", "nun", "kommt", "der",
        "schmerz", "heran", "und", "eh", "man", "sichs", "versieht", "ists", "eben", "ein", "roman", "lasst", "uns",
        "auch", "so", "ein", "schauspiel", "geben", "greift", "nur", "hinein", "ins", "volle", "menschenleben",
        "ein", "jeder", "lebts", "nicht", "vielen", "ists", "bekannt", "und", "wo", "ihrs", "packt", "da", "ists",
        "interessant", "in", "bunten", "bildern", "wenig", "klarheit", "viel", "irrtum", "und", "ein", "fuenkchen",
        "wahrheit", "so", "wird", "der", "beste", "trank", "gebraut", "der", "alle", "welt", "erquickt", "und",
        "auferbaut", "dann", "sammelt", "sich", "der", "jugend", "schoenste", "bluete", "vor", "eurem", "spiel",
        "und", "lauscht", "der", "offenbarung", "dann", "sauget", "jedes", "zaertliche", "gemuete", "aus", "eurem",
        "werk", "sich", "melancholsche", "nahrung", "dann", "wird", "bald", "dies", "bald", "jenes", "aufgeregt",
        "ein", "jeder", "sieht", "was", "er", "im", "herzen", "traegt", "noch", "sind", "sie", "gleich", "bereit",
        "zu", "weinen", "und", "zu", "lachen", "sie", "ehren", "noch", "den", "schwung", "erfreuen", "sich", "am",
        "schein", "wer", "fertig", "ist", "dem", "ist", "nichts", "recht", "zu", "machen", "ein", "werdender",
        "wird", "immer", "dankbar", "sein", "dichter", "so", "gib", "mir", "auch", "die", "zeiten", "wieder", "da",
        "ich", "noch", "selbst", "im", "werden", "war", "da", "sich", "ein", "quell", "gedraengter", "lieder",
        "ununterbrochen", "neu", "gebar", "da", "nebel", "mir", "die", "welt", "verhuellten", "die", "knospe",
        "wunder", "noch", "versprach", "da", "ich", "die", "tausend", "blumen", "brach", "die", "alle", "taeler",
        "reichlich", "fuellten", "ich", "hatte", "nichts", "und", "doch", "genug", "den", "drang", "nach",
        "wahrheit", "und", "die", "lust", "am", "trug", "gib", "ungebaendigt", "jene", "triebe", "das", "tiefe",
        "schmerzenvolle", "glueck", "des", "hasses", "kraft", "die", "macht", "der", "liebe", "gib", "meine",
        "jugend", "mir", "zurueck", "lustige", "person", "der", "jugend", "guter", "freund", "bedarfst", "du",
        "allenfalls", "wenn", "dich", "in", "schlachten", "feinde", "draengen", "wenn", "mit", "gewalt", "an",
        "deinen", "hals", "sich", "allerliebste", "maedchen", "haengen", "wenn", "fern", "des", "schnellen",
        "laufes", "kranz", "vom", "schwer", "erreichten", "ziele", "winket", "wenn", "nach", "dem", "heftgen",
        "wirbeltanz", "die", "naechte", "schmausend", "man", "vertrinket", "doch", "ins", "bekannte", "saitenspiel",
        "mit", "mut", "und", "anmut", "einzugreifen", "nach", "einem", "selbstgesteckten", "ziel", "mit", "holdem",
        "irren", "hinzuschweifen", "das", "alte", "herrn", "ist", "eure", "pflicht", "und", "wir", "verehren",
        "euch", "darum", "nicht", "minder", "das", "alter", "macht", "nicht", "kindisch", "wie", "man", "spricht",
        "es", "findet", "uns", "nur", "noch", "als", "wahre", "kinder", "direktor", "der", "worte", "sind", "genug",
        "gewechselt", "lasst", "mich", "auch", "endlich", "taten", "sehn", "indes", "ihr", "komplimente",
        "drechselt", "kann", "etwas", "nuetzliches", "geschehn", "was", "hilft", "es", "viel", "von", "stimmung",
        "reden", "dem", "zaudernden", "erscheint", "sie", "nie", "gebt", "ihr", "euch", "einmal", "fuer", "poeten",
        "so", "kommandiert", "die", "poesie", "euch", "ist", "bekannt", "was", "wir", "beduerfen", "wir", "wollen",
        "stark", "getraenke", "schluerfen", "nun", "braut", "mir", "unverzueglich", "dran", "was", "heute", "nicht",
        "geschieht", "ist", "morgen", "nicht", "getan", "und", "keinen", "tag", "soll", "man", "verpassen", "das",
        "moegliche", "soll", "der", "entschluss", "beherzt", "sogleich", "beim", "schopfe", "fassen", "er", "will",
        "es", "dann", "nicht", "fahren", "lassen", "und", "wirket", "weiter", "weil", "er", "muss", "ihr", "wisst",
        "auf", "unsern", "deutschen", "buehnen", "probiert", "ein", "jeder", "was", "er", "mag", "drum", "schonet",
        "mir", "an", "diesem", "tag", "prospekte", "nicht", "und", "nicht", "maschinen", "gebraucht", "das",
        "gross", "und", "kleine", "himmelslicht", "die", "sterne", "duerfet", "ihr", "verschwenden", "an", "wasser",
        "feuer", "felsenwaenden", "an", "tier", "und", "voegeln", "fehlt", "es", "nicht", "so", "schreitet", "in",
        "dem", "engen", "bretterhaus", "den", "ganzen", "kreis", "der", "schoepfung", "aus", "und", "wandelt",
        "mit", "bedaechtger", "schnelle", "vom", "himmel", "durch", "die", "welt", "zur", "hoelle"
    };
//#START STATIC
}
