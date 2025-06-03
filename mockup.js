// --- DATA STRUCTURE: Chapters and Exercises (auto-generated from uebersicht.html) ---
const chaptersData = [
    {
        title: "Einführung OOP",
        number: 1,
        exercises: [
            {
                title: "Universum",
                link: "00_einfuehrung/beispiel_universum.html",
                type: "lecture",
                description: "Erste Schritte in die objektorientierte Programmierung. Verstehe die Grundlagen von Klassen und Objekten anhand eines Universums-Modells.",
                concepts: ["Objekte", "Grundlagen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "MeinExperiment",
                link: "00_einfuehrung/sandkasten_print.html",
                type: "sandbox",
                description: "Experimentiere frei mit der Ausgabe von Text. Perfekt für erste Versuche und zum Ausprobieren von Code-Snippets.",
                concepts: ["Grundlagen", "Ausgabe"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 1
            },
            {
                title: "Formatierte Ausgabe",
                link: "00_einfuehrung/table.html",
                type: "exercice",
                description: "Lerne wie du Daten in Tabellenform und anderen formatierten Strukturen ausgibst. Wichtig für lesbare Programme.",
                concepts: ["Ausgabe"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            }
        ]
    },
    {
        title: "Variablen",
        number: 2,
        exercises: [
            {
                title: "MeineRechnung",
                link: "01_Variablen/sandkasten_42",
                type: "sandbox",
                description: "Experimentiere mit Variablen und einfachen Berechnungen. Verstehe wie Daten gespeichert und verarbeitet werden.",
                concepts: ["Variablen", "Operationen"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            },
            {
                title: "Tauschen",
                link: "01_Variablen/swap",
                type: "exercice",
                description: "Lerne den klassischen Tausch-Algorithmus kennen. Ein fundamentales Konzept für viele Programmieraufgaben.",
                concepts: ["Variablen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            }
        ]
    },
    {
        title: "Ausdrücke",
        number: 3,
        exercises: [
            {
                title: "Increment/Dekrement",
                link: "02_Operationen/beispiel_increment",
                type: "lecture",
                description: "Verstehe die Unterschiede zwischen Pre- und Post-Increment Operatoren. Wichtig für Schleifen und Zähler.",
                concepts: ["Operationen", "Variablen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "MeineOperatoren",
                link: "02_Operationen/sandkasten_mod",
                type: "sandbox",
                description: "Experimentiere mit verschiedenen mathematischen Operatoren, besonders mit dem Modulo-Operator für interessante Muster.",
                concepts: ["Operationen"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 3
            },
            {
                title: "Zahlen Addieren",
                link: "02_Operationen/addition.html",
                type: "exercice",
                description: "Einfache Addition von Zahlen. Ein grundlegendes Beispiel für mathematische Operationen in der Programmierung.",
                concepts: ["Operationen", "Variablen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 1
            },
            {
                title: "Rechtecksfläche",
                link: "02_Operationen/rechteck",
                type: "exercice",
                description: "Berechne die Fläche eines Rechtecks. Anwendung von Multiplikation in einem praktischen Kontext.",
                concepts: ["Operationen", "Variablen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            }
        ]
    },
    {
        title: "Datentypen",
        number: 4,
        exercises: [
            {
                title: "MeineDatentypen",
                link: "03_Datentypen/sandkasten_type",
                type: "sandbox",
                description: "Experimentiere mit verschiedenen Datentypen und deren Eigenschaften.",
                concepts: ["Datentypen"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            },
            {
                title: "Typumwandlung",
                link: "03_Datentypen/beispiel_cast",
                type: "lecture",
                description: "Lerne, wie man zwischen verschiedenen Datentypen umwandelt.",
                concepts: ["Datentypen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "MeinZufallsindex",
                link: "03_Datentypen/sandkasten_index",
                type: "sandbox",
                description: "Arbeite mit Zufallszahlen und Indexoperationen.",
                concepts: ["Datentypen", "Operationen"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            },
            {
                title: "Subtraktion und Multiplikation",
                link: "03_Datentypen/add_sub_mul.html",
                type: "exercice",
                description: "Subtrahiere und multipliziere Zahlen in einfachen Beispielen.",
                concepts: ["Datentypen", "Operationen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 1
            },
            {
                title: "Durchschnitt",
                link: "03_Datentypen/average",
                type: "exercice",
                description: "Berechne den Durchschnitt mehrerer Zahlen.",
                concepts: ["Datentypen", "Operationen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "Umrechnung von Temperatur",
                link: "03_Datentypen/temperatur",
                type: "exercice",
                description: "Rechne Temperaturen zwischen verschiedenen Skalen um.",
                concepts: ["Datentypen", "Operationen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            }
        ]
    },
    {
        title: "Methodenaufrufe",
        number: 5,
        exercises: [
            {
                title: "MeinMethodenaufruf",
                link: "04_Methodenaufrufe/sandkasten_flaeche/",
                type: "sandbox",
                description: "Experimentiere mit Methodenaufrufen und Übergabe von Parametern.",
                concepts: ["Methoden"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            },
            {
                title: "Kirschenessen (statisch)",
                link: "04_Methodenaufrufe/beispiel_floating/",
                type: "lecture",
                description: "Verstehe statische Methoden am Beispiel Kirschenessen.",
                concepts: ["Methoden", "Klassenmethoden"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "Roboter (statisch)",
                link: "04_Methodenaufrufe/beispiel_robots/",
                type: "lecture",
                description: "Arbeite mit statischen Methoden am Beispiel Roboter.",
                concepts: ["Methoden", "Klassenmethoden"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "Kirschenessen (Spieler, statisch)",
                link: "04_Methodenaufrufe/beispiel_floating_int/",
                type: "lecture",
                description: "Statische Methoden mit mehreren Spielern.",
                concepts: ["Methoden", "Klassenmethoden"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "Tankstellensuche",
                link: "04_Methodenaufrufe/tank_static_aufruf/",
                type: "exercice",
                description: "Finde die nächste Tankstelle mit Methodenaufrufen.",
                concepts: ["Methoden", "Operationen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            }
        ]
    },
    {
        title: "Objekte",
        number: 6,
        exercises: [
            {
                title: "Kirschenessen",
                link: "05_Objekte/beispiel_floating/",
                type: "lecture",
                description: "Verstehe Objekte und deren Methoden am Beispiel Kirschenessen.",
                concepts: ["Objekte", "Methoden"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "MeineInstanzen",
                link: "05_Objekte/sandkasten_instanzen/",
                type: "sandbox",
                description: "Erzeuge und verwalte eigene Instanzen von Objekten.",
                concepts: ["Objekte"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            },
            {
                title: "Roboter",
                link: "05_Objekte/beispiel_robots/",
                type: "lecture",
                description: "Arbeite mit Objekten am Beispiel Roboter.",
                concepts: ["Objekte"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "Roboter (Parameterkonstruktor)",
                link: "05_Objekte/beispiel_robots_constructor/",
                type: "lecture",
                description: "Nutze Konstruktoren mit Parametern für Objekte.",
                concepts: ["Objekte", "Konstruktoren"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "MeinePlaneten",
                link: "05_Objekte/sandkasten_sonnensystem/",
                type: "sandbox",
                description: "Erstelle ein eigenes Sonnensystem mit Objekten.",
                concepts: ["Objekte"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            },
            {
                title: "Vektorsumme",
                link: "05_Objekte/vec_sum/",
                type: "exercice",
                description: "Berechne die Summe von Vektoren.",
                concepts: ["Objekte", "Operationen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "2D Vektoren",
                link: "05_Objekte/vector/",
                type: "exercice",
                description: "Arbeite mit zweidimensionalen Vektoren.",
                concepts: ["Objekte", "Operationen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "Glühbirnen-Adapter",
                link: "05_Objekte/adapter",
                type: "exercice",
                description: "Entwickle einen Adapter für Glühbirnen.",
                concepts: ["Objekte"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "Labyrinth",
                link: "05_Objekte/labyrinth",
                type: "exercice",
                description: "Finde den Weg durch ein Labyrinth mit Objekten.",
                concepts: ["Objekte", "Algorithmen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 3
            }
        ]
    },
    {
        title: "Bedingungen",
        number: 7,
        exercises: [
            {
                title: "Glück",
                link: "06_Bedingungen/beispiel_luck/",
                type: "lecture",
                description: "Arbeite mit Zufall und Bedingungen.",
                concepts: ["Bedingungen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "MeinSolver",
                link: "06_Bedingungen/sandkasten_binom/",
                type: "sandbox",
                description: "Löse Aufgaben mit Bedingungen und binomischen Formeln.",
                concepts: ["Bedingungen", "Operationen"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            },
            {
                title: "2D Vektoren Sortieren",
                link: "06_Bedingungen/vector_sort/",
                type: "exercice",
                description: "Sortiere zweidimensionale Vektoren mit Bedingungen.",
                concepts: ["Bedingungen", "Objekte"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            }
        ]
    },
    {
        title: "Schleifen",
        number: 8,
        exercises: [
            {
                title: "Anpflanzen mit for",
                link: "07_Schleifen/beispiel_pflanzen_for/",
                type: "lecture",
                description: "Verwende for-Schleifen zum Anpflanzen.",
                concepts: ["Schleifen", "Operationen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "MeineZahlen",
                link: "07_Schleifen/sandkasten_odds/",
                type: "sandbox",
                description: "Experimentiere mit Zahlen und Schleifen.",
                concepts: ["Schleifen", "Operationen"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            },
            {
                title: "Anpflanzen mit while",
                link: "07_Schleifen/beispiel_pflanzen_while/",
                type: "lecture",
                description: "Verwende while-Schleifen zum Anpflanzen.",
                concepts: ["Schleifen", "Operationen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "Break und Continue",
                link: "07_Schleifen/beispiel_break/",
                type: "lecture",
                description: "Lerne den Einsatz von break und continue in Schleifen.",
                concepts: ["Schleifen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "Minimaler Luftdruck",
                link: "07_Schleifen/druck_extrema/",
                type: "exercice",
                description: "Finde den minimalen Luftdruck in einer Messreihe.",
                concepts: ["Schleifen", "Operationen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "Größte Zeitdifferenz in Messreihe",
                link: "07_Schleifen/groeste_zeitdifferenz/",
                type: "exercice",
                description: "Berechne die größte Zeitdifferenz in einer Messreihe.",
                concepts: ["Schleifen", "Operationen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "Durchschnittsdruck",
                link: "07_Schleifen/druck_durchschnitt/",
                type: "exercice",
                description: "Berechne den Durchschnittsdruck aus Messwerten.",
                concepts: ["Schleifen", "Operationen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            }
        ]
    },
    {
        title: "Klassenmethoden",
        number: 9,
        exercises: [
            {
                title: "MeineSumme",
                link: "08_Klassenmethoden/sandkasten_summe/",
                type: "sandbox",
                description: "Berechne Summen mit Klassenmethoden.",
                concepts: ["Klassenmethoden", "Operationen"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            },
            {
                title: "Überladen",
                link: "08_Klassenmethoden/beispiel_overload/",
                type: "lecture",
                description: "Lerne Methodenüberladung kennen.",
                concepts: ["Klassenmethoden", "Überladung"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            }
        ]
    },
    {
        title: "Klassenattribute",
        number: 10,
        exercises: [
            {
                title: "Mehrwertsteuer",
                link: "09_Klassenattribute/beispiel_steuer/",
                type: "lecture",
                description: "Berechne die Mehrwertsteuer mit Klassenattributen.",
                concepts: ["Klassenattribute", "Operationen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "MeineAttribute",
                link: "09_Klassenattribute/sandkasten_schwerkraft/",
                type: "sandbox",
                description: "Experimentiere mit Klassenattributen.",
                concepts: ["Klassenattribute"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            },
            {
                title: "Methodenaufrufe zählen",
                link: "09_Klassenattribute/aufrufzaehler/",
                type: "exercice",
                description: "Zähle, wie oft Methoden aufgerufen werden.",
                concepts: ["Klassenattribute", "Methoden"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            }
        ]
    },
    {
        title: "Eindimensionale Felder",
        number: 11,
        exercises: [
            {
                title: "Roboterfelder",
                link: "10_Arrays/beispiel_roboter/",
                type: "lecture",
                description: "Arbeite mit eindimensionalen Feldern am Beispiel Roboter.",
                concepts: ["Arrays", "Objekte"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "MeinFeld",
                link: "10_Arrays/sandkasten_zahlen/",
                type: "sandbox",
                description: "Experimentiere mit eindimensionalen Feldern.",
                concepts: ["Arrays"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            }
        ]
    },
    {
        title: "Felder (mehrdimensional)",
        number: 12,
        exercises: [
            {
                title: "MeineMatrix",
                link: "11_Arrays_nDim/sandkasten_matrix/",
                type: "sandbox",
                description: "Arbeite mit mehrdimensionalen Feldern.",
                concepts: ["Arrays"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            }
        ]
    },
    {
        title: "Instanzen",
        number: 13,
        exercises: [
            {
                title: "Wald on Stage",
                link: "12_Instanzen/beispiel_wald/",
                type: "lecture",
                description: "Arbeite mit Instanzen am Beispiel Wald on Stage.",
                concepts: ["Objekte"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            },
            {
                title: "Wald on Stage (schwer)",
                link: "12_Instanzen/beispiel_wald_schwer/",
                type: "lecture",
                description: "Eine schwierigere Variante von Wald on Stage.",
                concepts: ["Objekte"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 3
            },
            {
                title: "MeinBruch",
                link: "12_Instanzen/sandkasten_bruch/",
                type: "sandbox",
                description: "Experimentiere mit Brüchen als Instanzen.",
                concepts: ["Objekte"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            },
            {
                title: "Verwaltung von 2D-Vektoren",
                link: "12_Instanzen/vec2d_list",
                type: "exercice",
                description: "Verwalte eine Liste von 2D-Vektoren.",
                concepts: ["Objekte"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            }
        ]
    },
    {
        title: "Referenzen",
        number: 14,
        exercises: [
            {
                title: "MeineReferenzen",
                link: "13_Referenzen/sandkasten_deskrun/",
                type: "sandbox",
                description: "Experimentiere mit Referenzen.",
                concepts: ["Referenzen", "Objekte"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            },
            {
                title: "Konstante Referenzen",
                link: "13_Referenzen/beispiel_finalRef/",
                type: "lecture",
                description: "Lerne den Umgang mit konstanten Referenzen.",
                concepts: ["Referenzen", "Konstanten"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            }
        ]
    },
    {
        title: "Schnittstelle",
        number: 15,
        exercises: [
            {
                title: "MeinImplementierer",
                link: "14_Schnittstellen/sandkasten_interface/",
                type: "sandbox",
                description: "Implementiere eigene Schnittstellen.",
                concepts: ["Schnittstellen", "Objekte"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            },
            {
                title: "Mehrfachschnittstellen",
                link: "14_Schnittstellen/beispiel_multi/",
                type: "lecture",
                description: "Arbeite mit mehreren Schnittstellen.",
                concepts: ["Schnittstellen", "Objekte"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 2
            }
        ]
    },
    {
        title: "Rekursion",
        number: 16,
        exercises: [
            {
                title: "MeinFarbeimer",
                link: "16_Rekusrion/sandkasten_flood/",
                type: "sandbox",
                description: "Experimentiere mit rekursiven Algorithmen.",
                concepts: ["Rekursion", "Algorithmen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 3
            }
        ]
    },
    {
        title: "Collections",
        number: 17,
        exercises: [
            {
                title: "MeineNamen",
                link: "17_Collections/sandkasten_remove/",
                type: "sandbox",
                description: "Arbeite mit Collections und entferne Elemente.",
                concepts: ["Collections", "Objekte"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            },
            {
                title: "MeineFiguren",
                link: "17_Collections/sandkasten_lexi/",
                type: "sandbox",
                description: "Sortiere und verwalte Figuren in einer Collection.",
                concepts: ["Collections", "Objekte"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 2
            }
        ]
    },
    {
        title: "Graphen",
        number: 18,
        exercises: [
            {
                title: "Spezialdatenstruktur Graphen",
                link: "18_Graphen/beispiel_graph/",
                type: "lecture",
                description: "Lerne die Spezialdatenstruktur Graph kennen.",
                concepts: ["Graphen", "Datenstrukturen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 3
            },
            {
                title: "Graphen Ablaufen",
                link: "18_Graphen/beispiel_ablaufen/",
                type: "lecture",
                description: "Laufe einen Graphen ab und analysiere die Struktur.",
                concepts: ["Graphen", "Algorithmen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 3
            },
            {
                title: "Graphen Traversieren",
                link: "18_Graphen/beispiel_traversieren/",
                type: "lecture",
                description: "Traversiere einen Graphen mit verschiedenen Methoden.",
                concepts: ["Graphen", "Algorithmen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 3
            },
            {
                title: "Graphen Traversieren mit Ergebnis",
                link: "18_Graphen/beispiel_result/",
                type: "lecture",
                description: "Erhalte ein Ergebnis beim Traversieren eines Graphen.",
                concepts: ["Graphen", "Algorithmen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 3
            },
            {
                title: "Graphen Traversieren mit Zyklen",
                link: "18_Graphen/beispiel_cycle/",
                type: "lecture",
                description: "Behandle Zyklen beim Traversieren von Graphen.",
                concepts: ["Graphen", "Algorithmen"],
                hasSolution: true,
                hasExplanation: true,
                difficulty: 3
            },
            {
                title: "MeineSuche",
                link: "18_Graphen/sandkasten_needle/",
                type: "sandbox",
                description: "Suche nach Elementen in einem Graphen.",
                concepts: ["Graphen", "Algorithmen"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 3
            },
            {
                title: "MeineSumme",
                link: "18_Graphen/sandkasten_sum/",
                type: "sandbox",
                description: "Berechne Summen in einem Graphen.",
                concepts: ["Graphen", "Algorithmen"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 3
            }
        ]
    },
    {
        title: "Zahlen",
        number: 19,
        exercises: [
            {
                title: "Binär zu Dezimal",
                link: "19_Zahlen/todec/",
                type: "tool",
                description: "Wandle Binärzahlen in Dezimalzahlen um.",
                concepts: ["Zahlen"],
                hasSolution: false,
                hasExplanation: false,
                difficulty: 1
            }
        ]
    }
];
