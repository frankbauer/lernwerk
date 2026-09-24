public class Datentypen {
    // Der Wert wird automatisch in ein Objekt verpackt (z.B. int -> Integer). An dessen Klasse
    // lässt sich der ursprüngliche Datentyp ablesen.
    static String typ(Object wert) {
        String name = wert.getClass().getSimpleName();
        if (name.equals("Integer")) return "int";
        if (name.equals("Character")) return "char";
        if (name.equals("String")) return name;
        return name.toLowerCase();
    }

    public static void main(String[] args) {
        System.out.println(typ(3 + 4));                                            // Typ: int
        System.out.println(typ(3.0f - 4.0));                                       // Typ: double
        System.out.println(typ(3.0f - 4));                                         // Typ: float
        System.out.println(typ(5.0 / 4));                                          // Typ: double
        System.out.println(typ('A'));                                              // Typ: char
        System.out.println(typ("A"));                                              // Typ: String
        System.out.println(typ((byte)4 / (short)-200.0));                          // Typ: int
        System.out.println(typ(400L % 3));                                         // Typ: long
        System.out.println(typ(5.0 / 8 < 10));                                     // Typ: boolean
        System.out.println(typ(7 % 8 == 1 || false));                              // Typ: boolean
        System.out.println(typ((byte)12 * 'A'));                                   // Typ: int
        System.out.println(typ(34L * 3.0 > 0.2f && (8-3 == 5 || 6.0 % 3 == 4)));   // Typ: boolean
        System.out.println(typ("Hallo" + 3));                                      // Typ: String
        System.out.println(typ('A' + 'B'));                                        // Typ: int
    }
}
